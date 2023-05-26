// import Phaser from "phaser";
import Phaser from "./phaser.js";
import _ from "underscore";
import $ from "jquery";

import config from "./config.js";

class Play extends Phaser.Scene {
  graphics;

  preload() {
    this.load.image("planet", require("../assets/planet.png"), config.PLANET.SIZE * 2, config.PLANET.SIZE * 2);
    this.load.image("satellite", require("../assets/satellite.png"), config.SATELLITE.WIDTH, config.SATELLITE.HEIGHT);
  }

  _preset() {
    this._preset = {};
  }

  create() {
    this._preset();

    this.parent = $(`#${this.registry.parent.config.parent}`);

    this.matter.world.autoUpdate = false;
    this.graphics = this.add.graphics();

    this.runner = { timestamp: 0 };

    this.restore();

    this.createPlanet();
    this.createSatellite();

    this.createTitle();
    this.createCounter();
    this.createButtons();

    this.build();
    this.subscribe();
  }

  store() {
    if (!config.LOCAL_STORAGE) return;

    window.localStorage['matter-satellite'] = JSON.stringify(this.state);
  }

  restore() {
    // delete window.localStorage['matter-satellite'];

    this.state = {
      satellite: {
        rotation: config.SATELLITE.POSITION.ROTATION,
        durations: { start: 0, end: 0 }
      },
      planet: {
        orbit:  { radius: config.PLANET.ORBIT.DEFAULT.RADIUS }
      },
      counter: {
        switchers: {
          value: 0,
          list: [ { value: 0 }, { value: 0 } ]
        }
      }
    };

    if (!config.LOCAL_STORAGE) return;
    if (!window.localStorage['matter-satellite']) return;

    this.state = JSON.parse(window.localStorage['matter-satellite']);
  }

  build() {
    // ...
  }

  createPlanet() {
    this.planet = this.matter.add.image(
      config.PLANET.x,
      config.PLANET.y,
      'planet',
      null,
      {
        shape: {
          type: 'circle',
          radius: config.PLANET.ORBIT.DEFAULT.RADIUS - config.SATELLITE.HEIGHT/2
        },
        plugin: {
          attractors: [
            (bodyA, bodyB) => ({
              x: (bodyA.position.x - bodyB.position.x) * 0.000001,
              y: (bodyA.position.y - bodyB.position.y) * 0.000001
            })
          ]
        }
      }
    );

    this.orbits = ['DEFAULT', 'TARGET'].map((type) => {
      const { RADIUS } = config.PLANET.ORBIT[type];
      return new Phaser.Geom.Circle(config.PLANET.x, config.PLANET.y, RADIUS);
    });

    // this.buildPlanet();
    this.resetPlanet();
  }

  resetPlanet() {
    this.state.planet.orbit.radius = config.PLANET.ORBIT.DEFAULT.RADIUS;
    this.buildPlanet();
  }

  buildPlanet() {
    this.planet.setCircle(this.state.planet.orbit.radius - config.SATELLITE.HEIGHT/2);
    this.planet.setStatic(true);
  }

  createSatellite() {
    this.satellite = this.matter.add.image(0, 0, 'satellite', null, { mass: 1 });    
    // this.buildSatellite();
    this.resetSatellite();
  }

  resetSatellite() {
    this.state.satellite.rotation = config.SATELLITE.POSITION.ROTATION;
    this.buildSatellite();
  }

  buildSatellite() {
    this.buildSatellitePosition();
    this.buildSatelliteAcceleration();
    this.buildSatelliteRotation();
  }
  
  buildSatellitePosition() {
    const { rotation } = this.state.satellite;
    const { radius } = this.state.planet.orbit;

    const x = config.PLANET.x + radius * Math.cos(-rotation);
    const y = config.PLANET.y - radius * Math.sin(-rotation);

    this.satellite.setPosition(x, y);
  }

  buildSatelliteAcceleration() {
    const direction = config.SATELLITE.DIRECTION;
    const rotation = Math.atan2( direction.y - this.satellite.y, direction.x - this.satellite.x );

    this.satellite.acceleration = { direction, rotation };
  }

  updateSatelliteRotation(running = false, delta = 0) {
    // Base rotation of the satellite
    this.state.satellite.rotation = Phaser.Math.Angle.Between(this.planet.x, this.planet.y, this.satellite.x, this.satellite.y);

    // Target change in the rotation of the satellite during acceleration
    let rDelta = this.satellite.acceleration.rotation + Math.PI;

    if (running) {
      const { ACCELERATION } = config.SATELLITE;
      const duration = this.state.counter.switchers.value;

      const isStarting = this.runner.timestamp < this.state.satellite.durations.start;
      let multiplier;
      
      if (isStarting) {
        // Set smooth changing of the satellite rotation on start of acceleration
        multiplier = this.runner.timestamp / this.state.satellite.durations.start;
        rDelta *= multiplier;
      }
      else {
        const isEnding = this.runner.timestamp > (duration - this.state.satellite.durations.end);
        
        if (isEnding) {
          // Set smooth changing of the satellite rotation on end of acceleration
          multiplier = (duration - this.runner.timestamp) / this.state.satellite.durations.end;
          rDelta *= multiplier;
        }
      }
      
      this.state.satellite.rotation += rDelta;
    }

    this.buildSatelliteRotation();
  }

