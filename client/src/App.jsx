import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layouts
import CreatorLayout from "./layouts/CreatorLayout";

// Auth Pages
import Signup from "./Pages/Auth/Signup";
import Login from "./Pages/Auth/Login";
import ForgotPassword from "./Pages/Auth/ForgotPassword";
import RoleSelection from "./Pages/Auth/RoleSelection";
import VerifyOTP from "./Pages/Auth/VerifyOTP";
import ResetPassword from "./Pages/Auth/ResetPassword";

// Creator Pages
import Dashboard from "./Pages/Creator/Dashboard";
import Courses from "./Pages/Creator/Courses";
import UploadContent from "./Pages/Creator/UploadContent";
import ManageContent from "./Pages/Creator/ManageContent";

export default function App() {
  // 1. Preserve your original auth checks
  const currentPath = window.location.pathname;
  let CurrentPage;

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
          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Creator Routes Wrapped in the Layout */}
          <Route path="/creator" element={<CreatorLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="courses" element={<Courses />} />
            <Route path="upload" element={<UploadContent />} />
            <Route path="manage" element={<ManageContent />} />
          </Route>

          {/* 404 Route */}
          <Route
            path="*"
            element={<div className="p-8 font-poppins">Page not found</div>}
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
