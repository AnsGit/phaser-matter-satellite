const config = {
  WIDTH: 1024,
  HEIGHT: 512,
  BACKGROUND_COLOR: '0x030B35',
  PLANET: {
    RADIUS: 32,
    DEPTH: 15,
    x: 512,
    y: 256,
    ORBIT: {
      // DEFAULT: { RADIUS: 56, SEGMENTS: 44, DASHED: false },
      DEFAULT: { RADIUS: 196, SEGMENTS: 44, DASHED: true },
      TARGET: { RADIUS: 216, SEGMENTS: 44, DASHED: true, WIDTH: 50 },
      CURRENT: { ENABLED: true },
      WIDTH: 1,
      COLOR: '0xA89CFF',
    }
  },
  SATELLITE: {
    WIDTH: 57,
    HEIGHT: 46,
    POSITION: { ROTATION: -Math.PI/2 },
    V: { x: -0.5, y: 0, k: 0.05 },
    ACCELERATION: {
      DURATION: 4600,
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
  PHYSICS: {
    
  }
};

export default config;