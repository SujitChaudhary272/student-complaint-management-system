// Import React hooks: useState stores changing UI values, and useMemo caches filtered results.
import { useMemo, useState } from "react";
// Import the project API helper used to send requests to the backend.
import { api } from "../main";
// Convert a date value into a readable format such as "26 Oct 2026".
const date = (value) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
// Convert status text into a CSS-friendly class name (for example, "In progress" -> "in-progress").
const statusClass = (value) => value.toLowerCase().replace(/\s+/g, "-");
// Display the CampusCare brand name and logo mark.
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
// Show the selected complaint in a modal. If no complaint is selected, render nothing.
function Details({ item, close }) {
  if (!item) return null;
  return (
    <div className="modal-backdrop" onMouseDown={close}>
      {/* Clicking the backdrop closes the modal. */}
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
        {/* Display the main complaint information in a grid. */}
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
// Render the complaint table, filters, and role-specific actions.
function Table({ rows, admin, meta, update, remove, open }) {
  // Store the text search and selected category/status filters.
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  // Filter complaints by search text, category, and status; recompute when inputs change.
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
      {/* Search box and category filter. */}
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
      {/* Quick buttons let the user filter complaints by status. */}
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
      {/* Table shows complaint details and available actions for each row. */}
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
            {/* Create one table row for every complaint that matches the filters. */}
            {filtered.map((x) => (
              <tr key={x._id}>
                <td>
                  <span className="reference">{x.prnNo}</span>
                </td>
                <td>{x.studentName}</td>
                <td>
                  {/* Admins can open complaint details; students see the title only. */}
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
                  {/* Admins can change status; students only see the current status. */}
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
// Form used by students to submit a new campus complaint.
function Form({ meta, submit }) {
  return (
    <section className="form-shell">
      <div className="form-heading">
        <p className="eyebrow">NEW REQUEST</p>
        <h1>Tell us what needs attention.</h1>
      </div>
      {/* The parent submit handler validates and sends this form to the backend. */}
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
// Main dashboard page shared by student and administrator accounts.
export default function DashboardPage({
  user,
  complaints,
  stats,
  meta,
  refresh,
  onLogout,
}) {
  // Determine which dashboard features are available for the current user.
  const admin = user.role === "admin";
  const [tab, setTab] = useState("dashboard");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState(null);
  // Update a complaint status through the API, refresh the list, and show feedback.
  const update = async (id, status) => {
    try {
      // PATCH updates only the selected complaint status.
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
  // Ask for confirmation, delete the complaint, then refresh the displayed data.
  const remove = async (item) => {
    if (!window.confirm(`Delete ${item.complaintCode}?`)) return;
    try {
      // DELETE removes the selected complaint from the database.
      await api(`/api/complaints/${item._id}`, { method: "DELETE" });
      await refresh();
      setNotice("Complaint deleted.");
    } catch (e) {
      setNotice(e.message);
    }
  };
  // Handle form submission and send the entered complaint details to the API.
  const create = async (e) => {
    e.preventDefault();
    try {
      // POST creates a complaint using the values entered in the form.
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
  // Build navigation items; only students get the "Submit complaint" option.
  const nav = [
    { id: "dashboard", label: "Overview" },
    ...(!admin ? [{ id: "new", label: "Submit complaint" }] : []),
    { id: "complaints", label: admin ? "Manage complaints" : "My complaints" },
  ];
  return (
    <>
      {/* Overall application layout: sidebar and main workspace. */}
      <div className="app-shell">
        <aside className="sidebar">
          <Brand />
          {/* Switch between dashboard sections without reloading the page. */}
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
          {/* Show the signed-in user and the sign-out action. */}
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
          {/* Display a message or the selected page content. */}
          <div className="page-view" key={tab}>
            {notice && (
              <button className="alert notice" onClick={() => setNotice("")}>
                {notice} ×
              </button>
            )}
            {/* Dashboard overview with a summary and complaint statistics. */}
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
            {/* Show the complaint form when the student selects the new-request tab. */}
            {tab === "new" && <Form meta={meta} submit={create} />}
            {/* Show the complaint register for students or administrators. */}
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
      {/* The details modal is available to administrators when a complaint is selected. */}
      {admin && <Details item={selected} close={() => setSelected(null)} />}
    </>
  );
}
