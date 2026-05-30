import React, { useState, useEffect } from "react";
import api from "../api";
import AnimatedBackground from "./AnimatedBackground";
import { toast } from "react-hot-toast";
import { useGoogleLogin } from '@react-oauth/google';

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
  const [loading, setLoading] = useState(false);

  // Handle OAuth redirect — backend sends ?token=JWT back to CLIENT_URL
  // Removing server-side redirect OAuth logic since we use client-side OAuth now.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("auth_error");

    if (authError) {
      const errorDetails = params.get("error_details") || "Unknown error";
      toast.error(`OAuth sign-in failed: ${errorDetails}`);
      window.history.replaceState({}, document.title, "/");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = isRegister ? `/auth/register` : `/auth/login`;
      const res = await api.post(url, { email, password });

      if (!isRegister) {
        localStorage.setItem("token", res.data.token);
        setToken(res.data.token);
        toast.success("Welcome back!");
      } else {
        toast.success("Registered! Now sign in.");
        setIsRegister(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.error || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      try {
        const res = await api.post('/auth/google', { token: tokenResponse.credential || tokenResponse.access_token || tokenResponse.id_token });
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
          setToken(res.data.token);
          toast.success("Signed in with Google!");
        }
      } catch (err) {
        toast.error("Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast.error("Google login failed");
    },
    flow: 'implicit'
  });


  return (
    <div className="min-h-screen flex text-gray-100 bg-[#0d1117] overflow-hidden">
      <AnimatedBackground />
      {/* Left Pane: Branding & Hero */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] flex-col justify-between p-12 relative z-10 border-r border-[#00e5a0]/20 bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-[#00e5a0]/10">
        <div>
          <div className="flex items-center gap-2 mb-16">
            <div className="flex items-center justify-center h-8 w-8 rounded bg-[#00e5a0] text-[#0d1117]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Prepserve</h1>
          </div>
          
          <h2 className="text-4xl xl:text-5xl font-extrabold text-white tracking-tight leading-tight mb-6">
            Track your applications.<br />
            <span className="text-[#00e5a0]">Master your interviews.</span>
          </h2>
          
          <p className="text-[#8b949e] text-lg font-medium max-w-md mb-12">
            Join developers who stay consistent, avoid burnout, and land their dream roles faster with Prepserve.
          </p>
          
          <div className="flex gap-12">
            <div>
              <div className="text-2xl font-bold text-white mb-1">50+</div>
              <div className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider">Jobs Tracked</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-white mb-1">10+</div>
              <div className="text-xs text-[#8b949e] font-semibold uppercase tracking-wider">Interviews Ace'd</div>
            </div>
          </div>
        </div>
        
        {/* Testimonial Block */}
        <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#21262d] rounded-2xl p-6 relative overflow-hidden mt-12">
          <svg className="w-8 h-8 text-[#00e5a0]/20 absolute top-4 left-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-sm text-gray-300 relative z-10 pl-8 leading-relaxed mb-4">
            "As a self-taught developer, Prepserve gave me the structure I was missing. The AI interview prep helped me understand my weak points and ace my FAANG loops."
          </p>
          <div className="flex items-center gap-3 pl-8 relative z-10">
            <div className="w-8 h-8 rounded-full bg-[#00e5a0] flex items-center justify-center text-xs font-bold text-[#0d1117]">
              KS
            </div>
            <div>
              <div className="text-sm font-bold text-white leading-tight">Kartavya Shrivastava</div>
              <div className="text-xs text-[#8b949e]">Frontend Engineer</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 relative z-10 bg-[#0d1117]">
        <div className="max-w-md w-full space-y-8 animate-fade-in">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
              {isRegister ? "Create an account" : "Welcome back"}
            </h2>
            <p className="text-[#8b949e]">
              {isRegister ? "Sign up to start tracking your applications" : "Sign in to continue your learning journey"}
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input
                id="email-address"
                type="email"
                required
                className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-[#8b949e] focus:outline-none focus:border-[#00e5a0] focus:ring-1 focus:ring-[#00e5a0] transition-all"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  className="w-full bg-[#161b22] border border-[#21262d] rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-[#8b949e] focus:outline-none focus:border-[#00e5a0] focus:ring-1 focus:ring-[#00e5a0] transition-all"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {!isRegister && (
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#21262d] bg-[#161b22] text-[#00e5a0] focus:ring-[#00e5a0] focus:ring-offset-[#0d1117]"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-[#8b949e]">
                  Keep me signed in for 5 days
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] focus-visible:ring-[#00e5a0] ${
                loading
                  ? "bg-[#21262d] text-[#8b949e] cursor-not-allowed"
                  : "bg-[#00e5a0] hover:bg-[#00c58a] text-[#0d1117] shadow-[0_0_15px_rgba(0,229,160,0.3)] hover:shadow-[0_0_20px_rgba(0,229,160,0.4)]"
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
                isRegister ? "Sign up \u2192" : "Sign in \u2192"
              )}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#21262d]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0d1117] text-[#8b949e]">Or</span>
            </div>
          </div>

          <button
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-[#161b22] hover:bg-[#21262d] text-white font-semibold rounded-xl border border-[#21262d] hover:border-[#00e5a0]/50 transition-all duration-300 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#00e5a0]"
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div className="text-center mt-6">
            <p className="text-sm text-[#8b949e]">
              {isRegister ? "Already have an account? " : "Don't have an account? "}
              <button
                onClick={() => setIsRegister(!isRegister)}
                className="font-bold text-white hover:text-[#00e5a0] transition-colors"
              >
                {isRegister ? "Sign in" : "Create one free"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;