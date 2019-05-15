/**
 * Created by 阿卡琳 on 14/06/2017.
 */
"use strict";

import { Content } from "./Content.jsx";
import { Footer } from "./Footer.jsx";
import { Header } from "./Header.jsx";
import { Loading } from "./Loading.jsx";

export const App = ({ loading }) => (
    <main className="app">
        <Header />
        {loading ? <Loading /> : <Content />}
        <Footer />
    </main>
);
