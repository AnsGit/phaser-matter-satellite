// import Phaser from "phaser";
import Phaser from "./phaser.js";
import _, { times } from "underscore";
import $ from "jquery";

import config from "./config.js";

class Play extends Phaser.Scene {
  graphics;

  preload() {
    this.load.image("planet", require("../assets/planet.png"), config.PLANET.RADIUS * 2, config.PLANET.RADIUS * 2);
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

    const { V } = config.SATELLITE;

    this.runner = {
      timestamp: 0,
      satellite: {
        rotation: null,
        mu: (Math.pow(V.x, 2) + Math.pow(V.y, 2)) * config.PLANET.ORBIT.DEFAULT.RADIUS
      }
    };

    this.restore();

    this.createPlanet();
    this.createOrbits();
    this.createSatellite();
    this.createArrow();

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
      step: 0, // 0 - before ignit, 1 - before arrow activation, 2 - before counter changing, 3 - after running
      satellite: {
        ...this.getSatelliteDefaultPosition(),
        // rotation: config.SATELLITE.POSITION.ROTATION,
        // durations: { start: 0, end: 0 },
        vx: config.SATELLITE.V.x,
        vy: config.SATELLITE.V.y
      },
      // planet: {
      //   orbit:  { radius: config.PLANET.ORBIT.DEFAULT.RADIUS }
      // },
      counter: {
        switchers: {
          value: {
            chosen: 0,
            available: config.SATELLITE.ACCELERATION.DURATION,
          },
          list: [ { value: 0 }, { value: 0 } ]
        }
      },
      arrow: {
        activated: false,
        end: { x: config.PLANET.x, y: config.PLANET.y }
      }
    };

    // console.log(this.state);

    if (!config.LOCAL_STORAGE) return;
    if (!window.localStorage['matter-satellite']) return;

