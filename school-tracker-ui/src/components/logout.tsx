import { useEffect } from "react";
import { clientId, domain, logoutUri } from "../auth/config";

export default function Logout() {
  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();

    window.location.replace(
      `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutUri
      )}`
    );
  }, []);

  return null;
}
