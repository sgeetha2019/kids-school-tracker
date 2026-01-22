import { useEffect, useState } from "react";

const API_BASE = "https://fsrst17t9k.execute-api.eu-west-2.amazonaws.com/prod";

type SchoolItem = {
  userId: string;
  kidId: string;
  type?: string;
  kidName?: string;
  status?: string;
  date?: string;
  title?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function Dashboard() {
  const [items, setItems] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const idToken = sessionStorage.getItem("id_token");
    if (!idToken) {
      setError("Not logged in");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/school-items`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${idToken}`,
      },
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message ?? "Failed to load items");
        return data;
      })
      .then((data) => {
        // depending on your lambda response shape:
        // if it's { items: [...] } use data.items, otherwise use data directly
        setItems(Array.isArray(data) ? data : data.items ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;
  if (error)
    return <div style={{ padding: 24, color: "crimson" }}>{error}</div>;

  return (
    <div style={{ padding: 24 }}>
      <h2>Dashboard</h2>

      {items.length === 0 ? (
        <p>No items yet.</p>
      ) : (
        <ul>
          {items.map((it) => (
            <li key={`${it.userId}-${it.kidId}`}>
              <strong>{it.title}</strong> — {it.kidName} — {it.type} —{" "}
              {it.status} — {it.date} <br />
              <small>{it.kidId}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
