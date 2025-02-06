export const resultsPage = `
<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>PollWell</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, 
user-scalable=no">
<!--<meta http-equiv="refresh" content="5" />-->
  <script src="https://d3js.org/d3.v4.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/d3-cloud@1.2.5/build/d3.layout.cloud.js"></script>
  <style>
      body,
      html {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
      }
      body {
        padding: 20px;
        box-sizing: border-box;
      }
      svg {
        box-sizing: border-box;
      }
      h1 {
        position: absolute;
        top: 45px;
        width: 100%;
        left: 0px;
        text-align: center;
        font-family: sans-serif;
      }
      .blue {
        color: #4DADE3;
      }
      .dark_blue {
        color: #003961;
      }
      .logo {
        font-size: 25px;
        position: absolute;
        top: 0px;
        width: 100%;
        left: 0px;
        text-align: center;
        font-family: sans-serif;
      }
    </style>
    </head>
    <body>
    <svg></svg>
    <h3 class="logo"><span class="dark_blue">Poll</span><span class="blue">Well</span><span class="dark_blue">.se</span></h3>
    <h1></h1>

    <script>

      const maxFontSize = 80;
      const minFontSize = 40;

      var e = window;
      var a = "inner";
      if (!("innerWidth" in window)) {
        a = "client";
        e = document.documentElement || document.body;
      }
      const width = e[a + "Width"] - 40;
      const height = e[a + "Height"] - 40;
      document.querySelector("svg").setAttribute("width", width);
      document.querySelector("svg").setAttribute("height", height);

      function getColor(word) {
        const alreadyHaveColor = localStorage.getItem(word);
        if (alreadyHaveColor) {
          return alreadyHaveColor;
        }
        const color = "hsl(" + Math.random() * 360 + ",50%,50%)";
        localStorage.setItem(word, color);
        return color;
      }

      const rawData = JSON.parse(\`<insert-data-here>\`);

      document.querySelector("h1").innerText = rawData.polls[rawData.activePoll].question;

      let words = [];
      
      rawData.wordCloudResults.filter((word)=>word.pollId === rawData.activePoll)
      .forEach((word) => {
        if (words.find((w) => w.text === word.word)) {
          words.find((w) => w.text === word.word).size += 1;
        } else {
          words.push({ text: word.word, size: 1 });
        }

      });
      console.log("yup", words)

      const scaleNumber = (value, inMin, inMax, outMin, outMax) => {
          return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
      };

      const max = Math.max(...words.map((w) => w.size));
      const min = Math.min(...words.map((w) => w.size));

      console.log(max, min)

      // const words = rawData.wordCloudResults.map((word) => {
      //   return { text: word.word, size: 50 };
      // });

      words = words.map((word) => {
        return {
          text: word.text,
          size: scaleNumber(word.size, max===min ? 0:min, max, minFontSize, maxFontSize),
        };
      });

      d3.layout
        .cloud()
        .size([width, height])
        .words(
          words
        )
        .padding(5)
        .rotate(() => (Math.random() > 0.5 ? 0 : 0))
        .fontSize((d) => d.size)
        .on("end", (words) => {
          const svg = d3.select("svg");
          const group = svg.select("g");
          if (!group.node()) {
            svg
              .append("g")
              .attr(
                "transform",
                "translate(" + width / 2 + "," + height / 2 + ")"
              );
          }

          const text = svg
            .select("g")
            .selectAll("text")
            .data(words, (d) => d.text);

          text
            .enter()
            .append("text")
            .style("font-size", "1px")
            .style("fill", (i) => {
            console.log(i)
              return getColor(i.text);
            })
            .attr("text-anchor", "middle")
            .attr(
              "transform",
              (d) => "translate("+(d.x)+","+d.y+") rotate("+d.rotate+")"
            )
            .text((d) => d.text)
            .transition()
            .duration(1000)
            .style("font-size", (d) => d.size+"px");
        })
        .start();

        async function checkForUpdate() {
          const url = new URL(window.location.href);
          const baseUrl = url.origin + url.pathname+"?data"; 
          const response = await fetch(baseUrl);
          const newContent = await response.json();
          console.log(baseUrl, newContent.wordCloudResults.filter(w=>w.pollId===rawData.activePoll).length, rawData.wordCloudResults.filter(w=>w.pollId===rawData.activePoll).length);

          if (newContent.wordCloudResults.filter(w=>w.pollId===newContent.activePoll).length !== rawData.wordCloudResults.filter(w=>w.pollId===rawData.activePoll).length || newContent.activePoll !== rawData.activePoll) {
          console.log("reloading");
            location.reload();
          }
          setTimeout(checkForUpdate, 5000);
        }
        checkForUpdate()
    </script>
    </body>
    </html>
`;
