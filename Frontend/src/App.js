import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import Home from "./components/Pages/Home";
import LogIn from "./components/Pages/Auntehtication";
// import { useAuthContext } from "./API/UseAuthContext";
import Dashboard from "./Dashboard/Dashboard";
// import TerminalQuiz from "./Dashboard/Components/Terminal";

function App() {
  // const { user } = useAuthContext();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        {/* <Route path="/dashboard/*" element={user ? <Dashboard /> : <LogIn />} /> */}
        <Route path="/dashboard/*" element={<Dashboard />} />

      </Routes>
    </Router>
  );
}

export default App;