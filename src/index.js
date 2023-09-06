import "./styles.css";
import $ from "jquery";

import Space from "./components/space/space.js";

const restore = () => {
  if (!window.localStorage['matter-satellite']) return {};

  return {};
  return JSON.parse(window.localStorage['matter-satellite']);
}

const store = (state) => {
  window.localStorage['matter-satellite'] = JSON.stringify(state);
}

const state = restore();

const space = new Space();

$('body').append( space.view );

(async () => {
  await space.build(state);
  setTimeout(async() => {

    await space.scene.changeOrbit(0, { radius: 56, gap: 0, duration: 3000 });
    await space.scene.changeOrbit(0, { radius: 100, gap: 1, duration: 3000 });

    const onUpdate = () => {
      store(space.getState());
    }

    const subscribe = async () => {
      const props = {
        onDown: (result) => {
          space.unsubscribe();
          console.log('onDown: ', result);
        },
        onComplete: async (result) => {
          onUpdate();

          console.log('onComplete: ', result);
          subscribe();
        },
      };

      space.subscribe(props);
    }

    subscribe();

    // space.subscribe({
    //   onDown: (result) => {
    //     console.log('onDown: ', result);
    //   },
    //   onComplete: async (result) => {
    //     console.log('onComplete: ', result);
    //   },
    // });
  }, 100);
})();

