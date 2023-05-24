const config = {
  LOCAL_STORAGE: true,
  WIDTH: 1024,
  HEIGHT: 512,
  BACKGROUND_COLOR: '0x030B35',
  PLANET: {
    SIZE: 32,
    x: 512,
    y: 256,
    ORBIT: { RADIUS: 56 }
  },
  SATELLITE: {
    WIDTH: 52,
    HEIGHT: 49,
    POSITION: { ROTATION: -Math.PI/2 },
    POWER: 2
  },
  PHYSICS: {
    
  }
};

export default config;