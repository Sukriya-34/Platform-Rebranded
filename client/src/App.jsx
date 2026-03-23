import Signup from "./Pages/Signup";
import Login from "./Pages/Login";
import ForgotPassword from "./Pages/ForgotPassword";
import RoleSelection from "./Pages/RoleSelection";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";


function App() {
  // 1. We look at the web browser's search bar to see what the path is
  const currentPath = window.location.pathname;
  //set up a variable to hold the page we want to show
  let CurrentPage;

  // We check the URL and assign the correct page component
  if (currentPath === "/login") {
    CurrentPage = Login;
  } else if (currentPath === "/forgot-password") {
    CurrentPage = ForgotPassword;
  } else {
    CurrentPage = Signup;
  }
  return (
    <BrowserRouter>
      <div className="w-full h-full">
        <Routes>
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Your actual routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
