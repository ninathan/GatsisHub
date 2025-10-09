import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { supabase } from "../../supabaseClient";
import LoggedLanding from "../components/Landing/LoggedLanding";

const LoggedLayout = () => {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="text-white text-center mt-20">Loading...</div>; // avoid redirect while checking
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <LoggedLanding />
      <Outlet />
    </>
  );
};

export default LoggedLayout;
