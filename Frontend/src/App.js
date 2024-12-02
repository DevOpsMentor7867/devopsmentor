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
import ResetPasswordComponent from "./components/Pages/ResetPasswordPage";

function App() {
  // const { user } = useAuthContext();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn />} />
        {/* <Route path="/dashboard/*" element={user ? <Dashboard /> : <LogIn />} /> */}
        <Route path="/dashboard/*" element={<Dashboard />} />
          <Route path={`/reset-password/:token`} element={ <ResetPasswordComponent/>} />

      </Routes>
    </Router>
  );
}

export default App;