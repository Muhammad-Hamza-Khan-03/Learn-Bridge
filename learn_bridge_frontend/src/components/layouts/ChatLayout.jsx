import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import StudentLayout from "./studentLayout";
import TutorLayout from "./tutorLayout";

const ChatLayout = ({ children }) => {
  const { user, isAuthenticated, initialized } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not authenticated
    if (initialized && !isAuthenticated) {
      navigate("/signin");
    }
  }, [isAuthenticated, initialized, navigate]);

  // Return blank div while initializing to prevent flicker
  if (!initialized || !user) {
    return <div className="min-h-screen bg-gray-50"></div>;
  }

  // Check user role and render appropriate layout
  if (user.role === "student") {
    return <StudentLayout>{children}</StudentLayout>;
  } else if (user.role === "tutor") {
    return <TutorLayout>{children}</TutorLayout>;
  } else {
    // Fallback for other roles or if no role
    return <div className="container mx-auto p-4">{children}</div>;
  }
};

export default ChatLayout;