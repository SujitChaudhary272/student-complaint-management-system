import { useState } from "react";
import { api } from "../main";
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
export default function AuthPage({ mode, onLogin, onBack }) {
  const register = mode === "student-register",
    admin = mode === "admin-login";
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const body = register
        ? { fullName, username, password }
        : { username, password, portalRole: admin ? "admin" : "student" };
      const data = await api(
        register ? "/api/auth/register" : "/api/auth/login",
        { method: "POST", body: JSON.stringify(body) },
      );
      localStorage.setItem("campuscare_token", data.token);
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="auth-page">
      <section className="auth-intro">
        <Brand />
        <div>
          <p className="eyebrow">
            {admin ? "PCCOE ADMINISTRATION" : "STUDENT SERVICES"}
          </p>
          <h1>
            {register
              ? "Your campus voice starts here."
              : "Every concern deserves a clear path to resolution."}
          </h1>
        </div>
      </section>
      <section className="auth-panel">
        <form className="login-card" onSubmit={submit}>
          <button className="back-button" type="button" onClick={onBack}>
            <span aria-hidden="true">←</span> Back to home
          </button>
          <Brand />
          <div>
            {(register || admin) && (
              <p className="eyebrow">
                {register ? "STUDENT REGISTRATION" : "ADMIN ACCESS"}
              </p>
            )}
            <h2>
              {register
                ? "Create student account"
                : admin
                  ? "Administrator login"
                  : "Student login"}
            </h2>
          </div>
          {error && <div className="alert error">{error}</div>}
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
          <label>
            Username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength="3"
              required
            />
          </label>
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
          <button className="primary wide" disabled={busy}>
            {busy ? "Please wait..." : register ? "Create account" : "Sign in"}
          </button>
          {admin && (
            <div className="demo-note">
              <strong>Admin access</strong>
              <span>pccoe / 123456789</span>
            </div>
          )}
        </form>
      </section>
    </main>
  );
}