  buildSatelliteRotation() {
    const { rotation } = this.state.satellite;
    this.satellite.setRotation(rotation + Math.PI/2);
  }

  updateSatellite(time, delta) {
    // const rotation = this.satellite.rotation + this.satellite.acceleration.rotation;
    const rotation = this.satellite.rotation - Math.PI;

    const velocity = {
      x: config.SATELLITE.POWER.ACCELERATION * Math.cos(rotation),
      y: config.SATELLITE.POWER.ACCELERATION * Math.sin(rotation)
    };
    
    this.satellite.setVelocity(velocity.x, velocity.y);
  }

  moveSatellite() {
    const rotation = this.satellite.rotation + Math.PI;
      
    const velocity = {
      x: config.SATELLITE.POWER.DEFAULT * Math.cos(rotation),
      y: config.SATELLITE.POWER.DEFAULT * Math.sin(rotation)
    };
    
    this.satellite.setVelocity(velocity.x, velocity.y);
  }

  createTitle() {
    this.title = {
      view: $('<div>', { class: 'task-title', html: 'Переведи спутник на большую пунктирную<br>орбиту. Для этого включай двигатель<br>столько раз, сколько потребуется.' })
    };

    this.parent.append(this.title.view);
  }

  createCounter() {
    this.counter = {
      view: $('<div>', { class: 'counter' }),
      status: {
        view: $('<div>', { class: 'status' }),
        inner: {
          view: $('<div>', { class: 'inner' }),
          value: $('<div>', { class: 'value' })
        }
      },
      switchers: {
        view: $('<div>', { class: 'switchers' }),
        list: _.range(2).map((i) => {
          const switcher = {
            view: $('<div>', { class: 'switcher' }),
            value: $('<div>', { class: 'value' }),
            buttons: ['up', 'down'].map((type) => {
              const b = $('<div>', { class: `button ${type}` });

              b.data({ switcher: { index: i }, type });

              return b;
            })
          }

          switcher.view.append(
            switcher.buttons[0],
            switcher.value,
            switcher.buttons[1]
          );

          return switcher;
        })
      }
    };

    this.counter.view.append(
      this.counter.status.view.append(
        this.counter.status.inner.view.append(
          this.counter.status.inner.value
        )
      ),
      this.counter.switchers.view.append(
        ...this.counter.switchers.list.map( s => s.view )
      )
    );

    this.parent.append(this.counter.view);

    this.counter.status.height = this.counter.status.view.height() / 2;

    this.buildCounter();
  }

  resetCounter() {
    this.state.counter.switchers.list.forEach( state => state.value = 0 );
    this.state.counter.switchers.value = 0;
    this.buildCounter();
  }

  buildCounter() {
    const duration = config.SATELLITE.ACCELERATION.DURATION / 1000;

    this.counter.status.inner.view.css({ height: this.counter.status.height });
    this.counter.status.inner.value.text(duration);

    this.counter.switchers.list.forEach((s, i) => {
      s.value.text(this.state.counter.switchers.list[i].value);
    });
  }

  toggleCounter(b) {
    const sIndex = b.data().switcher.index;
    const { type } = b.data();

    const values = this.state.counter.switchers.list.map( state => state.value );

    const maxDuration = config.SATELLITE.ACCELERATION.DURATION / 1000;

    if (type === 'up') {
      values[sIndex]++;

      if (sIndex === 0) {
        // Left switcher
        const tempResValue = parseFloat(values.join('.'));

        if (tempResValue > maxDuration) {
          const maxDurationParts = maxDuration.toString().split('.');
          maxDurationParts[1] = maxDurationParts[1] || 0;

          values[0] = +maxDurationParts[0];
          values[1] = +maxDurationParts[1];
        }
      }
      else {
        // Right switcher
        if (values[sIndex] === 10) {
          values[0]++;
          values[sIndex] = 0
        }
      }
    }
    else {
      values[sIndex]--;

      if (sIndex === 0) {
        // Left switcher
        const tempResValue = parseFloat(values.join('.'));

        if (tempResValue < 0) {
          values[0] = 0;
          // values[1] = 0;
        }
      }
      else {
        // Right switcher
        if (values[sIndex] === -1) {
          values[0]--;
          values[sIndex] = 9;
        }
      }
    }

    const resValue = parseFloat(values.join('.'));
    const isCorrectResult = ( resValue >= 0 && resValue <= maxDuration );

    if (isCorrectResult) {
      values.forEach((value, i) => {
        this.counter.switchers.list[i].value.text(value);
        this.state.counter.switchers.list[i].value = value;
      });

      this.state.counter.switchers.value = resValue * 1000;
    };
  }

