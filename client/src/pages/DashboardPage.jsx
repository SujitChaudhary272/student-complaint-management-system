import { useMemo, useState } from "react";
import { api } from "../main";
const date = (value) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
const statusClass = (value) => value.toLowerCase().replace(/\s+/g, "-");
function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">CC</span>
      <span>
        Campus<span>Care</span>
      </span>
    </div>
  );
}
function Details({ item, close }) {
  if (!item) return null;
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      <section
        className="complaint-modal"
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">COMPLAINT DETAILS</p>
            <h2>{item.complaintCode}</h2>
          </div>
          <button className="modal-close" onClick={close}>
            ×
          </button>
        </div>
        <div className="detail-grid">
          <div>
            <span>Student</span>
            <strong>{item.studentName}</strong>
          </div>
          <div>
            <span>Submitted</span>
            <strong>{date(item.createdAt)}</strong>
          </div>
          <div>
            <span>Category</span>
            <strong>{item.category}</strong>
          </div>
          <div>
            <span>Location</span>
            <strong>{item.location || "Not specified"}</strong>
          </div>
          <div>
            <span>Priority</span>
            <strong>{item.priority}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong>{item.status}</strong>
          </div>
          <div className="detail-full">
            <span>Title</span>
            <strong>{item.title}</strong>
          </div>
          <div className="detail-full">
            <span>Description</span>
            <p>{item.description}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
function Table({ rows, admin, meta, update, remove, open }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const filtered = useMemo(
    () =>
      rows.filter(
        (x) =>
          `${x.prnNo} ${x.complaintCode} ${x.title} ${x.studentName}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (category === "All" || x.category === category) &&
          (status === "All" || x.status === status),
      ),
    [rows, query, category, status],
  );
  return (
    <section className="complaint-card">
      <div className="table-toolbar">
        <div>
          <h2>Complaint register</h2>
          <p>{filtered.length} records shown</p>
        </div>
        <div className="filters">
          <input
            placeholder="Search complaint"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>All</option>
            {meta.categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="quick-filters">
        <button
          className={status === "All" ? "active" : ""}
          onClick={() => setStatus("All")}
        >
          All
        </button>
        {meta.statuses.map((x) => (
          <button
            key={x}
            className={status === x ? "active" : ""}
            onClick={() => setStatus(x)}
          >
            {x}
          </button>
        ))}
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>PRN No.</th>
              <th>Name</th>
              <th>Complaint</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((x) => (
              <tr key={x._id}>
                <td>
                  <span className="reference">{x.prnNo}</span>
                </td>
                <td>{x.studentName}</td>
                <td>
                  {admin ? (
                    <button className="complaint-link" onClick={() => open(x)}>
                      <strong>{x.title}</strong>
                      <small>{x.category}</small>
                    </button>
                  ) : (
                    <>
                      <strong>{x.title}</strong>
                      <small>{x.category}</small>
                    </>
                  )}
                </td>
                <td>
                  <span className={`priority ${x.priority.toLowerCase()}`}>
                    {x.priority}
                  </span>
                </td>
                <td>
                  {admin ? (
                    <select
                      className="status-select"
                      value={x.status}
                      onChange={(e) => update(x._id, e.target.value)}
                    >
                      {meta.statuses.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`badge ${statusClass(x.status)}`}>
                      {x.status}
                    </span>
                  )}
                </td>
                <td>{date(x.createdAt)}</td>
                <td>
                  {admin ? (
                    x.status === "Resolved" ? (
                      <button
                        className="delete-button"
                        onClick={() => remove(x)}
                      >
                        Delete
                      </button>
                    ) : (
                      <span className="delete-hint">Resolve to delete</span>
                    )
                  ) : x.status !== "Resolved" ? (
                    <button className="delete-button" onClick={() => remove(x)}>
                      Delete request
                    </button>
                  ) : (
                    <span className="delete-hint">Resolved</span>
                  )}
                </td>
              </tr>
            ))}
            {!filtered.length && (
              <tr>
                <td className="empty" colSpan={admin ? 7 : 6}>
                  No complaints match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function Form({ meta, submit }) {
  return (
    <section className="form-shell">
      <div className="form-heading">
        <p className="eyebrow">NEW REQUEST</p>
        <h1>Tell us what needs attention.</h1>
      </div>
      <form className="complaint-form" onSubmit={submit}>
        <label className="full">
          PRN number
          <input name="prnNo" maxLength="30" required />
        </label>
        <label className="full">
          Complaint title
          <input name="title" minLength="4" required />
        </label>
        <label>
          Category
          <select name="category" required defaultValue="">
            <option value="" disabled>
              Select category
            </option>
            {meta.categories.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select name="priority" required defaultValue="">
            <option value="" disabled>
              Select priority
            </option>
            {meta.priorities.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
        <label className="full">
          Location
          <input name="location" />
        </label>
        <label className="full">
          Description
          <textarea name="description" minLength="10" required />
        </label>
        <div className="form-actions">
          <span>Complete all required fields.</span>
          <button className="primary">Submit complaint</button>
        </div>
      </form>
    </section>
  );
}
export default function DashboardPage({
  user,
  complaints,
  stats,
  meta,
  refresh,
  onLogout,
}) {
  const admin = user.role === "admin";
  const [tab, setTab] = useState("dashboard");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  const update = async (id, status) => {
    try {
      await api(`/api/complaints/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      await refresh();
      setNotice("Complaint status updated.");
    } catch (e) {
      setNotice(e.message);
    }
  };
  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.complaintCode}?`)) return;
    try {
      await api(`/api/complaints/${item._id}`, { method: "DELETE" });
      await refresh();
      setNotice("Complaint deleted.");
    } catch (e) {
      setNotice(e.message);
    }
  };
  const create = async (e) => {
    e.preventDefault();
    try {
      const item = await api("/api/complaints", {
        method: "POST",
        body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget))),
      });
      setNotice(`Complaint ${item.complaintCode} submitted successfully.`);
      setTab("complaints");
      await refresh();
    } catch (err) {
      setNotice(err.message);
    }
  };
  const nav = [
    { id: "dashboard", label: "Overview" },
    ...(!admin ? [{ id: "new", label: "Submit complaint" }] : []),
    { id: "complaints", label: admin ? "Manage complaints" : "My complaints" },
  ];
  return (
    <>
      <div className="app-shell">
        <aside className="sidebar">
          <Brand />
          <nav>
            {nav.map((x) => (
              <button
                key={x.id}
                className={tab === x.id ? "active" : ""}
                onClick={() => setTab(x.id)}
              >
                {x.label}
              </button>
            ))}
          </nav>
          <div className="sidebar-footer">
            <span className="avatar">{user.fullName[0]}</span>
            <div>
              <strong>{user.fullName}</strong>
              <small>{admin ? "Administrator" : "Student"}</small>
            </div>
            <button className="sign-out" onClick={onLogout}>
              Sign out
            </button>
          </div>
        </aside>
        <main className="workspace">
          <header className="topbar">
            <div>
              <p className="eyebrow">
                {admin ? "ADMINISTRATION" : "STUDENT PORTAL"}
              </p>
              <h1>
                {tab === "dashboard"
                  ? `Welcome, ${user.fullName.split(" ")[0]}`
                  : tab === "new"
                    ? "Submit a complaint"
                    : admin
                      ? "Complaint management"
                      : "My complaints"}
              </h1>
            </div>
          </header>
          <div className="page-view" key={tab}>
            {notice && (
              <button className="alert notice" onClick={() => setNotice("")}>
                {notice} ×
              </button>
            )}
            {tab === "dashboard" && (
              <>
              <section className="hero">
                <div>
                  <p className="eyebrow">
                    {admin ? "CAMPUS OPERATIONS" : "YOUR COMPLAINT SUMMARY"}
                  </p>
                  <h2>
                    {admin
                      ? "Keep every campus issue moving forward."
                      : "Your voice helps improve campus life."}
                  </h2>
                  {!admin && (
                    <button className="primary" onClick={() => setTab("new")}>
                      Submit a complaint
                    </button>
                  )}
                </div>
                <div className="hero-number">
                  <strong>{stats.total || 0}</strong>
                  <span>complaints</span>
                </div>
              </section>
              <section className="stats">
                {[
                  ["Total", stats.total, "violet"],
                  ["Pending", stats.pending, "amber"],
                  ["In progress", stats.inProgress, "blue"],
                  ["Resolved", stats.resolved, "green"],
                ].map(([l, v, c]) => (
                  <article className={`stat-card ${c}`} key={l}>
                    <div className="stat-icon">{l[0]}</div>
                    <div>
                      <span>{l}</span>
                      <strong>{v || 0}</strong>
                    </div>
                  </article>
                ))}
              </section>
              </>
            )}
            {tab === "new" && <Form meta={meta} submit={create} />}
            {tab === "complaints" && (
              <Table
                rows={complaints}
                admin={admin}
                meta={meta}
                update={update}
                remove={remove}
                open={setSelected}
              />
            )}
          </div>
        </main>
      </div>
      {admin && <Details item={selected} close={() => setSelected(null)} />}
    </>
  );
}
