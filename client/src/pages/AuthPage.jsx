import { useState } from "react";
import { api } from "../main";

// Brand component for displaying the CampusCare logo and name
function Brand() {
  return (
    <div className="brand">
      {/* CampusCare logo mark */}
      <span className="brand-mark">CC</span>

      {/* CampusCare name */}
      <span>
        Campus<span>Care</span>
      </span>
    </div>
  );
}

// Authentication page for student login, student registration, and admin login
export default function AuthPage({ mode, onLogin, onBack }) {
  // Check whether the current page is student registration
  // or admin login
  const register = mode === "student-register",
    admin = mode === "admin-login";

  // Store the user's full name
  const [fullName, setFullName] = useState("");

  // Store the username
  const [username, setUsername] = useState("");

  // Store the password
  const [password, setPassword] = useState("");

  // Store authentication error messages
  const [error, setError] = useState("");

  // Track whether the form is being submitted
  const [busy, setBusy] = useState(false);

  // Handle login or registration form submission
  const submit = async (e) => {
    // Prevent page refresh
    e.preventDefault();

    // Disable the form while processing
    setBusy(true);

    // Clear previous error message
    setError("");

    try {
      // Create request data based on login or registration
      const body = register
        ? { fullName, username, password }
        : { username, password, portalRole: admin ? "admin" : "student" };

      // Send login or registration request to the backend
      const data = await api(
        register ? "/api/auth/register" : "/api/auth/login",
        { method: "POST", body: JSON.stringify(body) },
      );

      // Save authentication token in browser storage
      localStorage.setItem("campuscare_token", data.token);

      // Send logged-in user information to the parent component
      onLogin(data.user);
    } catch (err) {
      // Display error message if authentication fails
      setError(err.message);
    } finally {
      // Enable the form again after the request finishes
      setBusy(false);
    }
  };

  return (
    <main className="auth-page">
      {/* Introduction section of the authentication page */}
      <section className="auth-intro">
        <Brand />

        <div>
          {/* Show different heading based on the selected portal */}
          <p className="eyebrow">
            {admin ? "PCCOE ADMINISTRATION" : "STUDENT SERVICES"}
          </p>

          {/* Main authentication page heading */}
          <h1>
            {register
              ? "Your campus voice starts here."
              : "Every concern deserves a clear path to resolution."}
          </h1>
        </div>
      </section>

      {/* Authentication form section */}
      <section className="auth-panel">
        <form className="login-card" onSubmit={submit}>
          {/* Button to return to the landing page */}
          <button className="back-button" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Back to home
          </button>

          {/* CampusCare branding */}
          <Brand />

          <div>
            {/* Show section label for registration or admin login */}
            {(register || admin) && (
              <p className="eyebrow">
                {register ? "STUDENT REGISTRATION" : "ADMIN ACCESS"}
              </p>
            )}

            {/* Display appropriate form title */}
            <h2>
              {register
                ? "Create student account"
                : admin
                  ? "Administrator login"
                  : "Student login"}
            </h2>
          </div>

          {/* Display authentication error when available */}
          {error && <div className="alert error">{error}</div>}

          {/* Full name field is shown only during registration */}
          {register && (
            <label>
              Full name
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                minLength="2"
                required
              />
            </label>
          )}

          {/* Username input field */}
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength="3"
              required
            />
          </label>

          {/* Password input field */}
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="8"
              required
            />
          </label>

          {/* Submit button for login or registration */}
          <button className="primary wide" disabled={busy}>
            {busy ? "Please wait..." : register ? "Create account" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}