const config = {
  LOCAL_STORAGE: false,
  WIDTH: 1024,
  HEIGHT: 512,
  BACKGROUND_COLOR: '0x030B35',
  PLANET: {
    RADIUS: 32,
    x: 512,
    y: 256,
    ORBIT: {
      DEFAULT: { RADIUS: 56 },
      TARGET: { RADIUS: 216, SEGMENTS: 44 },
      WIDTH: 1,
      COLOR: '0x82D2FF',
      OPACITY: 0.5
    }
  },
  SATELLITE: {
    WIDTH: 52,
    HEIGHT: 49,
    POSITION: { ROTATION: -Math.PI/2 },
    V: { x: -0.5, y: 0 },
    POWER: {
      DEFAULT: 0.1,
      ACCELERATION: 1.3
    },
    ACCELERATION: {
      DURATION: 9000,
      START: {
        // Part of full duration which will be used to rotation on start of acceleration
        PART: 1/5
      },
      END: {
        // Part of full duration which will be used to rotation on end of acceleration
        PART: 1/2
      }
    }
  },
  ARROW: {
    END: { x: 0, y: 200 },
    WIDTH: 3,
    ANGLE: {
      // MIN: -260 * Math.PI/180,
      // MAX: -50 * Math.PI/180
      MIN: -190 * Math.PI/180,
      MAX: -90 * Math.PI/180
    },
    LENGTH: { MIN: 40 },
    COLOR: '0x03C3EF',
    CORNER: {
      RADIUS: 15,
      ANGLE: Math.PI/2
    }
  },
  PHYSICS: {
    
  }
};

export default config;