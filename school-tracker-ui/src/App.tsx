import { useEffect } from "react";

const clientId = "5jtiquv9uki2oddgh9brsf5hl8";
const domain =
  "https://kids-school-event-tracker-194442925705.auth.eu-west-2.amazoncognito.com";
const redirectUri = "http://localhost:5173/auth/callback";

export default function App() {
  useEffect(() => {
    const token = sessionStorage.getItem("id_token");
    if (token) {
      window.location.replace("/dashboard");
      return;
    }
    window.location.href = `${domain}/login?client_id=${clientId}&response_type=code&scope=openid&redirect_uri=${redirectUri}`;
  }, []);

  return null;
}
