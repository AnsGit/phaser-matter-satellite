import "./styles.css";

import Phaser from "phaser";
import $ from "jquery";

import config from "./config.js";
import Scene from "./scene.js";

class Space {
  constructor(props = {}) {
    this._initProps(props);
    this._initDOM();
  }

  _initProps(props = {}) {
    this._defaultProps = {
      class: 'space',
    };

    this.props = $.extend(true, {}, this._defaultProps, props);
  }

  _initDOM() {
    this.view = $('<div>', { class: 'space' });
  }

  _initGame(state = {}, cb = () => {}) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: config.WIDTH,
      height: config.HEIGHT,
      backgroundColor: config.BACKGROUND_COLOR,
      parent: this.view[0],
      physics: {
        default: "matter",
        matter: {
          debug: true,
          gravity: {
            scale: 0
          }
        },
      },
      scene: [Scene],
      callbacks: { postBoot: cb },
    });

    this.game.state = $.extend(false, {}, state);
  }

  getState() {
    this.state = this.scene.getState();

    return this.state;
  }

  build(state = {}) {
    return new Promise( resolve => this._initGame(state, resolve) )
  }

  subscribe(props = {}) {
    return this.scene.subscribe(props);
  }
  
  unsubscribe() {
    return this.scene.unsubscribe();
  }

  get scene() {
    return this.game.scene.scenes[0];
  }
}

export default Space;