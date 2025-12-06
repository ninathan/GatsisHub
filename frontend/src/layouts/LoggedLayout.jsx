import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import LoggedLanding from "../components/Landing/LoggedLanding";
import Navbar from "../components/Landing/navbar";
import LoadingSpinner from "../components/LoadingSpinner";

const LoggedLayout = () => {
  const [isAuth, setIsAuth] = useState(null); // null = loading

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        // you can also verify if user has a valid token property
        setIsAuth(!!user);
      } catch (err) {

        setIsAuth(false);
      }
    } else {
      setIsAuth(false);
    }
  }, []);

  if (isAuth === null) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <LoadingSpinner size="lg" text="Loading..." />
        </div>
    );
  }

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
};

export default LoggedLayout;
