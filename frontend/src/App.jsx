import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Candidate } from "./pages/Candidate";
import { Employee } from "./pages/Employee";
import { Attendance } from "./pages/Attendance";
import { Leave } from "./pages/Leave";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login/>} />
        <Route path="dashboard" element={<Dashboard />}>
          <Route index element={<Candidate />} /> 
          <Route path="employees" element={<Employee />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="leaves" element={<Leave />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