    this.state = $.extend(
      true,
      this.state,
      JSON.parse(window.localStorage['matter-satellite'])
    );
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
          radius: config.PLANET.RADIUS - 15
        }
      }
    );

    this.buildPlanet();
    // this.resetPlanet();
  }

  resetPlanet() {
    // this.state.planet.orbit.radius = config.PLANET.ORBIT.DEFAULT.RADIUS;
    this.orbits[2] = [];
    this.buildPlanet();
  }

  buildPlanet() {
    // this.planet.setCircle(this.state.planet.orbit.radius - config.SATELLITE.HEIGHT/2);
    this.planet.setStatic(true);
  }

  createOrbits() {
    this.orbits = ['DEFAULT', 'TARGET', 'CURRENT'].map((type) => {
      if (type === 'CURRENT') return [];

      const { RADIUS } = config.PLANET.ORBIT[type];
      return new Phaser.Geom.Circle(config.PLANET.x, config.PLANET.y, RADIUS);
    });

    this.buildOrbits();
  }

  resetOrbits() {
    this.buildOrbits();
  }

  buildOrbits() {
    if (!config.PLANET.ORBIT.CURRENT.ENABLED) return;

    this.orbits[2] = [];

    let { x, y, vx, vy } = this.state.satellite;
    let dx, dy, dl, dl3, dvx, dvy;

    let ex = config.PLANET.x;
    let ey = config.PLANET.y;

    let mu = this.runner.satellite.mu;

    let i = 0;
    let prevAngle = 0;
    let currentAngle = 1;
    let angleDiff = 0;

    // return;
    while (currentAngle > -Math.PI) {
      prevAngle = currentAngle;

      [x, y] = [x + vx / 2, y + vy / 2];
      [dx, dy] = [ex - x, ey - y];
      dl = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      dl3 = Math.pow(dl, 3);
      [dvx, dvy] = [mu * dx / dl3, mu * dy / dl3];
      [vx, vy] = [vx + dvx, vy + dvy];
      [x, y] = [x + vx / 2, y + vy / 2];

      // currentAngle = (Math.atan2(-dy, -dx) + Math.PI * 2) % Math.PI * 2;
      // currentAngle = Math.atan2(-dy, -dx);

      // console.log(parseInt(Math.atan2(-dy, -dx) * 180 / Math.PI));
      // console.log(parseInt((currentAngle) * 180 / Math.PI));

      // currentAngle = Math.atan2(-dy, -dx);

      // if (currentAngle > 0) {
      //   currentAngle -= Math.PI * 2;
      // }

      // currentAngle *= -1;

      // const a = Math.atan2(-dy, -dx);
      // console.log(parseInt((a) * 180 / Math.PI));

      // if (a < 0) {
      //   // currentAngle += Math.PI * 2;
      //   console.log(parseInt((a + Math.PI * 2) * 180 / Math.PI));
      // }
      // else {
      //   console.log(parseInt((a) * 180 / Math.PI));
      // }


      // console.log(parseInt((a) * 180 / Math.PI));

      currentAngle = (Math.atan2(-dy, -dx) + Math.PI * 2) % Math.PI * 2;

      if (i === 0) {
        angleDiff = (Math.PI * 2 - currentAngle);
      }
      else {
        if (currentAngle > prevAngle) {
          currentAngle -= Math.PI * 2;
        }
      }
      currentAngle += angleDiff;

      console.log(parseInt(currentAngle * 180 / Math.PI));

      // currentAngle = angleDiff - currentAngle;

      if (i % 20 === 0) this.orbits[2].push({ x, y });
      i++;
    }

    // console.log(this.orbits[2].length);

    return;

    for (let i = 0; i < 100000; i++) {
      prevAngle = currentAngle;

      [x, y] = [x + vx / 2, y + vy / 2];
      [dx, dy] = [ex - x, ey - y];
      dl = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      dl3 = Math.pow(dl, 3);
      [dvx, dvy] = [mu * dx / dl3, mu * dy / dl3];
      [vx, vy] = [vx + dvx, vy + dvy];
      [x, y] = [x + vx / 2, y + vy / 2];

      currentAngle = (Math.atan2(-dy, -dx) + Math.PI * 2) % Math.PI * 2;

      if (i === 0) {
        angleDiff = (Math.PI * 2 - currentAngle);
        currentAngle += angleDiff;
        // endAngle = currentAngle;
      }
      else {
        if (currentAngle > prevAngle) {
          currentAngle -= Math.PI * 2;
        }
        currentAngle += angleDiff;
        
      }
      // currentAngle -= Math.PI * 2;
      // console.log(parseInt(currentAngle * 180 / Math.PI));

      // console.log(Math.abs((Math.atan2(-dy, -dx) + Math.PI * 2) % Math.PI * 2));
      // console.log(
      //   parseInt(
      //     ((Math.atan2(-dy, -dx) + Math.PI * 2) % Math.PI * 2) * 180 / Math.PI
      //   )
      // );

      if (i % 20 === 0) this.orbits[2].push({ x, y });
    }
  }

  createSatellite() {
    this.satellite = this.matter.add.image(
      0, 0,
      'satellite',
      null,
      { mass: config.SATELLITE.MASS }
    );

    this.buildSatellite();
    // this.resetSatellite();
  }

  resetSatellite() {
    // this.state.satellite.rotation = config.SATELLITE.POSITION.ROTATION;
    this.state.satellite = {
      ...this.state.satellite,
      ...this.getSatelliteDefaultPosition(),
      vx: config.SATELLITE.V.x,
      vy: config.SATELLITE.V.y
    }

    // this.state.satellite.data.vx = config.SATELLITE.V.x;
    // this.state.satellite.data.vy = config.SATELLITE.V.y;
    this.satellite.setStatic(false);
    this.buildSatellite();
  }

  buildSatellite() {
    this.buildSatellitePosition();
    // this.buildSatelliteAcceleration();
    // this.buildSatelliteRotation();


    this.satellite.setFriction(0);
    this.satellite.setFrictionAir(0);

    if ([1, 2].includes(this.state.step)) {
      this.satellite.setStatic(true);

      if (this.state.step === 2) {
        this.buildSatelliteRotation(this.state.arrow.end.x, this.state.arrow.end.y);
      }
    }

    // setTimeout(() => {
    //   this.satellite.setVelocity(-1, 0);
    // }, 500);
  }

  getSatelliteDefaultPosition() {
    const { ROTATION } = config.SATELLITE.POSITION;
    const { RADIUS } = config.PLANET.ORBIT.DEFAULT;

    return {
      x: config.PLANET.x + RADIUS * Math.cos(-ROTATION),
      y: config.PLANET.y - RADIUS * Math.sin(-ROTATION)
    }
  }

  
  buildSatellitePosition() {
    // const { rotation } = this.state.satellite;
    // const { radius } = this.state.planet.orbit;

    // const x = config.PLANET.x + radius * Math.cos(-rotation);
    // const y = config.PLANET.y - radius * Math.sin(-rotation);

    // console.log(this.state.satellite);

    this.satellite.setPosition(this.state.satellite.x, this.state.satellite.y);
  }

  buildSatelliteVelocity() {
    const ex = this.state.arrow.end.x;
    const ey = this.state.arrow.end.y;
    
    const duration = this.state.counter.switchers.value.chosen;
  
    const angle = Math.atan2(ey - this.state.satellite.y, ex - this.state.satellite.x);
    const [dvx, dvy] = [
      Math.cos(angle) * config.SATELLITE.V.k * duration,
      Math.sin(angle) * config.SATELLITE.V.k * duration
    ];

    this.state.satellite.vx += dvx / 1000;
    this.state.satellite.vy += dvy / 1000;
  }
  
  // buildSatelliteAcceleration() {
  //   const rotation = Math.atan2( this.state.arrow.end.y - this.satellite.y, this.state.arrow.end.x - this.satellite.x );

  //   this.satellite.acceleration = { rotation };
  // }

  // updateSatelliteRotation(running = false, delta = 0) {
  //   if (!running) {
  //     // Base rotation of the satellite
  //     this.state.satellite.rotation = Phaser.Math.Angle.Between(this.planet.x, this.planet.y, this.satellite.x, this.satellite.y);
  //   }
  //   else {
  //     // Target change in the rotation of the satellite during acceleration
  //     let rDelta;

  //     const { ACCELERATION } = config.SATELLITE;
  //     const duration = this.state.counter.switchers.value;

  //     const isStarting = this.runner.timestamp < this.state.satellite.durations.start;
  //     let multiplier;
      
  //     if (isStarting) {
  //       rDelta = this.satellite.acceleration.rotation + Math.PI/2 - this.runner.satellite.rotation;
  //       rDelta %= Math.PI * 2;

  //       if (rDelta > Math.PI) {
  //         rDelta -= Math.PI * 2;
  //       }
      
  //       // Set smooth changing of the satellite rotation on start of acceleration
  //       multiplier = this.runner.timestamp / this.state.satellite.durations.start;
  //       rDelta *= multiplier;

  //       this.state.satellite.rotation = this.runner.satellite.rotation + rDelta;
  //     }
  //     else {
  //       const isEnding = this.runner.timestamp > (duration - this.state.satellite.durations.end);
        
  //       this.state.satellite.rotation = this.satellite.acceleration.rotation + Math.PI/2;

  //       if (isEnding) {
  //         rDelta = Phaser.Math.Angle.Between(this.planet.x, this.planet.y, this.satellite.x, this.satellite.y) - (this.satellite.acceleration.rotation + Math.PI/2);
  //         rDelta %= Math.PI * 2;

  //         if (rDelta > Math.PI) {
  //           rDelta -= Math.PI * 2;
  //         }

  //         // Set smooth changing of the satellite rotation on end of acceleration
  //         multiplier = 1 - (duration - this.runner.timestamp) / this.state.satellite.durations.end;
  //         rDelta *= multiplier;
          
  //         this.state.satellite.rotation += rDelta;
  //       }
  //     }
  //   }

  //   // // Base rotation of the satellite
  //   // this.state.satellite.rotation = Phaser.Math.Angle.Between(this.planet.x, this.planet.y, this.satellite.x, this.satellite.y);

  //   // // Target change in the rotation of the satellite during acceleration
  //   // let rDelta = this.satellite.acceleration.rotation + Math.PI;

  //   // if (running) {
  //   //   const { ACCELERATION } = config.SATELLITE;
  //   //   const duration = this.state.counter.switchers.value;

  //   //   const isStarting = this.runner.timestamp < this.state.satellite.durations.start;
  //   //   let multiplier;
      
  //   //   if (isStarting) {
  //   //     // Set smooth changing of the satellite rotation on start of acceleration
  //   //     multiplier = this.runner.timestamp / this.state.satellite.durations.start;
  //   //     rDelta *= multiplier;
  //   //   }
  //   //   else {
  //   //     const isEnding = this.runner.timestamp > (duration - this.state.satellite.durations.end);
        
  //   //     if (isEnding) {
  //   //       // Set smooth changing of the satellite rotation on end of acceleration
  //   //       multiplier = (duration - this.runner.timestamp) / this.state.satellite.durations.end;
  //   //       rDelta *= multiplier;
  //   //     }
  //   //   }
      
  //   //   this.state.satellite.rotation += rDelta;
  //   // }

  //   this.buildSatelliteRotation();
  // }

  buildSatelliteRotation(x, y) {
    const rotation = Math.atan2(
      y - this.state.satellite.y,
      x - this.state.satellite.x
    );

    this.satellite.setRotation(rotation + Math.PI);
  }

  // updateSatellite(time, delta) {
  //   // const rotation = this.satellite.rotation + this.satellite.acceleration.rotation;
  //   const rotation = this.satellite.rotation - Math.PI;

  //   const velocity = {
  //     x: config.SATELLITE.POWER.ACCELERATION * Math.cos(rotation),
  //     y: config.SATELLITE.POWER.ACCELERATION * Math.sin(rotation)
  //   };
    
  //   this.satellite.setVelocity(velocity.x, velocity.y);
  // }

  moveSatellite(iterations = 3) {
    if (this.satellite.isStatic()) return;
    // if this.
    // const rotation = this.satellite.rotation + Math.PI * 179/180;
      
    // const velocity = {
    //   x: config.SATELLITE.POWER.DEFAULT * Math.cos(rotation),
    //   y: config.SATELLITE.POWER.DEFAULT * Math.sin(rotation)
    // };
    
    // this.satellite.setVelocity(velocity.x, velocity.y);

    const { data } = this.state.satellite;

    let dx, dy, dl, dl3, dvx, dvy;
    
    for(let i = 0; i < iterations; i++) {
      this.state.satellite.x += this.state.satellite.vx / 2;
      this.state.satellite.y += this.state.satellite.vy / 2;

      this.satellite.setPosition(this.state.satellite.x, this.state.satellite.y);

      dx = config.PLANET.x - this.state.satellite.x
      dy = config.PLANET.y - this.state.satellite.y;
      dl = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2));
      dl3 = Math.pow(dl, 3);
      dvx = this.runner.satellite.mu * dx / dl3;
      dvy = this.runner.satellite.mu * dy / dl3;
      this.state.satellite.vx += dvx;
      this.state.satellite.vy += dvy;

      this.state.satellite.x += this.state.satellite.vx / 2
      this.state.satellite.y += this.state.satellite.vy / 2;
    }
  }

  createArrow() {
    this.arrow = {
      corner: { vertices: null }
    }

    this.buildArrow();
  }

  resetArrow() {
    this.activateArrow(false);
    this.buildArrow();
  }

  buildArrow() {
    this.buildArrowCorner();

    if ([1, 2].includes(this.state.step)) {
      this.subscribeArrow();

      if (this.state.step === 2) {
        this.activateArrow(true);
      }
    }
  }

  buildArrowEndPosition(pointer) {
    this.state.arrow.end.x = pointer.position.x;
    this.state.arrow.end.y = pointer.position.y;

    // let { x, y } = pointer.position;

    // let xH = x - this.satellite.x;
    // let yH = y - this.satellite.y;
    
    // let a = Math.atan2(yH, xH);

    // if (a > 0) {
    //   a -= Math.PI * 2;
    // };

    // const minA = config.ARROW.ANGLE.MIN;
    // const maxA = config.ARROW.ANGLE.MAX;
    
    // // Fix position if (a > min angle) or (a < max angle)
    // if (a < minA) {
    //   a = minA;

    //   if (x > this.satellite.x) {
    //     x = Math.cos(a) * config.ARROW.LENGTH.MIN + this.satellite.x;
    //   }

    //   y = (x - this.satellite.x) * Math.tan(a) + this.satellite.y;
    // }
    // else if (a > maxA) {
    //   a = maxA;

    //   if (y > this.satellite.y) {
    //     y = Math.sin(a) * config.ARROW.LENGTH.MIN + this.satellite.y;
    //   }

    //   x = (y - this.satellite.y) / Math.tan(a) + this.satellite.x;
    // }

    // xH = x - this.satellite.x;
    // yH = y - this.satellite.y;
    
    // // Get current distance between start and and of the arrow
    // // Returns config.ARROW.LENGTH.MIN if distance between cursor and start of the arrow >= config.ARROW.LENGTH.MIN)
    // const l = Math.max(
    //   Math.sqrt( Math.pow(xH, 2) +  Math.pow(yH, 2) ),
    //   config.ARROW.LENGTH.MIN
    // );

    // // Fix position depending on correct distance between start and and of the arrow
    // x = Math.cos(a) * l + this.satellite.x;
    // y = Math.sin(a) * l + this.satellite.y;

    // this.state.arrow.end.x = x;
    // this.state.arrow.end.y = y;
  }

  buildArrowCorner() {
    const baseA = Math.atan2(
      this.satellite.y - this.state.arrow.end.y,
      this.satellite.x - this.state.arrow.end.x
    );

    this.arrow.corner.vertices = [-1, 1].map((multiplier) => {
      const a = baseA + config.ARROW.CORNER.ANGLE/2 * multiplier;

      return {
        x: this.state.arrow.end.x + Math.cos(a) * config.ARROW.CORNER.RADIUS,
        y: this.state.arrow.end.y + Math.sin(a) * config.ARROW.CORNER.RADIUS
      }
    });
  }

  activateArrow(toActivate = true) {
    this.state.arrow.activated = toActivate;
    this.store();
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

    this.buildCounter();
    
    // this.counter.status.height = this.counter.status.view.height() / 2;
  }

  resetCounter() {
    this.state.counter.switchers.list.forEach( state => state.value = 0 );
    this.state.counter.switchers.value.chosen = 0;
    this.state.counter.switchers.value.available = config.SATELLITE.ACCELERATION.DURATION;
    this.buildCounter();
  }

  buildCounter() {
    this.counter.status.height = this.counter.status.view.height() / 2;

    // const duration = config.SATELLITE.ACCELERATION.DURATION / 1000;

    // this.counter.status.inner.view.height({ height:  });
    this.counter.status.inner.view.height(
      (this.state.counter.switchers.value.available/config.SATELLITE.ACCELERATION.DURATION) * this.counter.status.height
    );

    this.counter.status.inner.value.text(
      (this.state.counter.switchers.value.available/1000).toFixed(1)
    );

    this.counter.switchers.list.forEach((s, i) => {
      s.value.text(this.state.counter.switchers.list[i].value);
    });
    
    if ([0, 1, 3].includes(this.state.step)) {
      // this.hideCounterSwitchers();
      this.disableCounter();

      if (this.state.step === 0) {
        this.hideCounterSwitchers();
      }
    }
  }

  toggleCounter(b) {
    const sIndex = b.data().switcher.index;
    const { type } = b.data();

    const values = this.state.counter.switchers.list.map( state => state.value );

    const maxDuration = (this.state.counter.switchers.value.available/1000).toFixed(1);

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

      this.state.counter.switchers.value.chosen = resValue * 1000;
    };

    if (resValue > 0) {
      this.enableButton('run');
    }
    else {
      this.disableButton('run');
    }
  }

  updateCounter(time, delta) {
    const chosenDuration = this.state.counter.switchers.value.chosen;
    const availableDuration = this.state.counter.switchers.value.available + chosenDuration;
    // Actual remaining duration on counter switchers
    let remainingDuration = (chosenDuration - this.runner.timestamp);
    (remainingDuration < 0) && (remainingDuration = 0);

    const values = (remainingDuration / 1000).toFixed(1).split('.');

    values.forEach((value, i) => {
      this.counter.switchers.list[i].value.text(value);
    });

    const maxDuration = config.SATELLITE.ACCELERATION.DURATION;
    
    // Actual height of counter status inner part
    this.counter.status.inner.view.height(
      this.counter.status.height * (availableDuration - this.runner.timestamp)/maxDuration
    );
      
    // Actual duration on counter status
    let statusDuration = (availableDuration - this.runner.timestamp) / 1000;
    (statusDuration < 0) && (statusDuration = 0);

    this.counter.status.inner.value.text( statusDuration.toFixed(1) );
  }

  disableCounter() {
    this.counter.view.addClass('disabled');
  }

  enableCounter() {
    this.counter.view.removeClass('disabled');
  }

  showCounterSwitchers() {
    this.counter.switchers.view.removeClass('hidden');
  }

  hideCounterSwitchers() {
    this.counter.switchers.view.addClass('hidden');
  }

  createButtons() {
    this.buttons = {
      reset: {
        view: $('<div>', { class: 'task-button reset' })
      },
      ignit: {
        view: $('<div>', { class: 'task-button ignit' })
      },
      run: {
        view: $('<div>', { class: 'task-button run' })
      }
    };

    this.buildButtons();

    this.parent.append(
      this.buttons.reset.view,
      this.buttons.run.view,
      this.buttons.ignit.view
    );
  }

  buildButtons() {
    switch (this.state.step) {
      case 0: {
        this.disableButton('reset');

        this.disableButton('run');
        this.hideButton('run');
        break;
      }
      case 1: {
        // this.disableButton('reset');

        this.disableButton('run');

        this.disableButton('ignit');
        this.hideButton('ignit');
        break;
      }
      case 2: {
        // this.disableButton('reset');

        if (this.state.counter.switchers.value.chosen == 0) {
          this.disableButton('run');
        }
        this.disableButton('ignit');
        this.hideButton('ignit');
        break;
      }
      case 3: {
        this.disableButton('run');
        this.hideButton('run');

        if (this.state.counter.switchers.value.available == 0) {
          this.disableButton('ignit');
        }
        break;
      }
    }
  }

  showButton(type) {
    return this.toggleButton(type, true);
  }

  hideButton(type) {
    return this.toggleButton(type, false);
  }

  toggleButton(type, toShow = true) {
    const button = this.buttons[type];

    button.view.toggleClass('hidden', !toShow);
    
    return new Promise( resolve => button.view.on('transitionend', resolve) );
  }

  disableButton(type) {
    this.buttons[type].view.addClass('disabled');
  }

  enableButton(type) {
    this.buttons[type].view.removeClass('disabled');
  }

  disableButtons() {
    this.buttons.view.addClass('disabled');
  }

  enableButtons() {
    this.buttons.view.removeClass('disabled');
  }

  resetButtons() {
    this.disableButton('reset');

    this.disableButton('run');
    this.hideButton('run');

    this.enableButton('ignit');
    this.showButton('ignit');
  }

  updateObjects(time, delta) {
    this.moveSatellite();

    if (this.running) {
      this.runner.timestamp += delta;

      this.updateCounter(time, delta);
      // this.updateSatellite(time, delta);
      
      if (this.runner.timestamp >= this.state.counter.switchers.value.chosen) {
        this.stop();
      }
    }

    // this.updateSatelliteRotation(this.running, delta);
  }

  reset(props = {}) {
    this.running = false;
    this.completed = false;
    this.state.step = 0;

    this.resetPlanet();
    this.resetSatellite();
    this.resetOrbits();
    this.resetArrow();
    this.resetCounter();
    this.resetButtons();
  }

  async ignit() {
    this.satellite.setStatic(true);

    await this.hideButton('ignit');
    this.disableButton('ignit');
    
    this.enableButton('reset');
    await this.showButton('run');

    this.state.step = 1;
  }

  subscribeArrow() {
    const onPointerEvent = (pointer) => {
      this.buildArrowEndPosition(pointer);
      this.buildArrowCorner();

      this.buildSatelliteRotation(pointer.position.x, pointer.position.y);
    }

    this.input.on('pointerdown', (pointer) => {
      this.activateArrow(true);
      onPointerEvent(pointer);

      this.input.on('pointermove', onPointerEvent);

      const onPointerUp = ((pointer) => {
        onPointerEvent(pointer);
        
        // this.buildSatelliteAcceleration();
        // this.buildSatelliteVelocity();

        this.state.step = 2;
        this.store();

        this.showCounterSwitchers();
        this.enableCounter();

        this.input.removeAllListeners();
        this.subscribeArrow();
      });
      
      this.input.on('pointerup', onPointerUp);
      this.input.on('pointerupoutside', onPointerUp);
    });
  }

  destroyArrow() {
    this.activateArrow(false);
    this.input.removeAllListeners();
  }

  run() {
    if (this.state.counter.switchers.value.chosen <= 0) return;

    this.buildSatelliteVelocity();
    this.buildOrbits();

    // const { ACCELERATION } = config.SATELLITE;

    // this.state.satellite.durations = {
    //   start: duration * ACCELERATION.START.PART,
    //   end: duration * ACCELERATION.END.PART,
    // };

    this.running = true;
    this.completed = true;

    this.state.step = 3;

    this.runner.timestamp = 0;

    this.state.counter.switchers.value.available -= this.state.counter.switchers.value.chosen;
    this.state.counter.switchers.list.forEach( state => state.value = 0 );
    // this.runner.satellite.rotation = this.state.satellite.rotation;

    this.satellite.setStatic(false);

    this.destroyArrow();

    this.disableButton('run');
    // this.enableButton('reset');

    this.disableCounter();
  }

  async stop() {
    this.running = false;

    // this.state.planet.orbit.radius = Phaser.Math.Distance.Between(this.satellite.x, this.satellite.y, this.planet.x, this.planet.y);
    // this.buildPlanet();
    // this.state.counter.switchers.value.available -= this.state.counter.switchers.value.chosen;
    // this.state.counter.switchers.list.forEach( state => state.value = 0 );

    await this.hideButton('run');


    if (this.state.counter.switchers.value.available > 0) {
      this.enableButton('ignit');
    }
    
    await this.showButton('ignit');
  }

  subscribeSatellite() {
    this.satellite.setOnCollide((data) => {
      this.running = false;
      this.satellite.setStatic(true);
      this.disableButton('ignit');
    });
  }

  subscribeButtons() {
    // RESET SLOPE AND BALL
    this.buttons.reset.view.on('click', (e) => {
      // console.log('RESETED');

      this.reset();
      this.store();
    });

    // IGNIT SATELLITE ENGINE
    this.buttons.ignit.view.on('click', async (e) => {
      // console.log('IGNITED');

      await this.ignit();
      this.store();
      
      this.subscribeArrow();
    });

    // RUN SATELLITE
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
    this.drawArrow();
  }

  drawArrow() {
    if (!this.state.arrow.activated) return;

    this.graphics.lineStyle(config.ARROW.WIDTH, config.ARROW.COLOR);

    this.graphics.beginPath();
    this.graphics.moveTo(this.satellite.x, this.satellite.y);
    this.graphics.lineTo(this.state.arrow.end.x, this.state.arrow.end.y);
    this.graphics.closePath();
    this.graphics.stroke();

    this.graphics.beginPath();

    const { vertices } = this.arrow.corner;

    this.graphics.moveTo(vertices[0].x, vertices[0].y);
    this.graphics.lineTo(this.state.arrow.end.x, this.state.arrow.end.y);
    this.graphics.lineTo(vertices[1].x, vertices[1].y);

    this.graphics.stroke();  
    // this.graphics.closePath();
  }

  drawOrbit(i) {
    const o = this.orbits[i];

    if (i < 2) {
      if (i === 0) {
        // Basic orbit
        this.graphics.beginPath();
        this.graphics.arc(o.x, o.y, o.radius, 0, 2 * Math.PI);
        this.graphics.closePath();
        this.graphics.stroke();
      }
      else {
        // Target orbit
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
    else {
      if (!config.PLANET.ORBIT.CURRENT.ENABLED) return;

      // Current orbit
      this.graphics.beginPath();

      o.forEach(({ x, y }) => this.graphics.lineTo(x, y));

      this.graphics.closePath();
      this.graphics.stroke();
    }
  }

  drawOrbits() {
    const { WIDTH, COLOR, OPACITY } = config.PLANET.ORBIT;

    this.graphics.lineStyle(WIDTH, COLOR, OPACITY);
    this.orbits.forEach( (o, i) => this.drawOrbit(i) );
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
