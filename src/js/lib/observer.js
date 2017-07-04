/**
 * Created by 阿卡琳 on 16/06/2017.
 */
"use strict";
import { Reaction } from "mobx";

function augment(object, key, func) {
  const origMethod = object[key];
  object[key] = function() {
    func.apply(this, arguments);
    if (origMethod) {
      origMethod.apply(this, arguments);
    }
  };
}

const mobxReaction = Symbol("mobxReaction");

export function observer(componentClass) {
  augment(componentClass.prototype, "componentWillMount", function() {
    const compName = this.constructor.displayName || this.constructor.name;
    this[mobxReaction] = new Reaction(`${compName}.render()`, () =>
      this.forceUpdate()
    );
  });

  augment(componentClass.prototype, "componentWillUnmount", function() {
    this[mobxReaction].dispose();
    this[mobxReaction] = null;
  });

  const origRender = componentClass.prototype.render;
  componentClass.prototype.render = function() {
    const args = arguments;

    let renderResult;
    this[mobxReaction].track(() => {
      renderResult = origRender.apply(this, args);
    });

    return renderResult;
  };
}
