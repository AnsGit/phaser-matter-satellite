import "./styles.css";

// import Phaser from "phaser";
import Phaser from "./phaser.js";

import config from "./config.js";
import Play from "./play.js";

const props = {
  type: Phaser.AUTO,
  width: config.WIDTH,
  height: config.HEIGHT,
  backgroundColor: config.BACKGROUND_COLOR,
  parent: "game-container",
  physics: {
    default: "matter",
    matter: {
      gravity: {
        scale: 0
      },
      plugins: {
        attractors: true
      },
      // debug: true,
    }
  },
  scene: [Play]
};

const game = new Phaser.Game(props);
