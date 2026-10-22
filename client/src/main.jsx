import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import DashboardPage from "./pages/DashboardPage";

import "./style.css";

/*
 * API helper function
 * -------------------
 * This function is used to communicate with the backend API.
 * It automatically adds the authentication token if the user is logged in.
 */
export const api = async (url, options = {}) => {
  // Get the login token stored in the browser
  const token = localStorage.getItem("campuscare_token");

  // Send request to the backend server
  const response = await fetch(url, {
    ...options,

    // Set request headers
    headers: {
      "Content-Type": "application/json",

      // Add authorization token if available
      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      // Allow additional headers passed to the function
      ...options.headers,
    },
  });

  // Convert the server response into JSON
  const data = await response.json().catch(() => ({}));

  // If the request fails, show the error message
  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  // Return the server data
  return data;
};


/*
 * Main App Component
 * ------------------
 * Controls the overall application flow:
 * - Landing page
 * - Login/Register page
 * - Dashboard page
 */
function App() {
  // Store currently logged-in user
  const [user, setUser] = useState(null);

  // Store all complaints
  const [complaints, setComplaints] = useState([]);

  // Store complaint statistics
  const [stats, setStats] = useState({});

  // Store categories, priorities and statuses
  const [meta, setMeta] = useState({
    categories: [],
    priorities: [],
    statuses: [],
  });

  // Current page/view of the application
  const [view, setView] = useState("landing");

  // Track loading state
  const [loading, setLoading] = useState(true);


  /*
   * Load complaint data from the backend
   * ------------------------------------
   * Gets:
   * 1. Complaint list
   * 2. Complaint statistics
   * 3. Complaint categories/priorities/statuses
   */
  const load = async () => {
    const [items, totals, options] = await Promise.all([
      api("/api/complaints"),
      api("/api/complaints/stats"),
      api("/api/complaints/meta"),
    ]);

    // Store the received data
    setComplaints(items);
    setStats(totals);
    setMeta(options);
  };


  /*
   * Check whether the user is already logged in
   * -------------------------------------------
   * When the application starts, it checks for
   * an existing authentication token.
   */
  useEffect(() => {
    // If no token exists, show the landing page
    if (!localStorage.getItem("campuscare_token")) {
      setLoading(false);
      return;
    }

    // Verify the existing token with the backend
    api("/api/auth/me")
      .then(({ user: account }) => {
        // Store the logged-in user
        setUser(account);
      })
      .catch(() => {
        // Remove invalid/expired token
        localStorage.removeItem("campuscare_token");
      })
      .finally(() => {
        // Finish initial loading
        setLoading(false);
      });
  }, []);


  /*
   * Load dashboard data whenever a user logs in
   */
  useEffect(() => {
    if (user) {
      load()
        .catch(() => {})
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);


  /*
   * Show loading screen while checking authentication
   */
  if (loading && !user) {
    return (
      <main className="loading-screen">
        Loading CampusCare...
      </main>
    );
  }


  /*
   * If the user is not logged in:
   * - Show LandingPage when view is "landing"
   * - Otherwise show Login/Register page
   */
  if (!user) {
    return view === "landing" ? (
      <LandingPage onChoose={setView} />
    ) : (
      <AuthPage
        mode={view}
        onBack={() => setView("landing")}
        onLogin={setUser}
      />
    );
  }


  /*
   * If the user is logged in,
   * show the main Dashboard page.
   */
  return (
    <DashboardPage
      user={user}
      complaints={complaints}
      stats={stats}
      meta={meta}
      refresh={load}

      /*
       * Logout function
       * ---------------
       * Removes the login token and clears
       * all user-related data.
       */
      onLogout={() => {
        // Remove authentication token
        localStorage.removeItem("campuscare_token");

        // Clear user information
        setUser(null);

        // Clear complaint data
        setComplaints([]);

        // Clear statistics
        setStats({});

        // Return to landing page
        setView("landing");
      }}
    />
  );
}


/*
 * Start the React application
 * ---------------------------
 * Finds the "root" element in index.html
 * and renders the App component inside it.
 */
createRoot(document.getElementById("root")).render(<App />);