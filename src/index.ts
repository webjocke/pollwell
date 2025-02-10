import { DurableObject } from "cloudflare:workers";
import { wordCloudResultsPage } from "./wordCloudResultsPage.js";

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
          <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
          <style>

            @font-face {
              font-family: 'AkhandSoft-Bold';
              src: url('/AkhandSoft-Bold.otf') format('opentype');
            }
            @font-face {
              font-family: 'Poppins-Regular';
              src: url('/Poppins-Regular.otf') format('opentype');
            }

            * {
              font-family: sans-serif;
              text-align: center;
              color: rgb(1, 57, 97);
              font-family: 'Poppins-Regular';
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: 'AkhandSoft-Bold';
            }
            .title {
              font-size: 50px;
              color: rgb(1, 57, 97);
              font-family: 'AkhandSoft-Bold';
            }
            .title span {
              font-family: 'AkhandSoft-Bold';
            } 
            body {
              padding-bottom: 60px;
            }
            .active_poll {
              color: green;
              font-size: 20px;
              font-family: 'AkhandSoft-Bold';
              padding: 0px 10px;
              margin: 0px;
              line-height: 50px;
            }
            .active_poll:hover {
              cursor: pointer;
            }
            .set_active {
              position: absolute;
              top: 10px;
              left: 10px;
              font-size: 16px !important;
            }
            .poll_type {
              font-size: 12px;
              font-style: italic;
            }
            
            p {
              font-size: 12px;
            }
            .admin_poll {
              background-color: rgb(246, 247, 250);
              border-radius: 40px;
              padding: 30px 20px;
              margin: 10px;
              padding: 10px;
              position: relative;
              max-width: 1000px;
              margin: 10px auto 10px auto;
            }
            .admin_poll.active_poll_div {
              background-color:rgb(236, 255, 235);
            }
            .admin_word_cloud {
            }
            .admin_rank {
            }
            .blue {
              color: #4DADE3;
            }
            .dark_blue {
              color: rgb(1, 57, 97);
            }
            

            input {
              /*min-width: 300px;*/
              padding: 10px;
              margin: 2px;
              min-width: 300px;
              outline-color: #4DADE3;
            }
            .freetext_input {
              min-width: auto;
              text-align:center;
              font-size: 16px;
              line-height: 30px;
              margin: 0px;
              background-color: #efefef;
              border: 1px solid #cccccc;
              width: 100%;
              box-sizing: border-box;
              border-radius: 40px;
            }
            .admin_poll_title_input {
              background-color: transparent;
              border: none;
              border-bottom: 1px solid #cccccc;
              font-size: 20px;
              width: 70%;
            }
            .admin_poll_title_input:focus {
              background-color: white;
              border: 1px solid #cccccc;
            }



            .blue_button {
              background-color: #4DADE3;
              color: white;
              padding: 0px 10px;
              line-height: 50px;
              border: none;
              margin: 0px;
              font-size: 16px;
            }
            .border_radius {
              border-radius: 40px;
            }



            .scale_section {
              background-color: #4DADE3;
              color: white;
              padding: 0px 0px;
              line-height: 50px;
              border: none;
              margin: 0px;
              width: 100%;
              position: relative;
              z-index: 10;
            }
            .scale_section div {
              position: absolute;
              bottom: 0px;
              left: 0px;
              background-color: rgb(221, 85, 16);
              width: 100%;
              transform: translateY(-100%);
            }
            .scale {
              z-index: 11;
              border-right: 5px solid rgb(1, 57, 97);
              box-sizing: border-box;
              padding: 0px 0px;
              line-height: 180px;
              text-align: end;
              color: black;
              position: absolute;
              top: -30px;
              left: 0px;
              font-size: 20px;
            }
            .scale span {
              display: block;
              position: absolute;
              bottom: 0px;
              right: 5px;
              line-height: 20px;
            }
            .scale_div {
              display: grid;
              grid-template-columns: min-content 1fr min-content;
              align-items: center;
              position: relative;
              margin-bottom: 40px;
              margin-top: 50px;
            }
            .scale_number {
              font-size: 20px;
              padding: 0px 15px;
              text-align: center;
            }
            .scale_range {
              display: grid;
              grid-template-columns: repeat(6, 1fr);
              align-items: center;
              position: relative;
              width: 100%;
            }
            .option {
              font-size: 25px;
              margin: 35px 0px 15px 0px;
            }
            .option span {
              font-size: 16px;
              font-family: 'Poppins-Regular';
            }
            .rank_buttons {
              display: grid;
              grid-template-columns: 14px repeat(6, 1fr) 14px;
              align-items: center;
              gap: 5px;
            }
            .rank_buttons span {
              /* Rotate 90 degrees */
              transform: rotate(-90deg);
              line-height: 30px;
              font-size: 14px;
              user-select: none;
              -webkit-user-select: none;
              -moz-user-select: none;
              -ms-user-select: none;
              justify-self: center;
            }

            .box {
              background-color: rgb(246, 247, 250);
              border-radius: 40px;
              padding: 30px 20px;
              margin-bottom: 10px;
            }
            .box h3, .box h2 {
              margin-top: 0px;
            }
            .thank_you {
              display:none;
              line-height:50px;
              font-size: 16px;
              margin: 0px;
            }


            .next_button_container {
              margin-top: 50px;
            }
            .next_button {
              color: #4DADE3;
              padding: 0px 10px;
              line-height: 50px;
              border: none;
              margin: 0px;
              background-color: transparent;
              font-size: 20px;
              font-family: 'AkhandSoft-Bold';
            }
            .next_button_container span {
              font-size: 12px;
              font-family: 'Poppins-Regular';
              display: block;
            }
            .next_button.red {
              color: red;
            }
            .next_button:hover {
              cursor: pointer;
            }
            .next_button.remove_poll {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 16px;
            }
          



            .smaller {
              font-size: 30px;
            }
          </style>
        </head>
        <body>
          
          <h1 class="title"><span class="dark_blue">Poll</span><span class="blue">Well</span><span class="dark_blue smaller">.se</span></h1>
          ${text}
          
        </body>
        </html>
    `,
    {
      headers: { "Content-Type": "text/html" },
    }
  );
}

const getNextButton = () => `
  <div class="next_button_container"><button class="next_button" onClick="location.reload()">Till nästa poll →</button><span>(om den är tillgänglig)</span></div>
