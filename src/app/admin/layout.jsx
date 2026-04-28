/**
 * admin/layout.jsx — Admin Section Layout
 * Ensures only admins can access this subtree and provides a common header structure.
 */
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }) {
  const user = await currentUser();
  const role = user?.publicMetadata?.role;

  if (role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50/30">
      {children}
    </div>
  );
}
