import { useEffect, useMemo, useState } from "react";

const API_BASE = "https://fsrst17t9k.execute-api.eu-west-2.amazonaws.com/prod";

type SchoolItem = {
  userId: string;
  kidId: string;
  type?: string;
  kidName?: string;
  status?: string;
  dueDate?: string; // you used dueDate in put lambda
  date?: string; // keep if old items used date
  title?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type FormState = {
  kidName: string;
  type: string;
  status: string;
  dueDate: string;
  title: string;
  notes: string;
};

const initialForm: FormState = {
  kidName: "",
  type: "homework",
  status: "PENDING",
  dueDate: "",
  title: "",
  notes: "",
};

export default function Dashboard() {
  const [items, setItems] = useState<SchoolItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [form, setForm] = useState<FormState>(initialForm);

  const token = useMemo(() => sessionStorage.getItem("id_token"), []);

  const authHeaders = useMemo(() => {
    if (!token) return null;
    return {};
  }, [token]);

  const loadItems = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!authHeaders) {
        setError("Not logged in (missing id_token).");
        return;
      }

      const res = await fetch(`${API_BASE}/school-items`, {
        method: "GET",
        headers: {
          ...authHeaders,
        },
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? "Failed to load items");

      const list = Array.isArray(data) ? data : data.items ?? [];
      setItems(list);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setSaving(true);

      if (!authHeaders) {
        setError("Not logged in (missing id_token).");
        return;
      }

      // minimal client-side validation (keep it simple)
      if (!form.kidName.trim()) throw new Error("Kid name is required");
      if (!form.title.trim()) throw new Error("Title is required");

      const res = await fetch(`${API_BASE}/school-items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({
          kidName: form.kidName,
          type: form.type,
          status: form.status,
          dueDate: form.dueDate,
          title: form.title,
          notes: form.notes,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? "Failed to create item");

      // Optimistic append (or reloadItems() if you prefer)
      setItems((prev) => [data, ...prev]);
      setForm(initialForm);
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (kidId: string) => {
    try {
      setError(null);

      if (!authHeaders) {
        setError("Not logged in (missing id_token).");
        return;
      }

      const ok = window.confirm("Delete this item?");
      if (!ok) return;

      // IMPORTANT: kidId contains #, so encode it
      const res = await fetch(
        `${API_BASE}/school-items/${encodeURIComponent(kidId)}`,
        {
          method: "DELETE",
          headers: {
            ...authHeaders,
          },
        }
      );

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message ?? "Failed to delete item");

      setItems((prev) => prev.filter((x) => x.kidId !== kidId));
    } catch (e: any) {
      setError(e?.message ?? "Unknown error");
    }
  };

  // Simple status color dot
  const statusDot = (status?: string) => {
    const s = (status ?? "").toUpperCase();
    const bg =
      s === "DONE" ? "#16a34a" : s === "IN_PROGRESS" ? "#f59e0b" : "#ef4444";
    return (
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 10,
          borderRadius: 999,
          background: bg,
          marginRight: 8,
          verticalAlign: "middle",
        }}
      />
    );
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f6f7fb" }}>
      {/* Header */}
      <header
        style={{
          background: "#111827",
          color: "white",
          padding: "16px 24px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>
            Kids School Tracker
          </div>
          <div style={{ fontSize: 13, opacity: 0.8 }}>
            Homework • Events • Reminders
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "24px auto", padding: "0 24px" }}>
        {/* Error banner */}
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              border: "1px solid #fecaca",
              padding: 12,
              borderRadius: 10,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {/* Top row: create form */}
        <section
          style={{
            background: "white",
            borderRadius: 14,
            padding: 16,
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            marginBottom: 18,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Add new item</h2>
            <button
              onClick={loadItems}
              disabled={loading}
              style={{
                marginLeft: "auto",
                padding: "8px 12px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "white",
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>

          <form onSubmit={createItem} style={{ marginTop: 12 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1.2fr 1fr 1fr 1fr",
                gap: 10,
              }}
            >
              <input
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="Title (e.g., Math worksheet)"
                style={inputStyle}
              />
              <input
                value={form.kidName}
                onChange={(e) =>
                  setForm((p) => ({ ...p, kidName: e.target.value }))
                }
                placeholder="Kid name (e.g., Rhea)"
                style={inputStyle}
              />
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((p) => ({ ...p, type: e.target.value }))
                }
                style={inputStyle}
              >
                <option value="homework">homework</option>
                <option value="event">event</option>
                <option value="payment">payment</option>
                <option value="reminder">reminder</option>
                <option value="trip">trip</option>
              </select>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                style={inputStyle}
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>

              <input
                value={form.dueDate}
                onChange={(e) =>
                  setForm((p) => ({ ...p, dueDate: e.target.value }))
                }
                placeholder="Due date (YYYY-MM-DD)"
                style={inputStyle}
              />

              <input
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Notes"
                style={{ ...inputStyle, gridColumn: "span 2" }}
              />

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "10px 12px",
                  borderRadius: 10,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: 600,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
              >
                {saving ? "Saving..." : "Add"}
              </button>
            </div>
          </form>
        </section>

        {/* Table */}
        <section
          style={{
            background: "white",
            borderRadius: 14,
            overflow: "hidden",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          }}
        >
          <div style={{ padding: 16, borderBottom: "1px solid #e5e7eb" }}>
            <h2 style={{ margin: 0, fontSize: 16 }}>Your items</h2>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
              Showing {items.length} item(s)
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 16 }}>Loading...</div>
          ) : items.length === 0 ? (
            <div style={{ padding: 16 }}>No items yet.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 14,
                }}
              >
                <thead style={{ background: "#f3f4f6" }}>
                  <tr>
                    <Th>Title</Th>
                    <Th>Kid</Th>
                    <Th>Type</Th>
                    <Th>Status</Th>
                    <Th>Due date</Th>
                    <Th>Actions</Th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((it) => (
                    <tr key={`${it.userId}-${it.kidId}`} style={rowStyle}>
                      <Td>
                        <div style={{ fontWeight: 600 }}>
                          {it.title || "(no title)"}
                        </div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>
                          {it.kidId}
                        </div>
                      </Td>
                      <Td>{it.kidName ?? "-"}</Td>
                      <Td>{it.type ?? "-"}</Td>
                      <Td>
                        {statusDot(it.status)}
                        <span style={{ verticalAlign: "middle" }}>
                          {it.status ?? "-"}
                        </span>
                      </Td>
                      <Td>{it.dueDate ?? it.date ?? "-"}</Td>
                      <Td>
                        <div style={{ display: "flex", gap: 8 }}>
                          {/* Edit button scaffold (we’ll wire PUT next) */}
                          <button
                            type="button"
                            onClick={() =>
                              alert("Next: implement Edit modal + PUT")
                            }
                            style={secondaryBtn}
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteItem(it.kidId)}
                            style={dangerBtn}
                          >
                            Delete
                          </button>
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  outline: "none",
};

const rowStyle: React.CSSProperties = {
  borderTop: "1px solid #e5e7eb",
};

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th
      style={{
        textAlign: "left",
        padding: "10px 12px",
        fontSize: 12,
        color: "#374151",
        fontWeight: 700,
        borderBottom: "1px solid #e5e7eb",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "12px" }}>{children}</td>;
}

const secondaryBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "white",
  cursor: "pointer",
};

const dangerBtn: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "none",
  background: "#ef4444",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};
