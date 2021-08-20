import { Header } from "./components/Header";
import { Main } from "./pages/Main";
import { Footer } from "./components/Footer";

import { UserProvider } from "./context/UserState";

function App() {
  return (
    <div className="bg-gray-900">
      <UserProvider>
        <Header />
        <Main />
      </UserProvider>
      <Footer />
    </div>
  );
}

export default App;
