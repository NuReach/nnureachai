import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn } from "../hooks/useAuth";

const Login = () => {
  const navigate = useNavigate();
  const signIn = useSignIn();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      await signIn.mutateAsync({
        email: formData.email,
        password: formData.password,
      });

      // Navigate to projects page on successful login
      navigate("/projects");
    } catch (err) {
      setError(err.message || "Invalid email or password");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "#cce49e" }}
    >
      <div
        className="w-full max-w-md p-8 rounded-lg shadow-lg"
        style={{ backgroundColor: "#ffffff" }}
      >
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light mb-2" style={{ color: "#297fb2" }}>
            Nureach AI
          </h1>
          <p className="font-light" style={{ color: "#6b7280" }}>
            Sign in to your account
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 rounded font-light text-sm"
            style={{ backgroundColor: "#fee2e2", color: "#dc2626" }}
          >
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              className="block font-light mb-2"
              style={{ color: "#297fb2" }}
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2"
              style={{ borderColor: "#e5e7eb" }}
              onFocus={(e) => (e.target.style.borderColor = "#297fb2")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              disabled={signIn.isPending}
            />
          </div>

          <div className="mb-6">
            <label
              className="block font-light mb-2"
              style={{ color: "#297fb2" }}
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full p-3 border rounded font-light focus:outline-none focus:ring-2"
              style={{ borderColor: "#e5e7eb" }}
              onFocus={(e) => (e.target.style.borderColor = "#297fb2")}
              onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
              disabled={signIn.isPending}
            />
          </div>

          <button
            type="submit"
            disabled={signIn.isPending}
            className="w-full py-3 rounded font-light transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: "#297fb2", color: "#ffffff" }}
            onMouseEnter={(e) =>
              !signIn.isPending && (e.target.style.opacity = "0.9")
            }
            onMouseLeave={(e) =>
              !signIn.isPending && (e.target.style.opacity = "1")
            }
          >
            {signIn.isPending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Additional Links */}
        <div className="mt-6 text-center">
          <button
            className="font-light text-sm hover:underline"
            style={{ color: "#297fb2" }}
            onClick={() => navigate("/")}
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
