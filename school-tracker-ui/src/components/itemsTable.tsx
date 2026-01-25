import "./itemsTables.css";
export type SchoolItem = {
  userId: string;
  kidId: string;
  type?: string;
  kidName?: string;
  status?: string;
  date?: string;
  dueDate?: string;
  title?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  items: SchoolItem[];
  loading: boolean;
  onEdit: (item: SchoolItem) => void;
  onDelete: (kidId: string) => void;
};

function Status({ status }: { status?: string }) {
  const cls =
    status === "DONE"
      ? "status status--done"
      : status === "PENDING"
      ? "status status--pending"
      : "status status--other";

  return <span className={cls}>{status}</span>;
}

export default function ItemsTable({
  items,
  loading,
  onDelete,
  onEdit,
}: Props) {
  return (
    <section className="itemsCard">
      {loading ? (
        <div className="itemsCard__body">Loading...</div>
      ) : items.length === 0 ? (
        <div className="itemsCard__body">No items yet.</div>
      ) : (
        <div className="itemsTableWrap">
          <table className="itemsTable">
            <thead>
              <tr>
                <th>Kid</th>
                <th>Type</th>
                <th>Title</th>
                <th>Status</th>
                <th>Due date</th>
                <th>Notes</th>
                <th className="itemsTable__actionsCol">Actions</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr key={`${item.userId}-${item.kidId}`}>
                  <td>
                    <div className="itemsTable__kidName">{item.kidName}</div>
                    <div className="itemsTable__sub">{item.kidId}</div>
                  </td>
                  <td>{item.type ?? "-"}</td>
                  <td>{item.title ?? "-"}</td>

                  <td>
                    <Status status={item.status} />
                  </td>

                  <td>{item.dueDate ?? "-"}</td>
                  <td>{item.notes ?? "-"}</td>
                  <td>
                    <div className="itemsTable__actions">
                      <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => onEdit(item)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="btn btn--danger"
                        onClick={() => onDelete(item.kidId)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
