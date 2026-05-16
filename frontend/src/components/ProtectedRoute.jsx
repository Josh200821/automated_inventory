import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "./../AuthContext";

const PrivateRoute = ({ children, role }) => {
  const { token, userRole } = useContext(AuthContext);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
