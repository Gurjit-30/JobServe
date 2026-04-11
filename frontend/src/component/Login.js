import React, { useState } from "react";
import axios from "axios";

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isRegister
      ? "https://jobserve-hghp.onrender.com/auth/register"
      : "https://jobserve-hghp.onrender.com/auth/login";

    const res = await axios.post(url, { email, password });

    if (!isRegister) {
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } else {
      alert("Registered! Now login.");
      setIsRegister(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-gray-900 border border-gray-800 p-10 rounded-2xl shadow-2xl transition-all duration-300">
        <div>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/10 mb-4">
            <svg className="h-6 w-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-100 tracking-tight">
            {isRegister ? "Create an account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-center text-sm font-medium text-emerald-400">
            Smart Placement Tracker
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-3 bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
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
                className="appearance-none relative block w-full px-4 py-3 bg-gray-800 border border-gray-700 placeholder-gray-500 text-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-all sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-gray-900 bg-emerald-500 hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-0.5"
            >
              {isRegister ? "Register" : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 border-t border-gray-800 pt-6">
          <p
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm font-medium text-emerald-500 hover:text-emerald-400 cursor-pointer transition-colors duration-200"
          >
            {isRegister
              ? "Already have an account? Sign in here"
              : "Don't have an account? Register here"}
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;