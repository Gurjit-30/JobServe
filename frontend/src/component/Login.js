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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
            {isRegister ? "Create an account" : "Welcome back"}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-500">
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
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
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
                className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transform transition-all hover:-translate-y-0.5"
            >
              {isRegister ? "Register" : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center mt-4 border-t border-gray-100 pt-6">
          <p
            onClick={() => setIsRegister(!isRegister)}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer transition-colors duration-200"
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