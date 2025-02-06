import { DurableObject } from "cloudflare:workers";
import { resultsPage } from "./results.js";

type Data = {
  activePoll: string | null;
  polls: { [key: string]: Poll };
  wordCloudResults: { pollId: string; word: string }[];
  rankResults: { optionId: string; rank: number }[];
};
type Action =
  | { action: "writePoll"; pollId: string; newPoll: Poll }
  | {
      action: "writeOptionText";
      pollId: string;
      optionId: string;
      optionText: string;
    }
  | { action: "writeRankTitle"; pollId: string; title: string }
  | { action: "voteWordCloud"; pollId: string; word: string }
  | { action: "voteRank"; optionId: string; rank: string }
  | { action: "setActivePoll"; pollId: string | null }
  | { action: "addOption"; pollId: string }
  | { action: "removeOption"; pollId: string; optionId: string }
  | { action: "removePoll"; pollId: string };
type Poll =
  | { type: "wordCloud"; question: string }
  | { type: "rank"; title: string; options: { [key: string]: string } };

function respond(text: string) {
  return new Response(
    `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>PollWell</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, 
user-scalable=no">
<!--<meta http-equiv="refresh" content="5" />-->
          <style>
            * {
              font-family: sans-serif;
              text-align: center;
              
            }
            .next_button {
              margin-top: 50px;
              font-size: 16px;
              padding: 10px;
              background-color: #4DADE3;
              color: white;
              border: none;
            }
            .active_poll {
              color: green;
            }
            .poll_type {
              font-size: 12px;
              font-style: italic;
            }
            input {
              min-width: 300px;
              padding: 10px;
              margin: 2px;
            }
            p {
              font-size: 12px;
            }
            .admin_poll {
              border: 5px solid black;
              margin: 10px;
              padding: 10px;
            }
            .admin_poll.active_poll_div {
              border: 5px solid green;
            }
            .admin_word_cloud {
            }
            .admin_rank {
            }
            .blue {
              color: #4DADE3;
            }
            .dark_blue {
              color: #003961;
            }
            .title {
              font-size: 50px;
            }
            .blue_button {
              background-color: #4DADE3;
              color: white;
              padding: 0px 10px;
              line-height: 50px;
              border: none;
              margin: 0px;
            }
            .rank_buttons {
              display: grid;
              grid-template-columns: repeat(8, 1fr);
              align-items: center;
            }
          </style>
        </head>
        <body>
          
          <h1 class="title"><span class="dark_blue">Poll</span><span class="blue">Well</span></h1>
          ${text}
          
        </body>
        </html>
    `,
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}

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
  async fetch(request, env, ctx): Promise<Response> {
    const newUrl = new URL(request.url);
    const eventId = newUrl.pathname;
    const urlParams = new URLSearchParams(newUrl.searchParams);
    let id: DurableObjectId = env.MY_DURABLE_OBJECT.idFromName(eventId);
    let stub = env.MY_DURABLE_OBJECT.get(id);

    if (request.method === "POST") {
      const body = (await request.json()) as Action;
      switch (body.action) {
        case "writePoll":
          return respond(await stub.writePoll(body.pollId, body.newPoll));
        case "voteWordCloud":
          return respond(
            await stub.voteWordCloud(body.pollId, body.word.toLocaleLowerCase())
          );
        case "voteRank":
          return respond(await stub.voteRank(body.optionId, body.rank));
        case "setActivePoll":
          return respond(await stub.setActivePoll(body.pollId));
        case "addOption":
          return respond(await stub.addOption(body.pollId));
        case "writeOptionText":
          return respond(
            await stub.writeOptionText(
              body.pollId,
              body.optionId,
              body.optionText
            )
          );
        case "writeRankTitle":
          return respond(await stub.writeRankTitle(body.pollId, body.title));
        case "removeOption":
          return respond(await stub.removeOption(body.pollId, body.optionId));
        case "removePoll":
          return respond(await stub.removePoll(body.pollId));
        default:
          return respond("Error: invalid action");
      }
    }

    if (request.method === "GET") {
      const data: Data = await stub.get();

      if (urlParams.has("admin")) {
        return respond(`
          <div id="polls">
            ${Object.entries(data.polls)
              .map(([id, poll]) =>
                poll.type === "wordCloud"
                  ? `
                  <div class="admin_poll admin_word_cloud ${
                    data.activePoll === id ? "active_poll_div" : ""
                  }">
                    <p class="poll_type">WordCloud (people get to add free text options</p>
                    ${
                      data.activePoll === id
                        ? `<p class="active_poll">Active poll</p>`
                        : `<button onClick="
                          fetch(window.location.href, {
                            method:'POST',
                            body: JSON.stringify({
                              action:'setActivePoll',
                              pollId:'${id}'
                            })
                          }).then(() => location.reload());
                        ">Set as active</button>`
                    }
                    <button onClick="
                      fetch(window.location.href, {
                        method:'POST',
                        body: JSON.stringify({
                          action:'removePoll',
                          pollId:'${id}'
                        })
                      }).then(() => location.reload())
                    ">Remove poll</button>
                    <h3>Poll question:</h3>
                    <div><input value="${
                      poll.question
                    }" placeholder="Question" onChange="
                      fetch(window.location.href, {
                        method:'POST',
                        body: JSON.stringify({
                          action:'writePoll',
                          pollId:'${id}',
                          newPoll:{
                            type:'wordCloud',
                            question:this.value
                          }
                        })
                      });
                    "></div>
                    
                  </div>
                `
                  : poll.type === "rank"
                  ? `
                  <div class="admin_poll admin_rank ${
                    data.activePoll === id ? "active_poll_div" : ""
                  }">  
                  <p class="poll_type">Rank (ranking 1-6)</p>
                  ${
                    data.activePoll === id
                      ? `<p class="active_poll">Active poll</p>`
                      : `<button onClick="
                          fetch(window.location.href, {
                            method:'POST',
                            body: JSON.stringify({
                              action:'setActivePoll',
                              pollId:'${id}'
                            })
                          }).then(() => location.reload());
                        ">Set as active</button>`
                  }
                    <button onClick="
                      fetch(window.location.href, {
                        method:'POST',
                        body: JSON.stringify({
                          action:'removePoll',
                          pollId:'${id}'
                        })
                      }).then(() => location.reload())
                    ">Remove poll</button>
                    <h3>Poll title:</h3>
                    <div><input id="${id}" value="${
                      poll.title
                    }" placeholder="Poll title"
                    onChange="
                      fetch(window.location.href, {
                        method:'POST',
                        body: JSON.stringify({
                          action:'writeRankTitle',
                          pollId:'${id}',
                          title:this.value
                        })
                      });
                    "></div>
                    <p>Stuff to rank:</p>
                    ${Object.entries(poll.options)
                      .map(
                        ([optionId, optionText]) => `
                        <div><input id="${optionId}" class=".option-${id}" value="${optionText}" 
                        onChange="
                          fetch(window.location.href, {
                            method:'POST',
                            body: JSON.stringify({
                              action:'writeOptionText',
                              pollId:'${id}',
                              optionId:'${optionId}',
                              optionText:this.value
                            })
                          });
                        " placeholder="Option text"><button onClick="
                          fetch(window.location.href, {
                            method:'POST',
                            body: JSON.stringify({
                              action:'removeOption',
                              pollId:'${id}',
                              optionId:'${optionId}'
                            })
                          }).then(() => location.reload())
                        ">X</button></div>
                      `
                      )
                      .join("")}
                    <button onClick="
                      fetch(window.location.href, {
                        method:'POST',
                        body: JSON.stringify({
                          action:'addOption',
                          pollId:'${id}',
                        })
                      }).then(() => location.reload())
                    ">Add option</button>
                      
                  </div>
                `
                  : ""
              )
              .join("")}
          </div>
          <button onClick="
            fetch(window.location.href, {
              method:'POST',
              body: JSON.stringify({
                action:'writePoll',
                pollId:Date.now().toString(),
                newPoll:{
                  type:'wordCloud',
                  question:''
                }
              })
            }).then(() => location.reload());
          ">Add WordCloud Poll</button>
          <button onClick="
            fetch(window.location.href, {
              method:'POST',
              body: JSON.stringify({
                action:'writePoll',
                pollId:Date.now().toString(),
                newPoll:{
                  type:'rank',
                  title:'',
                  options:{},
                }
              })
            }).then(() => location.reload());
          ">Add Rank Poll</button>
          `);
      }

      if (urlParams.has("data")) {
        return new Response(JSON.stringify(data), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      }

      if (data.activePoll === null) {
        return respond(
          `<h3>No active poll at the moment</h3><div><button class="next_button" onClick="location.reload()">Till nästa poll (om den är tillgänglig)</button></div>`
        );
      }

      const poll = data.polls[data.activePoll];

      if (poll.type === "wordCloud" && urlParams.has("result")) {
        return new Response(
          resultsPage.replace("<insert-data-here>", JSON.stringify(data)),
          {
            headers: {
              "Content-Type": "text/html",
            },
          }
        );
      }
      if (poll.type === "rank" && urlParams.has("result")) {
        return new Response("Rank results", {
          headers: {
            "Content-Type": "text/html",
          },
        });
      }

      if (poll.type === "wordCloud") {
        return respond(
          `
      <h2>${poll.question}</h2>
      <div style="display:grid; grid-template-columns: 1fr min-content; gap: 10px;"><input style="text-align:start; font-size: 20px; line-height: 30px; margin: 0px; background-color: #efefef; border: 0px;" onKeyDown="if (event.key === 'Enter') {document.querySelector('button').click()}" placeholder="Your response" autofocus>
      <button 
          style="font-size: 16px;"
        class="blue_button"
        onClick="
        console.log(document.querySelector('input').value, window.location.href);
        if (document.querySelector('input').value.trim() !== '') {
        // replace everything that not a-z, A-Z, 0-9 with empty string. Space is allowed
        fetch(window.location.href, {
          method:'POST',
          body: JSON.stringify({
            action:'voteWordCloud',
            pollId:'${data.activePoll}',
            word:document.querySelector('input').value.trim().replaceAll(/[^a-zA-Z0-9 ]/g, '')
          })
        }).then(() => {document.querySelector('input').value = ''; document.querySelector('input').focus()});
        }
      ">Submit</button></div>
      <div><button class="next_button" onClick="location.reload()">Till nästa poll (om den är tillgänglig)</button></div>
      `
        );
      }

      if (poll.type === "rank") {
        return respond(
          `
      <h2>${poll.title}</h2>
          ${Object.entries(poll.options)
            .map(
              ([id, optionText]) => `<h3>${optionText}</h3>
              <p style="display:none; line-height:60px;" id="thankyou${id}">Thank you for voting!</p>
      <div id="option${id}" class="rank_buttons">
              <script>console.log('eh');
              if (localStorage.getItem('${id}') !== null) {
                document.querySelector('#option${id}').style.display = 'none'
                document.querySelector('#thankyou${id}').style.display = 'block'
              }</script>
              <span>Worst</span>
              ${Array.from({ length: 6 })
                .map(
                  (_, index) => `
                <button class="blue_button" onClick="
                  fetch(window.location.href, {
                    method:'POST',
                    body: JSON.stringify({
                      action:'voteRank',
                      optionId:'${id}',
                      rank:'${index + 1}'
                    })
                  }).then(() => {localStorage.setItem('${id}', '${
                    index + 1
                  }');location.reload();});
                ">${index + 1}</button>
              `
                )
                .join("")}
                <span>Best</span>

      </div>
            `
            )
            .join("")}
          <div><button class="next_button" onClick="location.reload()">Till nästa poll (om den är tillgänglig)</button></div>
    `
        );
      }
    }

    return respond("Hello, World!");
  },
} satisfies ExportedHandler<Env>;
