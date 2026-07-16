import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { ProtectedRoute } from "./auth/ProtectedRoute";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { DevotionsPage } from "./pages/DevotionsPage";
import { SubscribersPage } from "./pages/SubscribersPage";
import { ReportsPage } from "./pages/ReportsPage";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/devotions" replace />} />
            <Route path="/devotions" element={<DevotionsPage />} />
            <Route path="/subscribers" element={<SubscribersPage />} />
            <Route path="/reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}
