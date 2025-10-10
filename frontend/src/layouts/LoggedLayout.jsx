import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import LoggedLanding from "../components/Landing/LoggedLanding";
import Navbar from "../components/Landing/navbar";

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
        console.error("Error parsing stored user:", err);
        setIsAuth(false);
      }
    } else {
      setIsAuth(false);
    }
  }, []);

  if (isAuth === null) {
    return <div className="text-center mt-20 text-white">Loading...</div>;
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
