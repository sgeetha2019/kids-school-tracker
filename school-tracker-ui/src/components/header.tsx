import "./header.css";
export default function Header() {
  return (
    <header className="app-header">
      <h1 className="app-title">School Tracker</h1>
      <a href="/logout" className="app-link">
        Log Out
      </a>
    </header>
  );
}
