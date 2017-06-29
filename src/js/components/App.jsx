/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";

import { Header } from "./Header.jsx";
import { Content } from "./Content.jsx";
import { Footer } from "./Footer.jsx";
import { ExtraStyle } from "./ExtraStyle.jsx";

const App = () =>
  <main className="app">
    <Header />
    <Content />
    <Footer />
    <ExtraStyle />
  </main>;

export default App;
