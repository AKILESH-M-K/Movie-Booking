import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { safeReturnPath } from "../utils/navigation";

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: safeReturnPath(`${location.pathname}${location.search}`) }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