  updateCounter(time, delta) {
    // Actual remaining duration on counter switchers
    let remainingDuration = (this.state.counter.switchers.value - this.runner.timestamp);
    (remainingDuration < 0) && (remainingDuration = 0);

    const values = (remainingDuration / 1000).toFixed(1).split('.');

    values.forEach((value, i) => {
      this.counter.switchers.list[i].value.text(value);
    });

    const maxDuration = config.SATELLITE.ACCELERATION.DURATION;
    
    // Actual height of counter status inner part
    this.counter.status.inner.view.height(
      this.counter.status.height * (1 - this.runner.timestamp/maxDuration)
    );
      
    // Actual duration on counter status
    let statusDuration = (maxDuration - this.runner.timestamp) / 1000;
    (statusDuration < 0) && (statusDuration = 0);

    this.counter.status.inner.value.text( statusDuration.toFixed(1) );
  }

  disableCounter() {
    this.counter.view.addClass('disabled');
  }

  enableCounter() {
    this.counter.view.removeClass('disabled');
  }

  createButtons() {
    this.buttons = {
      view: $('<div>', { class: 'buttons' }),
      reset: {
        view: $('<div>', { class: 'button reset disabled' })
      },
      run: {
        view: $('<div>', { class: 'button run' })
      }
    };

    this.buttons.view.append(
      this.buttons.reset.view,
      this.buttons.run.view
    );

    this.parent.append(this.buttons.view);
  }

  disableButtons() {
    this.buttons.view.addClass('disabled');
  }

  enableButtons() {
    this.buttons.view.removeClass('disabled');
  }

  updateObjects(time, delta) {
    if (this.running) {
      this.runner.timestamp += delta;

      this.updateCounter(time, delta);
      this.updateSatellite(time, delta);
      
      if (this.runner.timestamp >= this.state.counter.switchers.value) {
        this.stop();
      }
    }
    else {
      this.moveSatellite();
    }

    this.updateSatelliteRotation(this.running, delta);
  }

  reset(props = {}) {
    this.running = false;

    this.resetPlanet();
    this.resetSatellite();
    this.resetCounter();
    
    this.buttons.run.view.removeClass('disabled');
    this.buttons.reset.view.addClass('disabled');

    this.enableCounter();
  }

  run() {
    const duration = this.state.counter.switchers.value;

    if (duration <= 0) return;

    const { ACCELERATION } = config.SATELLITE;

    this.state.satellite.durations = {
      start: duration * ACCELERATION.START.PART,
      end: duration * ACCELERATION.END.PART,
    };

    this.running = true;
    this.runner.timestamp = 0;

    this.buttons.run.view.addClass('disabled');
    this.buttons.reset.view.removeClass('disabled');

    this.disableCounter();
  }

  stop() {
    this.running = false;

    this.state.planet.orbit.radius = Phaser.Math.Distance.Between(this.satellite.x, this.satellite.y, this.planet.x, this.planet.y);
    this.buildPlanet();
  }

  subscribeSatellite() {
    // ...
  }

  subscribeButtons() {
    // RESET SLOPE AND BALL
    this.buttons.reset.view.on('click', (e) => {
      // console.log('RESETED');

      this.reset();
      this.store();
    });

    // RUN BALL
    this.buttons.run.view.on('click', (e) => {
      // console.log('STARTED');

      this.run();
      this.store();
    });
  }

  subscribeCounter() {
    this.counter.switchers.list.forEach((s) => {
      s.buttons.forEach((b) => {
        b.on('click', (e) => {
          this.toggleCounter(b);
          this.store();
        });
      })
    })
  }

  subscribe() {
    this.subscribeSatellite();
    this.subscribeButtons();
    this.subscribeCounter();
  }

  draw() {
    this.graphics.clear();
    
    this.drawOrbits();
  }

  drawOrbit(o, dashed = false) {
    if (!dashed) {
      this.graphics.beginPath();
      this.graphics.arc(o.x, o.y, o.radius, 0, 2 * Math.PI);
      this.graphics.closePath();
      this.graphics.stroke();
    }
    else {
      const maxAngle = Math.PI * 2;
      const aDelta = maxAngle / (config.PLANET.ORBIT.TARGET.SEGMENTS * 2);

      let angle = 0;

      while (angle < maxAngle) {
        this.graphics.beginPath();
        this.graphics.arc(o.x, o.y, o.radius, angle, angle + aDelta);
        this.graphics.stroke();

        angle += aDelta * 2;
      }
    }
  }

  drawOrbits() {
    this.graphics.lineStyle(1, config.PLANET.ORBIT.COLOR, 0.5);
    this.orbits.forEach( (o, i) => this.drawOrbit(o, i === 1) );
  }

  update(time, delta) {
    this.draw();

    this.updateObjects(time, delta);

    this.matter.world.step(delta);
  }

  disable() {
    this.parent.addClass('disabled');
  }

  enable() {
    this.parent.removeClass('disabled');
  }
}

export default Play;
