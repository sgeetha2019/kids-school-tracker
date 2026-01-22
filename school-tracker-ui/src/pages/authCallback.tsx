import { useEffect } from "react";

const clientId = "5jtiquv9uki2oddgh9brsf5hl8";
const domain =
  "https://kids-school-event-tracker-194442925705.auth.eu-west-2.amazoncognito.com";
const redirectUri = "http://localhost:5173/auth/callback";

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
        sessionStorage.setItem("refresh_token", data.refresh_token);
        window.location.href = "/dashboard";
      })
      .catch((e) => {
        console.error("Token exchange failed:", e);
      });
  }, []);

  return (
    <div>
      <button
        onClick={() => {
          localStorage.clear();
          window.location.href = `${domain}/logout?client_id=${clientId}&logout_uri=http://localhost:5173/`;
        }}
      >
        Go to Home
      </button>
    </div>
  );
}
