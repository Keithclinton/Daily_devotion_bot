import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const navItems = [
  { to: "/devotions", label: "Devotions" },
  { to: "/subscribers", label: "Subscribers" },
  { to: "/reports", label: "Reports" },
];

export function Layout() {
  const { adminEmail, logout } = useAuth();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <div className="font-semibold text-slate-800">Daily Devotion</div>
          <nav className="flex gap-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm font-medium ${isActive ? "text-blue-600" : "text-slate-500 hover:text-slate-800"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>{adminEmail}</span>
            <button
              onClick={logout}
              className="rounded bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200"
            >
              Log out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
