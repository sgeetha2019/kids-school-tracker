import { useEffect } from "react";

const clientId = "5jtiquv9uki2oddgh9brsf5hl8";
const domain =
  "https://kids-school-event-tracker-194442925705.auth.eu-west-2.amazoncognito.com";
const logoutRedirect = "http://localhost:5173/";

export default function Logout() {
  useEffect(() => {
    sessionStorage.clear();
    localStorage.clear();

    window.location.replace(
      `${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
        logoutRedirect
      )}`
    );
  }, []);

  return null;
}
