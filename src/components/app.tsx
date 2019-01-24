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

ReactDOM.render(<App />, document.querySelector(".app-container"));
