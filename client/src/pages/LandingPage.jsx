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
export default function LandingPage({ onChoose }) {
  return (
    <main className="landing-page">
      <header className="landing-header">
        <Brand />
        <span>Student Complaint Management System</span>
      </header>
      <section className="landing-hero">
        <div>
          <div className="college-logo" aria-label="PCCOE, Pimpri Chinchwad College of Engineering">
            <span className="college-logo-mark">P</span>
            <span>
              <strong>PCCOE</strong>
              <small>Pimpri Chinchwad College of Engineering</small>
            </span>
          </div>
          <p className="eyebrow">PCCOE STUDENT SERVICES</p>
          <h1>A better campus begins with a voice that is heard.</h1>
          <p>Report, track, and resolve concerns with clarity.</p>
          <div className="landing-highlights">
            <span>Easy reporting</span>
            <span>Live status tracking</span>
            <span>Faster resolutions</span>
          </div>
        </div>
        <div className="portal-grid">
          <button
            className="portal-card student-portal"
            onClick={() => onChoose("student-login")}
          >
            <span className="portal-icon">S</span>
            <strong>Student login</strong>
            <small>Access your complaint dashboard</small>
          </button>
          <button
            className="portal-card register-portal"
            onClick={() => onChoose("student-register")}
          >
            <span className="portal-icon">+</span>
            <strong>Student register</strong>
            <small>Create a new student account</small>
          </button>
          <button
            className="portal-card admin-portal"
            onClick={() => onChoose("admin-login")}
          >
            <span className="portal-icon">A</span>
            <strong>Admin login</strong>
            <small>Manage campus complaints</small>
          </button>
        </div>
      </section>
    </main>
  );
}
