import { AppProvider } from "./app.context.js";
import { Content } from "./content.js";
import { Footer } from "./footer.js";
import { Header } from "./header.js";
import { Toast } from "./toast.js";

export const App: React.FC = () => {
    return (
        <AppProvider>
            <Header />
            <Content />
            <Footer />
            <Toast />
        </AppProvider>
    );
};
