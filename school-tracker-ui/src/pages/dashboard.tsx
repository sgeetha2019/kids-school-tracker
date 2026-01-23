import { useEffect, useState } from "react";
import Header from "../components/header";
import "./dashboard.css";
import ItemsTable from "../components/itemsTable";

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
    const token = sessionStorage.getItem("id_token");
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/school-items`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data?.message ?? "Failed to load items");
        }
        const list = Array.isArray(data) ? data : data.items ?? [];
        setItems(list);
      } catch (e: any) {
        setError(e.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  console.log("Loaded items:", items);
  console.log("Loading state:", loading);
  console.log("Error state:", error);
  return (
    <div>
      <Header />
      <main className="app-section">
        <ItemsTable
          items={items}
          loading={loading}
          //   onEdit={handleEdit()}
          //   onDelete={handleDelete}
        />
      </main>
    </div>
  );
}
