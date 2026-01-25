import { useEffect, useState } from "react";
import Header from "../components/header";
import "./dashboard.css";
import ItemsTable from "../components/itemsTable";
import AddItemForm from "../components/addItemForm";
import EditItemModal from "../components/EditItemModal";

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

type FormState = {
  kidName: string;
  type: string;
  status: string;
  dueDate?: string;
  title: string;
  notes?: string;
};

export default function Dashboard() {
  const [items, setItems] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<SchoolItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const getToken = () => sessionStorage.getItem("id_token");

  useEffect(() => {
    const token = getToken();
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

  const handleAdd = async (payload: FormState) => {
    const token = getToken();
    if (!token) throw new Error("Not logged in");

    const res = await fetch(`${API_BASE}/school-items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message ?? "Failed to add item");

    setItems((prev) => [data, ...prev]);
  };

  const handleEdit = (item: SchoolItem) => {
    setEditingItem(item);
    setEditOpen(true);
  };

  const handleSaveEdit = async (kidId: string, patch: any) => {
    const token = getToken();
    const res = await fetch(
      `${API_BASE}/school-items/${encodeURIComponent(kidId)}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(patch),
      }
    );
    console.log("Response from update:", res);
    const updatedData = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(updatedData?.message ?? "Update failed");

    setItems((prev) =>
      prev.map((item) =>
        item.kidId === kidId ? { ...item, ...updatedData } : item
      )
    );
  };

  const handleDelete = async (kidId: string) => {
    const ok = window.confirm("Delete this item?");
    if (!ok) return;

    const token = getToken();

    try {
      const res = await fetch(
        `${API_BASE}/school-items/${encodeURIComponent(kidId)}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message ?? "Failed to delete item");
      }

      setItems((prev) =>
        prev.filter((schoolItems) => schoolItems.kidId !== kidId)
      );
    } catch (e: any) {
      setError(e.message ?? "Unknown error");
    }
  };

  console.log("Error state:", error);
  return (
    <div>
      <Header />
      <main className="app-section">
        <AddItemForm onAdd={handleAdd} />
        <ItemsTable
          items={items}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        <EditItemModal
          open={editOpen}
          item={editingItem}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveEdit}
        />
      </main>
    </div>
  );
}
