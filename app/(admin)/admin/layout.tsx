import { headers } from "next/headers";
import AdminSidebar from "./navigation/page";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const isLoginPage = headersList.get("x-admin-login-page") === "1";

  if (isLoginPage) {
    return children;
  }

  return (
    <main className="admin-shell">
      <AdminSidebar />
      <section className="admin-content">
        <div className="admin-page-body">
          {children}
        </div>
      </section>
    </main>
  );
}
