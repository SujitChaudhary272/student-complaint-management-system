// Brand component for displaying the CampusCare logo and name
function Brand() {
  return (
    <div className="brand">
      {/* CC logo mark */}
      <span className="brand-mark">CC</span>

      {/* Application name */}
      <span>
        Campus<span>Care</span>
      </span>
    </div>
  );
}


// Landing page component
// onChoose is used to navigate to login or registration pages
export default function LandingPage({ onChoose }) {
  return (
    <main className="landing-page">

      {/* Header section containing the brand and system title */}
      <header className="landing-header">
        <Brand />

        {/* Name of the system */}
        <span>Student Complaint Management System</span>
      </header>


      {/* Main hero section of the landing page */}
      <section className="landing-hero">

        {/* Left section containing college and system information */}
        <div>

          {/* PCCOE college logo and name */}
          <div
            className="college-logo"
            aria-label="PCCOE, Pimpri Chinchwad College of Engineering"
          >
            {/* College logo mark */}
            <span className="college-logo-mark">P</span>

            {/* College name */}
            <span>
              <strong>PCCOE</strong>
              <small>Pimpri Chinchwad College of Engineering</small>
            </span>
          </div>


          {/* Small heading above the main heading */}
          <p className="eyebrow">PCCOE STUDENT SERVICES</p>

          {/* Main heading of the landing page */}
          <h1>A better campus begins with a voice that is heard.</h1>

          {/* Short description of the system */}
          <p>Report, track, and resolve concerns with clarity.</p>


          {/* Main features/highlights of CampusCare */}
          <div className="landing-highlights">
            <span>Easy reporting</span>
            <span>Live status tracking</span>
            <span>Faster resolutions</span>
          </div>
        </div>


        {/* Right section containing login and registration options */}
        <div className="portal-grid">

          {/* Student Login button */}
          <button
            className="portal-card student-portal"
            onClick={() => onChoose("student-login")}
          >
            {/* Icon for student login */}
            <span className="portal-icon">S</span>

            {/* Button title */}
            <strong>Student login</strong>

            {/* Button description */}
            <small>Access your complaint dashboard</small>
          </button>


          {/* Student Registration button */}
          <button
            className="portal-card register-portal"
            onClick={() => onChoose("student-register")}
          >
            {/* Plus icon for registration */}
            <span className="portal-icon">+</span>

            {/* Button title */}
            <strong>Student register</strong>

            {/* Button description */}
            <small>Create a new student account</small>
          </button>


          {/* Admin Login button */}
          <button
            className="portal-card admin-portal"
            onClick={() => onChoose("admin-login")}
          >
            {/* Icon for admin login */}
            <span className="portal-icon">A</span>

            {/* Button title */}
            <strong>Admin login</strong>

            {/* Button description */}
            <small>Manage campus complaints</small>
          </button>
        </div>
      </section>


      {/* Footer section */}
      <footer className="landing-footer">
        Developed by PCCOE team
      </footer>

    </main>
  );
}