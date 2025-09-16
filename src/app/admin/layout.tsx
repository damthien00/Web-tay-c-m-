import type { Metadata } from "next";
import "./backend.css";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin Dashboard",
};

import Navbar from "@/components/admin/layout/Navbar";
import PermissionGate from "@/components/admin/auth/PermissionGate";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
		<div>
			<Navbar />
			<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
				<PermissionGate
					anyOf={"ADMIN"}
					fallback={<div>You do not have permission to access this page.</div>}
				>
					{children}
				</PermissionGate>
			</main>
		</div>
  );
}
