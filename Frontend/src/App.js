import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  // Navigate,
} from "react-router-dom";
// import Signup from "./components/Pages/SignUp";
import Home from "./components/Pages/Home";
import LogIn from "./components/Pages/Auntehtication";
import Dashboard from "./Dashboard/Dashboard";
import { useAuthContext } from "./API/UseAuthContext";
// import { useNavigate } from "react-router-dom";

function App() {
  const { user } = useAuthContext();
  // const Navigate = useNavigate();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard/*" element={user ? <Dashboard /> : <LogIn />} />
      </Routes>
    </Router>
  );
}

export default App;
