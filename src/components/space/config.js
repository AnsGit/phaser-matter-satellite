const config = {
  WIDTH: 1024,
  HEIGHT: 512,
  BACKGROUND_COLOR: '0x030B35',
  PLANET: {
    // RADIUS: 32,
    RADIUS: 128,
    DEPTH: 15,
    x: 512,
    y: 256,
    ORBIT: {
      // DEFAULT: { RADIUS: 56, SEGMENTS: 44, DASHED: false },
      DEFAULT: { RADIUS: 196, SEGMENTS: 44, DASHED: true },
      TARGET: { RADIUS: 216, SEGMENTS: 44, DASHED: true, WIDTH: 50 },
      CURRENT: { ENABLED: true, POINTS: 5000 },
      WIDTH: 1,
      COLOR: '0xA89CFF',
    }
  },
  SATELLITE: {
    WIDTH: 57,
    HEIGHT: 46,
    ORIGIN: { x: 0.4, y: 0.5 },
    POSITION: { ROTATION: -Math.PI/2 },
    V: { x: -0.5, y: 0, k: 0.05 },
    ACCELERATION: {
      DURATION: 4600,
    },
    CONNECTION: {
      LOSS: {
        DISTANCE: 100
      }
    }
  },
  ARROW: {
    WIDTH: 3,
    LENGTH: { MIN: 40 },
    COLOR: '0xFFCC6B',
    CORNER: {
      RADIUS: 15,
      ANGLE: Math.PI/2
    }
  },
  COUNTER: {
    STATUS: {
      VALUE: {
        BOTTOM: 15,
        INTEGER: false
      }
    }
  },
  PHYSICS: {
    
  }
};

export default config;