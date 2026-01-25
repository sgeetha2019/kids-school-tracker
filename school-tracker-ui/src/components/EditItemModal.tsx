import { useEffect, useState } from "react";
import type { SchoolItem } from "./itemsTable";
import "./editItemModal.css";

type PatchPayload = {
  kidName?: string;
  type?: string;
  status?: string;
  dueDate?: string;
  title?: string;
  notes?: string;
};

type Props = {
  open: boolean;
  item: SchoolItem | null;
  onClose: () => void;
  onSave: (kidId: string, patch: PatchPayload) => Promise<void>;
};

export default function EditItemModal({ open, item, onClose, onSave }: Props) {
  const [kidName, setKidName] = useState("");
  const [type, setType] = useState("homework");
  const [status, setStatus] = useState("PENDING");
  const [dueDate, setDueDate] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // when item changes, prefill
  useEffect(() => {
    if (!item) return;
    setKidName(item.kidName ?? "");
    setType(item.type ?? "homework");
    setStatus(item.status ?? "PENDING");
    setDueDate(item.dueDate ?? item.date ?? "");
    setTitle(item.title ?? "");
    setNotes(item.notes ?? "");
    setError(null);
  }, [item]);

  if (!open || !item) return null;

  const submit = async () => {
    setError(null);

    if (!kidName.trim() || !title.trim()) {
      setError("Kid name and title are required.");
      return;
    }

    setSaving(true);
    try {
      await onSave(item.kidId, {
        kidName: kidName.trim(),
        type,
        status,
        dueDate: dueDate || undefined,
        title: title.trim(),
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (e: any) {
      setError(e?.message ?? "Failed to update item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modalOverlay" onMouseDown={onClose}>
      <div className="modalCard" onMouseDown={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <div>
            <h3 className="modalTitle">Edit item</h3>
            <div className="modalSub">{item.kidId}</div>
          </div>

          <div className="modalActions">
            <button
              className="btn btn--secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              className="btn btn--primary"
              onClick={submit}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>

        <div className="modalBody">
          <div className="formGrid">
            <div className="field">
              <label className="field__label">Kid name *</label>
              <input
                className="field__input"
                value={kidName}
                onChange={(e) => setKidName(e.target.value)}
              />
            </div>

            <div className="field">
              <label className="field__label">Type</label>
              <select
                className="field__input"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="homework">homework</option>
                <option value="event">event</option>
                <option value="birthday">birthday</option>
                <option value="payment">payment</option>
                <option value="trip">trip</option>
              </select>
            </div>

            <div className="field">
              <label className="field__label">Status</label>
              <select
                className="field__input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="PENDING">PENDING</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
            </div>

            <div className="field">
              <label className="field__label">Due date</label>
              <input
                className="field__input"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="field field--full">
              <label className="field__label">Title *</label>
              <input
                className="field__input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="field field--full">
              <label className="field__label">Notes</label>
              <textarea
                className="field__textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="formCard__error">{error}</div>}
        </div>
      </div>
    </div>
  );
}
