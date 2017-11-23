/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";

import { Header } from "./Header.jsx";
import { Content } from "./Content.jsx";
import { Footer } from "./Footer.jsx";
import { ExtraStyle } from "./ExtraStyle.jsx";
import { Loading } from "./Loading.jsx";

const App = ({ loading }) => (
  <main className="app">
    <Header />
    {loading ? Loading() : <Content />}
    <Footer />
    <ExtraStyle />
  </main>
);

export default App;
