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
      ACCELERATION: 1.2
    },
    ACCELERATION: {
      DURATION: 9000,
      START: {
        DURATION: 500
      },
      END: {
        DURATION: 500
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