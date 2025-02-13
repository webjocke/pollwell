import { DurableObject } from "cloudflare:workers";
import { snippets } from "./snippets";
import { html, json, ok } from "./utils";
import { Data, Poll, Action } from "./types";

import wordCloudResultsHtml from "./html-files/word-cloud-results-page.html";
import wordCloudHtml from "./html-files/word-cloud.html";
import noActivePollHtml from "./html-files/no-active-poll.html";
import rankHtml from "./html-files/rank.html";
import rankResultsHtml from "./html-files/rank-results-page.html";
import adminHtml from "./html-files/admin.html";

export class MyDurableObject extends DurableObject<Env> {
  public data: Data = {
    activePoll: null,
    polls: {},
    wordCloudResults: [],
    rankResults: [],
  };

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);

    this.ctx.blockConcurrencyWhile(async () => {
      let value: any = await this.ctx.storage.get("value");
      if (value) this.data = JSON.parse(value) as Data;
    });
  }

  async saveToStorage() {
    await this.ctx.storage.put("value", JSON.stringify(this.data));
  }

  async get(): Promise<Data> {
    return this.data;
  }

  async writePoll(pollId: string, newPoll: Poll): Promise<string> {
    this.data.polls[pollId] = newPoll;
    await this.saveToStorage();
    return "Success";
  }
  async voteWordCloud(pollId: string, word: string): Promise<string> {
    this.data.wordCloudResults.push({ pollId, word });
    await this.saveToStorage();
    return "Success";
  }
  async voteRank(optionId: string, rank: string): Promise<string> {
    this.data.rankResults.push({
      optionId,
      rank: parseInt(rank),
    });
    await this.saveToStorage();
    return "Success";
  }
  async setActivePoll(pollId: string | null): Promise<string> {
    this.data.activePoll = pollId;
    await this.saveToStorage();
    return "Success";
  }
  async addOption(pollId: string): Promise<string> {
    const poll = this.data.polls[pollId];
    if (poll.type === "rank") {
      poll.options[Date.now().toString()] = "";
    }
    await this.saveToStorage();
    return "Success";
  }
  async writeOptionText(
    pollId: string,
    optionId: string,
    optionText: string
  ): Promise<string> {
    const poll = this.data.polls[pollId];
    if (poll.type === "rank") {
      poll.options[optionId] = optionText;
    }
    await this.saveToStorage();
    return "Success";
  }
  async writeRankTitle(pollId: string, title: string): Promise<string> {
    const poll = this.data.polls[pollId];
    if (poll.type === "rank") {
      poll.title = title;
    }
    await this.saveToStorage();
    return "Success";
  }
  async removeOption(pollId: string, optionId: string): Promise<string> {
    const poll = this.data.polls[pollId];
    if (poll.type === "rank") {
      delete poll.options[optionId];
    }
    await this.saveToStorage();
    return "Success";
  }
  async removePoll(pollId: string): Promise<string> {
    delete this.data.polls[pollId];
    if (this.data.activePoll === pollId) {
      this.data.activePoll = null;
    }
    await this.saveToStorage();
    return "Success";
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    const eventId = url.pathname;
    const urlParams = new URLSearchParams(url.searchParams);
    let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(eventId);
    let stub = env.MY_DURABLE_OBJECT.get(id);

    if (request.method === "POST") {
      const body = (await request.json()) as Action;
      switch (body.action) {
        case "writePoll":
          return ok(await stub.writePoll(body.pollId, body.newPoll));
        case "voteWordCloud":
          return ok(
            await stub.voteWordCloud(body.pollId, body.word.toLocaleLowerCase())
          );
        case "voteRank":
          return ok(await stub.voteRank(body.optionId, body.rank));
        case "setActivePoll":
          return ok(await stub.setActivePoll(body.pollId));
        case "addOption":
          return ok(await stub.addOption(body.pollId));
        case "writeOptionText":
          return ok(
            await stub.writeOptionText(
              body.pollId,
              body.optionId,
              body.optionText
            )
          );
        case "writeRankTitle":
          return ok(await stub.writeRankTitle(body.pollId, body.title));
        case "removeOption":
          return ok(await stub.removeOption(body.pollId, body.optionId));
        case "removePoll":
          return ok(await stub.removePoll(body.pollId));
        default:
          return ok("Error: invalid action");
      }
    }

    if (request.method === "GET" && urlParams.has("data")) {
      return json(await stub.get());
    }

    if (request.method === "GET" && urlParams.has("admin")) {
      const data: Data = await stub.get();
      return html(adminHtml, {
        polls: Object.entries(data.polls).map(([id, poll]) => ({
          id,
          poll,
          options:
            poll.type === "rank" &&
            Object.entries(poll.options).map(([optionId, optionText]) => ({
              optionId,
              optionText,
            })),
          isWordCloud: poll.type === "wordCloud",
          isRank: poll.type === "rank",
          isActive: data.activePoll === id,
          isInActive: data.activePoll !== id,
          activeClass: data.activePoll === id ? "active_poll_div" : "",
        })),
        snippets,
      });
    }

    const data: Data = await stub.get();
    if (data.activePoll === null || data.polls[data.activePoll] === undefined) {
      return html(noActivePollHtml, { snippets });
    }

    const poll = data.polls[data.activePoll];
    if (
      request.method === "GET" &&
      urlParams.has("result") &&
      poll.type === "wordCloud"
    ) {
      return html(wordCloudResultsHtml, { data: JSON.stringify(data) });
    }

    if (
      request.method === "GET" &&
      urlParams.has("result") &&
      poll.type === "rank"
    ) {
      return html(rankResultsHtml, {
        activePoll: data.activePoll,
        poll,
        options: Object.entries(poll.options).map(([id, optionText]) => {
          const totalVotes = data.rankResults.filter(
            (r) => r.optionId === id
          ).length;
          const averageRank = (
            data.rankResults
              .filter((r) => r.optionId === id)
              .reduce((acc, r) => acc + r.rank, 0) / totalVotes
          ).toFixed(1);

          const maxVotes = Math.max(
            data.rankResults.filter((r) => r.optionId === id && r.rank === 1)
              .length,
            data.rankResults.filter((r) => r.optionId === id && r.rank === 2)
              .length,
            data.rankResults.filter((r) => r.optionId === id && r.rank === 3)
              .length,
            data.rankResults.filter((r) => r.optionId === id && r.rank === 4)
              .length,
            data.rankResults.filter((r) => r.optionId === id && r.rank === 5)
              .length,
            data.rankResults.filter((r) => r.optionId === id && r.rank === 6)
              .length
          );
          return {
            id,
            optionText,
            totalVotes,
            totalVotesSuffix: totalVotes !== 1 ? "er" : "",
            votes: Array.from({ length: 6 }).map((_, index) => {
              const votes = data.rankResults.filter(
                (r) => r.optionId === id && r.rank === index + 1
              ).length;
              const procentage = Math.max((votes / maxVotes) * 100, 5);
              return {
                votes,
                procentage: procentage ? procentage : 5,
              };
            }),
            averageRank,
            averageProcentageSize:
              ((parseFloat(averageRank) / 6) * 100 || 0) - 100 / 6 / 2,
            showAverage: averageRank !== "NaN",
          };
        }),
        totalResponsesForRankPoll: data.rankResults.filter((r) =>
          Object.keys(poll.options).includes(r.optionId)
        ).length,
        optionIds: Object.keys(poll.options),
        optionIdsLength: Object.keys(poll.options).length,
        allCombinedQuestions: Object.values(poll.options).join(""),
        snippets,
      });
    }

    if (request.method === "GET" && poll.type === "wordCloud") {
      return html(wordCloudHtml, {
        activePoll: data.activePoll,
        question: poll.question,
        snippets,
      });
    }

    if (request.method === "GET" && poll.type === "rank") {
      return html(rankHtml, {
        options: Object.entries(poll.options).map(([id, optionText]) => ({
          id,
          optionText,
          buttons: Array.from({ length: 6 }).map((_, i) => i + 1),
        })),
        poll,
        snippets,
      });
    }

    return html(noActivePollHtml);
  },
} satisfies ExportedHandler<Env>;
