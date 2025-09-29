import React from "react";
import { Outlet } from "react-router-dom";
import LoginComponent from "../components/Login/LoginComponent";

const AuthLayout = () => {
    return (
        <div>
            <Outlet />
        </div>
    );
};

export default AuthLayout;

