import { headers } from "next/headers";
import AdminSidebar from "./navigation/page"; // Update path if placed elsewhere

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const isLoginPage = headers().get("x-admin-login-page") === "1";

  if (isLoginPage) {
    return children;
  }

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">{children}</section>
    </main>
  );
}