import { useEffect } from "react";
import { clientId, domain, redirectUri } from "./auth/config";

export default function App() {
  useEffect(() => {
    const token = sessionStorage.getItem("id_token");
    if (token) {
      window.location.replace("/dashboard");
      return;
    }
    window.location.href =
      `${domain}/login?client_id=${clientId}` +
      `&response_type=code` +
      `&scope=openid` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}`;
  }, []);

  return null;
}
