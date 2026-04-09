import React, { useState } from "react";
import axios from "axios";

function Login({ setToken }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("https://jobserve-hghp.onrender.com/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Error logging in. Please check your credentials.");
      }
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}
      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;