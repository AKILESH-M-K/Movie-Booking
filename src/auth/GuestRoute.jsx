import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { safeReturnPath } from "../utils/navigation";

// Login and signup are for signed-out users only. Signed-in users are sent
// home instead of seeing the form again.
function GuestRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const destination = safeReturnPath(location.state?.from);
    return <Navigate to={destination} replace />;
  }

  return <Outlet />;
}

export default GuestRoute;
