import Signup from "./Pages/Auth/Signup";
import Login from "./Pages/Auth/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import RoleSelection from "./Pages/Auth/RoleSelection";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import VerifyOTP from "./Pages/Auth/VerifyOTP";

import MyCourses from './Pages/Creator/MyCourse';
import CreateCourse from './Pages/Creator/CreateCourse';
import CourseDetail from './Pages/Creator/CourseDetail';

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
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Creator Routes */}
          <Route path="/creator/courses" element={<MyCourses />} />
          <Route path="/creator/courses/new" element={<CreateCourse />} />
          <Route path="/creator/courses/:id" element={<CourseDetail />} />

          <Route
            path="*"
            element={<div className="p-8 font-poppins">Page not found</div>}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
