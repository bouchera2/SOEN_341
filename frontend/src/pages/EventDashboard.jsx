import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function EventDashboard() {
  const { id = "abc123" } = useParams();

  // ---- DUMMY DATA (hardcoded) (replace with Firebase later) ----
  const [stats, setStats] = useState(null);
  useEffect(() => {
    const DUMMY = {
      id,
      title: "Dummy Event Dashboard",
      capacity: 150,
      issued: 96,
      checked: 73,
      remaining: 150 - 96,
      attendanceRate: 96 === 0 ? 0 : 73 / 96,
    };
    setStats(DUMMY);
  }, [id]);

  if (!stats) return <div className="container py-4">Loading…</div>;

  const pct = Math.round(stats.attendanceRate * 100);
  const tiles = [
    ["Capacity", stats.capacity],
    ["Tickets Issued", stats.issued],
    ["Checked-in", stats.checked],
    ["Remaining", stats.remaining],
  ];

  return (
    <div className="container py-4">
      <h3 className="mb-3">{stats.title} — Dashboard</h3>

      <div className="row g-3">
        {tiles.map(([label, val], i) => (
          <div className="col-md-3" key={i}>
            <div className="card h-100">
              <div className="card-body">
                <div className="text-muted small">{label}</div>
                <div className="display-6">{val}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="text-muted small mb-1">Attendance Rate</div>
        <div className="progress" role="progressbar" aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">
          <div className="progress-bar" style={{ width: `${pct}%` }}>{pct}%</div>
        </div>
      </div>
    </div>
  );
}