`;

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
                    <p class="poll_type">Typ: WordCloud (användare får lägga till fritext svar)</p>
                    ${
                      data.activePoll === id
                        ? `<p class="active_poll set_active" onClick="
                          fetch(window.location.href, {
                            method:'POST',
                            body: JSON.stringify({
                              action:'setActivePoll',
                              pollId:null
                            })
                          }).then(() => location.reload());
                        ">Aktiv poll ✓</p>`
                        : `<button class="next_button set_active" style="display:block; margin: auto;" onClick="
                          fetch(window.location.href, {
                            method:'POST',
                            body: JSON.stringify({
                              action:'setActivePoll',
                              pollId:'${id}'
                            })
                          }).then(() => location.reload());
                        ">Sätt som aktiv</button>`
                    }
                    <button class="next_button red remove_poll" onClick="
                      fetch(window.location.href, {
                        method:'POST',
                        body: JSON.stringify({
                          action:'removePoll',
                          pollId:'${id}'
                        })
                      }).then(() => location.reload())
                    ">Ta bort</button>
                    <div><input class="admin_poll_title_input" value="${
                      poll.question
                    }" placeholder="Poll fråga" onChange="
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
                  <p class="poll_type">Typ: Rank (ranka 1-6)</p>
                  ${
                    data.activePoll === id
                      ? `<p class="active_poll set_active" onClick="
                          fetch(window.location.href, {
                            method:'POST',
                            body: JSON.stringify({
                              action:'setActivePoll',
                              pollId:null
                            })
                          }).then(() => location.reload());
                        ">Aktiv poll ✓</p>`
                      : `<button class="next_button set_active" style="display:block; margin: auto;" onClick="
                          fetch(window.location.href, {
                            method:'POST',
                            body: JSON.stringify({
                              action:'setActivePoll',
                              pollId:'${id}'
                            })
                          }).then(() => location.reload());
                        ">Sätt som aktiv</button>`
                  }
                    <button class="next_button red remove_poll" onClick="
                      fetch(window.location.href, {
                        method:'POST',
                        body: JSON.stringify({
                          action:'removePoll',
                          pollId:'${id}'
                        })
                      }).then(() => location.reload())
                    ">Ta bort</button>
                    <div><input id="${id}" class="admin_poll_title_input" value="${
                      poll.title
                    }" placeholder="Poll titel (valfritt)"
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
                    <p>Uttalanden to rösta på:</p>
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
                        " placeholder="T.ex. Jag gillar dagens mat..."><button onClick="
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
                    <button class="next_button" onClick="
                      fetch(window.location.href, {
                        method:'POST',
                        body: JSON.stringify({
                          action:'addOption',
                          pollId:'${id}',
                        })
                      }).then(() => location.reload())
                    ">Lägg till alternativ +</button>
                      
                  </div>
                `
                  : ""
              )
              .join("")}
          </div>
          <button class="next_button" onClick="
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
          ">Lägg till WordCloud poll</button>
          <button class="next_button" onClick="
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
          ">Lägg till Rank poll</button>
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
          `<h3>Det finns ingen aktiv poll just nu.</h3>
          ${getNextButton()}`
        );
      }

      const poll = data.polls[data.activePoll];

      if (poll.type === "wordCloud" && urlParams.has("result")) {
        return new Response(
          wordCloudResultsPage.replace(
            "<insert-data-here>",
            JSON.stringify(data)
          ),
          {
            headers: {
              "Content-Type": "text/html",
            },
          }
        );
      }
      if (poll.type === "rank" && urlParams.has("result")) {
        const poll = data.polls[data.activePoll];
        if (!poll || poll.type !== "rank") {
          return respond("Error: no rank poll found");
        }
        const optionIds = Object.keys(poll.options);
        const totalResponsesForRankPoll = data.rankResults.filter((r) =>
          optionIds.includes(r.optionId)
        ).length;

        return respond(
          `<h1 style="margin-bottom: 35px;">${poll.title}</h1>
            ${Object.entries(poll.options)
              .map(([id, optionText]) => {
                const totalVotes = data.rankResults.filter(
                  (r) => r.optionId === id
                ).length;
                const averageRank = (
                  data.rankResults
                    .filter((r) => r.optionId === id)
                    .reduce((acc, r) => acc + r.rank, 0) / totalVotes
                ).toFixed(1);
                const procentage = (parseFloat(averageRank) / 6) * 100 || 0;

                const votesFor1 = data.rankResults.filter(
                  (r) => r.optionId === id && r.rank === 1
                ).length;
                const votesFor2 = data.rankResults.filter(
                  (r) => r.optionId === id && r.rank === 2
                ).length;
                const votesFor3 = data.rankResults.filter(
                  (r) => r.optionId === id && r.rank === 3
                ).length;
                const votesFor4 = data.rankResults.filter(
                  (r) => r.optionId === id && r.rank === 4
                ).length;
                const votesFor5 = data.rankResults.filter(
                  (r) => r.optionId === id && r.rank === 5
                ).length;
                const votesFor6 = data.rankResults.filter(
                  (r) => r.optionId === id && r.rank === 6
                ).length;
                const maxVotes = Math.max(
                  votesFor1,
                  votesFor2,
                  votesFor3,
                  votesFor4,
                  votesFor5,
                  votesFor6
                );

                return `<div class="box" style="max-width: 1200px; margin: 0px auto 10px auto;">
                  <h2 class="option">${optionText}</h2>
                  <span style="display:block; margin-bottom: 15px">${totalVotes} röst${
                  totalVotes !== 1 ? "er" : ""
                }.</span>
                  <div class="scale_div">
                    <span class="scale_number">1</span>
                    <div class="scale_range">

                      ${Array.from({ length: 6 })
                        .map((_, index) => {
                          const votes = data.rankResults.filter(
                            (r) => r.optionId === id && r.rank === index + 1
                          ).length;
                          const procentage = Math.max(
                            (votes / maxVotes) * 100,
                            5
                          );
                          return `<div class="scale_section" style="line-height: ${
                            procentage ? procentage : 5
                          }px">&nbsp;</div>`;
                        })
                        .join("")}
                      ${
                        averageRank !== "NaN"
                          ? `<span class="scale" style="width: ${
                              procentage - 100 / 6 / 2
                            }%;">&nbsp;<span>Genomsnitt ${averageRank}</span></span>`
                          : ""
                      }
                    </div>
                    <span class="scale_number">6</span>
                  </div>
              </div>
              `;
              })
              .join("")}
            <script>
              async function checkForUpdate() {
                  const url = new URL(window.location.href);
                  const baseUrl = url.origin + url.pathname+"?data"; 
                  const response = await fetch(baseUrl);
                  const newContent = await response.json();

                  const activePollId = "${data.activePoll}";
                  const resultsForThisOptionCount = ${totalResponsesForRankPoll};

                  const poll = newContent.polls[newContent.activePoll];
                  if (!poll || poll.type !== "rank") {
                    console.log("reloading");
                    location.reload();
                    return
                  }
                  const optionIds = Object.keys(poll.options);
                  const newOptionsCount = optionIds.length;
                  const totalResponsesForRankPoll = newContent.rankResults.filter((r) =>
                    optionIds.includes(r.optionId)
                  ).length;
                  const allQuestionsCompined = Object.values(poll.options).join('');

                  if (totalResponsesForRankPoll !== resultsForThisOptionCount || newContent.activePoll !== activePollId || newOptionsCount !== ${
                    optionIds.length
                  } || allQuestionsCompined !== "${Object.values(
            poll.options
          ).join("")}" || poll.title !== "${poll.title}") {
                      console.log("reloading");
                      location.reload();
                  }
                  setTimeout(checkForUpdate, 5000);
              }
              checkForUpdate();
            </script>`
        );
      }

      if (poll.type === "wordCloud") {
        return respond(
          `
      <div class="box" style="padding: 30px 30px;">
        <h3 style="margin-bottom: 25px;">${poll.question}</h3>
        <div style="width: 100%; display:grid; grid-template-columns: 1fr; gap: 10px;">
          <input class="freetext_input" onKeyDown="if (event.key === 'Enter') {document.querySelector('button').click()}" placeholder="Svar" autofocus>
          <button 
            style="font-size: 16px;"
            class="blue_button border_radius"
            onClick="
            console.log(document.querySelector('input').value, window.location.href);
            if (document.querySelector('input').value.trim() !== '') {
            // replace everything that not a-z, A-Z, 0-9 with empty string. Space is allowed. äåö is also allowed.
            fetch(window.location.href, {
              method:'POST',
              body: JSON.stringify({
                action:'voteWordCloud',
                pollId:'${data.activePoll}',
                word:document.querySelector('input').value.trim().replaceAll(/[^a-zA-Z0-9åäöÅÄÖ ]/g, '')
              })
            }).then(() => {
              document.querySelector('input').value = '';
              document.querySelector('input').focus();
            });
            }
          ">Skicka</button>
        </div>
      </div>
      ${getNextButton()}
      `
        );
      }

      if (poll.type === "rank") {
        return respond(
          `
          
            <h2>${poll.title}</h2>
            ${Object.entries(poll.options)
              .map(
                ([id, optionText]) => `<div class="box">
                  <h3>${optionText}</h3>
                  <p class="thank_you" id="thankyou${id}">Tack för din röst på </h3>
                  <div id="option${id}" class="rank_buttons">
                    <script>
                      console.log('eh');
                      if (localStorage.getItem('${id}') !== null) {
                        document.querySelector('#option${id}').style.display = 'none'
                        document.querySelector('#thankyou${id}').style.display = 'block'
                        document.querySelector('#thankyou${id}').innerText = 'Tack för din röst på '+localStorage.getItem('${id}')+"!";
                      }
                    </script>
                    <span>Dåligt</span>
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
                        }).then(() => {
                          localStorage.setItem('${id}', '${index + 1}');
                          document.querySelector('#option${id}').style.display = 'none'
                          document.querySelector('#thankyou${id}').style.display = 'block'
                          document.querySelector('#thankyou${id}').innerText = 'Tack för din röst på '+${
                          index + 1
                        }+'!';
                        });
                      ">${index + 1}</button>
                    `
                      )
                      .join("")}
                      <span>Bra</span>
                  </div>
                </div>
            `
              )
              .join("")}
              
          ${getNextButton()}
          
    `
        );
      }
    }

    return respond("Hello, World!");
  },
} satisfies ExportedHandler<Env>;
