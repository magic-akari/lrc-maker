/**
 * Created by 阿卡琳 on 16/06/2017.
 */
"use strict";
import { observable, action } from "mobx";

class Router {
  constructor() {
    if (typeof window !== "undefined") {
      this.path = location.hash;
      addEventListener("hashchange", action(() => (this.path = location.hash)));
    }
  }
  @observable path = "";

  static get editor() {
    return { title: "编辑", path: "#/" };
  }
  static get synchronizer() {
    return { title: "打轴", path: "#/synchronizer/" };
  }
  static get preferences() {
    return { title: "设置", path: "#/preferences/" };
  }
}

const router = new Router();
export { router, Router };
