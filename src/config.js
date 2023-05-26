const config = {
  LOCAL_STORAGE: true,
  WIDTH: 1024,
  HEIGHT: 512,
  BACKGROUND_COLOR: '0x030B35',
  PLANET: {
    SIZE: 32,
    x: 512,
    y: 256,
    ORBIT: {
      DEFAULT: { RADIUS: 56 },
      TARGET: { RADIUS: 216, SEGMENTS: 44 },
      COLOR: '0x82D2FF'
    }
  },
  SATELLITE: {
    WIDTH: 52,
    HEIGHT: 49,
    POSITION: { ROTATION: -Math.PI/2 },
    POWER: {
      DEFAULT: 0.1,
      ACCELERATION: 1.3
    },
    ACCELERATION: {
      DURATION: 9000,
      START: {
        // Part of full duration which will be used to rotation on start of acceleration
        PART: 1/3
      },
      END: {
        // Part of full duration which will be used to rotation on end of acceleration
        PART: 1/3
      }
    },
    DIRECTION: {
      // x: 0, y: 256 - 56
      x: 250, y: 90
    }
  },
  PHYSICS: {
    
  }
};

export default config;