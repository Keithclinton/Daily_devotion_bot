import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "../api/client";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate("/devotions", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-lg bg-white p-6 shadow">
        <h1 className="mb-4 text-lg font-semibold text-slate-800">Owner Dashboard Login</h1>
        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
        <label className="mb-3 block">
          <span className="mb-1 block text-sm text-slate-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm text-slate-600">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Logging in..." : "Log in"}
        </button>
      </form>
    </div>
  );
}
