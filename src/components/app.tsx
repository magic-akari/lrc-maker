import { AppProvider } from "./app.context.js";
import { Content } from "./content.js";
import { Footer } from "./footer.js";
import { Header } from "./header.js";
import { Toast } from "./toast.js";

const App: React.FC = () => {
    return (
        <AppProvider>
            <Header />
            <Content />
            <Footer />
            <Toast />
        </AppProvider>
    );
};

const akariOdango = document.querySelector(".akari-odango-loading")!;
const pageLoading = akariOdango.parentElement!;

akariOdango.addEventListener(
    "animationend",
    () => {
        pageLoading.remove();
    },
    { once: true },
);

akariOdango.classList.remove("start-loading");
akariOdango.classList.add("stop-loading");

ReactDOM.render(<App />, document.querySelector(".app-container"));
