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
import Dashboard from "./components/Pages/Dashboard";

function App() {
  return (
    //  <Signup/>
    <Router>
      <Routes>
      <Route path="/" element={ <Home />} />
      {/* <Route path="/signup" element={ <Signup />} /> */}
      <Route path="/login" element={ <LogIn />} />
      <Route path="/Dashboard" element={ <Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
