import React, { useState, useEffect } from "react";
import axios from "axios";
import AnimatedBackground from "./AnimatedBackground";

const API = process.env.REACT_APP_API_URL;

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);


// ── Main Component ────────────────────────────────────────────────────────────
function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle OAuth redirect — backend sends ?token=JWT back to CLIENT_URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get("token");
    const authError = params.get("auth_error");

    if (oauthToken) {
      localStorage.setItem("token", oauthToken);
      setToken(oauthToken);
      // Clean up URL
      window.history.replaceState({}, document.title, "/");
    }
    if (authError) {
      setError("OAuth sign-in failed. Please try again.");
      window.history.replaceState({}, document.title, "/");
    }
  }, [setToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const url = isRegister
        ? `${API}/auth/register`
        : `${API}/auth/login`;

      const res = await axios.post(url, { email, password });

      if (!isRegister) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
      } else {
        setError("");
        alert("Registered! Now sign in.");
        setIsRegister(false);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${API}/auth/google`;
  };


  return (
    <div className="app-bg flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <AnimatedBackground />
      {/* Background orbs come from CSS .app-bg ::before/::after */}

      <div className="max-w-md w-full space-y-6 glass-card gradient-border p-10 animate-fade-in-scale relative z-10">
        {/* Logo + Title */}
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-500/10 mb-4 border border-emerald-500/20">
            <svg className="h-7 w-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-100 tracking-tight">
            {isRegister ? "Create account" : "Welcome back"}
          </h2>
          <p className="mt-1 text-sm font-semibold bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
            JobServe — Your Career Command Center
          </p>
        </div>

        {/* OAuth Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-xl border border-gray-200 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-md text-sm"
          >
            <GoogleIcon />
            Continue with Google
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-gray-500 font-medium uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Email / Password Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email-address" className="sr-only">Email address</label>
            <input
              id="email-address"
              type="email"
              required
              className="input-dark appearance-none block w-full px-4 py-3 text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              type="password"
              required
              className="input-dark appearance-none block w-full px-4 py-3 text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 flex items-center gap-2">
              <span>⚠</span> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 ${
              loading
                ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                : "btn-glow text-[#060811]"
            }`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                {isRegister ? "Creating account..." : "Signing in..."}
              </span>
            ) : (
              isRegister ? "Create Account" : "Sign In"
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center border-t border-white/5 pt-5">
          <p
            onClick={() => { setIsRegister(!isRegister); setError(""); }}
            className="text-sm font-medium text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors duration-200"
          >
            {isRegister
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;