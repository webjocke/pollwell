export const snippets = {
  header: `
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
          
        
    `,
  footer: "</body></html>",
  nextButton: `<div class="next_button_container"><button class="next_button" onClick="location.reload()">Till nästa poll →</button><span>(om den är tillgänglig)</span></div>`,
};
