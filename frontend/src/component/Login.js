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
    <div>
      <h2>{isRegister ? "Register" : "Login"}</h2>

      <form onSubmit={handleSubmit}>
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

        <button type="submit">
          {isRegister ? "Register" : "Login"}
        </button>
      </form>

      <p onClick={() => setIsRegister(!isRegister)} style={{ cursor: "pointer" }}>
        {isRegister
          ? "Already have account? Login"
          : "New user? Register"}
      </p>
    </div>
  );
}

export default Login;