import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import "@/styles/globals.css";

export const metadata = {
  title: "Admin - Marie Meister",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Allow access to login page without auth
  // The login page is handled separately

  return (
    <html lang="en">
      <body className="bg-bg-admin text-body antialiased">
        {session?.user ? (
          <div className="flex min-h-screen">
            <AdminSidebar />
            <main className="flex-1 ml-0 lg:ml-[250px] pt-18 lg:pt-0 p-4 lg:p-8">{children}</main>
          </div>
        ) : (
          <main className="min-h-screen">{children}</main>
        )}
      </body>
    </html>
  );
}
