import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import LoggedLanding from "../components/Landing/LoggedLanding";

const LoggedLayout = () => {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if there's a user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user:", err);
      }
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <div className="text-white text-center mt-20">Loading...</div>;
  }

  // If no user, redirect to home ("/")


  // If user exists, allow access to Logged routes
  return (
    <>
      <LoggedLanding />
      <Outlet />
    </>
  );
};

export default LoggedLayout;
