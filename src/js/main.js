/**
 * Created by akari on 19/02/2017.
 */
import React from "react";
import {render} from "react-dom";
import App from "./components/App";
import "normalize.css"
import "./modernizr"
import "../css/app.css"

render(<App />, document.getElementById('react-root'));