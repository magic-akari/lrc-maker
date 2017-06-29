/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";
import { Component } from "preact";

function PureComponent(props, context) {
  Component.call(this, props, context);
}

PureComponent.prototype = new Component({}, {}, {});
PureComponent.prototype.shouldComponentUpdate = function(props, state) {
  return shallowDiffers(this.props, props) || shallowDiffers(this.state, state);
};

function shallowDiffers(a, b) {
  for (let i in a) if (!(i in b)) return true;
  for (let i in b) if (a[i] !== b[i]) return true;
  return false;
}

export default PureComponent;
export { PureComponent };
