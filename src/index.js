import "./styles.css";
import $ from "jquery";

import Space from "./components/space/space.js";

const state = JSON.parse(window.localStorage['matter-satellite']);

const space = new Space();

$('body').append( space.view );

space.build(state);