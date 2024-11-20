import React, { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

export const RefreshHandler = ({ setIsAuthenticated, setIsVendorAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceLink } = useParams(); 

  useEffect(() => {
    const data = localStorage.getItem("user-info");
    const token = data ? JSON.parse(data).token : null;

    const vendorData = localStorage.getItem("vendor-user-info");
    const vendorToken = vendorData ? JSON.parse(vendorData).token : null;

    if (token) {
      setIsAuthenticated(true);

      if (location.pathname === "/" || location.pathname === "/login") {
        navigate("/home", { replace: true });
      } else if (location.pathname.startsWith("/join-workspace") && workspaceLink) {
        navigate(`/join-workspace/${workspaceLink}`, { replace: true });
      }
    }

    if (vendorToken) {
      setIsVendorAuthenticated(true);

      if (location.pathname === "/vendor-login" || location.pathname === "/vendor-portal") {
        navigate("/vendor-portal", { replace: true });
      }
    }
  }, [location.pathname, navigate, setIsAuthenticated, setIsVendorAuthenticated, workspaceLink]);

  return null;
};
