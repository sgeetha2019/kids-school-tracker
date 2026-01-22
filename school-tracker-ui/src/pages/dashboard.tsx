import Header from "../components/header";
import "./dashboard.css";

export default function Dashboard() {
  return (
    <div className="app-container">
      <Header />
      <main style={{ padding: 24 }}>
        <h2>Dashboard</h2>
      </main>
    </div>
  );
}
