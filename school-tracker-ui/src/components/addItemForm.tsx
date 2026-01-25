import { useState } from "react";
import "./addItemForm.css";

type AddPayload = {
  kidName: string;
  type: string;
  status: string;
  dueDate?: string;
  title: string;
  notes?: string;
};

type Props = {
  onAdd: (payload: AddPayload) => Promise<void>;
};

export default function AddItemForm({ onAdd }: Props) {
  const [kidName, setKidName] = useState("");
  const [type, setType] = useState("homework");
  const [status, setStatus] = useState("PENDING");
  const [dueDate, setDueDate] = useState("");
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!kidName.trim() || !title.trim()) {
      setError("Kid name and title are required.");
      return;
    }

    setSaving(true);
    try {
      await onAdd({
        kidName: kidName.trim(),
        type,
        status,
        dueDate: dueDate || undefined,
        title: title.trim(),
        notes: notes.trim() || undefined,
      });

      // reset
      setKidName("");
      setType("homework");
      setStatus("PENDING");
      setDueDate("");
      setTitle("");
      setNotes("");
    } catch (error: any) {
      setError(error.message ?? "Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="itemsCard">
      <div className="formCard__header">
        <div>
          <h2 className="formCard__title">Add item</h2>
          <div className="formCard__sub">
            Create a new homework/event/birthday/payment/trip item
          </div>
        </div>

        <button
          className="btn btn--secondary"
          type="submit"
          form="addItemForm"
          disabled={saving}
        >
          {saving ? "Saving..." : "Add"}
        </button>
      </div>

      <form id="addItemForm" onSubmit={submit} className="formCard__body">
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
      </form>
    </section>
  );
}
