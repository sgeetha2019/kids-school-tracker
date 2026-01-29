import { useEffect } from "react";
import { clientId, domain, redirectUri } from "../auth/config";

export default function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (!code) return;

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      client_id: clientId,
      code,
      redirect_uri: redirectUri,
    });

    fetch(`${domain}/oauth2/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(JSON.stringify(data));
        return data;
      })
      .then((data) => {
        sessionStorage.setItem("id_token", data.id_token);
        sessionStorage.setItem("access_token", data.access_token);
        window.location.href = "/dashboard";
      })
      .catch((error) => {
        console.error("Token exchange failed:", error);
      });
  }, []);

  return null;
}
