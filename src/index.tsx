import ReactDOM from 'react-dom';
import './css/style.css';

import PIXI from "./pixi";
import App from "./app";

new PIXI();
ReactDOM.render(<App />, document.getElementById("root"));
