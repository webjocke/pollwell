<!-- Improved compatibility of back to top link: See: https://github.com/webjocke/pollwell/pull/73 -->

<a id="readme-top"></a>

<!--
*** Thanks for checking out the pollwell. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Unlicense License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/webjocke/pollwell">
    <img src="logo.png" alt="Logo" width="283" height="88">
  </a>

  <h3 align="center">PollWell</h3>

  <p align="center">
    An simple open source poll website hosted on <b>Cloudflares Workers</b> and <b>Cloudflare Durable Objects</b>.
    <br />
    <br />
    <a href="https://pollwell.se/github-link">View Demo</a>
  </p>
</div>

<!-- ABOUT THE PROJECT -->

## About the Project

[Animated gif of somebody using the website]

This project was created for an event at my work, <i>LearningWell</i>, where we needed a way to ask the audience questions and gather feedback. Since we only have this type of event twice a year, subscribing to an existing solution seemed wasteful. After three late nights, PollWell was born. It is super simple and includes only the features we needed.

- Hosted on the free tier of Cloudflare Workers platform.
- Can be hosted on your Cloudflare account with your own domain name or use my publicly hosted version.
- Easy and straightforward.
- Great for live streams, company events, or any situation where you want to ask the audience something or collect feedback.
- Scales very well, capable of handling an unlimited number of poll "events" simultaneously (limited by Cloudflare's datacenters capacity).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Javascript][Javascript]][Javascript-url]
- [![Cloudflare Workers][Cloudflare-Workers]][Cloudflare-Workers-url]
- [![Cloudflare Durable Objects][Cloudflare-Durable-Objects]][Cloudflare-Durable-Objects-url]
- [![HTML][HTML]][HTML-url]
- [![CSS][CSS]][CSS-url]
- [![Typescript][Typescript]][Typescript-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

You can use our publicly hosted service at `pollwell.se`. Simply choose a unique name and navigate to `pollwell.se/<uniquename>` to create your own poll.

Alternatively, to get a local copy up and running, follow these simple steps:

### Prerequisites

This is an list of things you need to run this code.

- An Cloudflare account (Workers free plan is ok)
- node
- npm

### Installation

1. Login to Cloudflare Workers
   ```sh
   npx wrangler login
   ```
2. Clone the repo
   ```sh
   git clone https://github.com/webjocke/pollwell.git
   ```
3. Install NPM packages
   ```sh
   npm install
   ```
4. Rename `wrangler.example.jsonc` to `wrangler.jsonc`
   ```sh
   mv wrangler.example.jsonc wrangler.jsonc
   ```
5. Start the development server
   ```sh
   npx wrangler dev
   ```
6. Deploy the project
   ```sh
   npx wrangler deploy
   ```

### Usage

To use the application, navigate to `localhost:8787` in your browser.

- `localhost:8787/<some id>`: For people in the audience to connect to the event associated with that ID. This ID can later have any number of polls. The audience can go to the next poll by clicking the link at the bottom or by reloading the page.
- `localhost:8787/<some id>?admin`: Admin page to configure and add different polls. The admin can select which poll should be active and modify the polls.
- `localhost:8787/<some id>?result`: View the result of the currently active poll. This page updates automatically every 5 seconds to show new data.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Top contributors:

<a href="https://github.com/webjocke/pollwell/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=webjocke/pollwell" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- LICENSE -->

## License

Distributed under the Unlicense License. See `LICENSE.txt` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Joakim Johansson - [@webjocke](https://x.com/webjocke)

[https://joakimjohansson.se](https://joakimjohansson.se)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare Durable Objects](https://www.cloudflare.com/developer-platform/products/durable-objects/)
- [LearningWell](https://learningwell.se/)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://www.linkedin.com/in/joakim-johansson-77518833a/
[contributors-shield]: https://img.shields.io/github/contributors/webjocke/pollwell.svg?style=for-the-badge
[contributors-url]: https://github.com/webjocke/pollwell/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/webjocke/pollwell.svg?style=for-the-badge
[forks-url]: https://github.com/webjocke/pollwell/network/members
[stars-shield]: https://img.shields.io/github/stars/webjocke/pollwell.svg?style=for-the-badge
[stars-url]: https://github.com/webjocke/pollwell/stargazers
[issues-shield]: https://img.shields.io/github/issues/webjocke/pollwell.svg?style=for-the-badge
[issues-url]: https://github.com/webjocke/pollwell/issues
[license-shield]: https://img.shields.io/github/license/webjocke/pollwell.svg?style=for-the-badge
[license-url]: https://github.com/webjocke/pollwell/blob/master/LICENSE.txt
[Javascript]: https://img.shields.io/badge/Javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[Javascript-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript
[Cloudflare-Workers]: https://img.shields.io/badge/Cloudflare%20Workers-F38020?style=for-the-badge&logo=cloudflare&logoColor=white
[Cloudflare-Workers-url]: https://workers.cloudflare.com/
[Cloudflare-Durable-Objects]: https://img.shields.io/badge/Cloudflare%20Durable%20Objects-F38020?style=for-the-badge&logo=cloudflare&logoColor=white
[Cloudflare-Durable-Objects-url]: https://www.cloudflare.com/developer-platform/products/durable-objects/
[HTML]: https://img.shields.io/badge/HTML-E34F26?style=for-the-badge&logo=html5&logoColor=white
[HTML-url]: https://developer.mozilla.org/en-US/docs/Web/HTML
[CSS]: https://img.shields.io/badge/CSS-1572B6?style=for-the-badge&logo=css3&logoColor=white
[CSS-url]: https://developer.mozilla.org/en-US/docs/Web/CSS
[Typescript]: https://img.shields.io/badge/Typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
