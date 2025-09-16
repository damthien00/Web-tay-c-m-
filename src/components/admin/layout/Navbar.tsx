"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {ProfileButton} from "@/components/admin/layout/ProfileButton";

const navItems = [
  { href: "/admin/posts", label: "Post Management" },
  { href: "/admin/post-categories", label: "Post Category Management" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/users", label: "User" },
];

export default function Navbar() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-50 border-b bg-card/60 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <Link href="/" className="font-semibold">
            Fullsnack Admin
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
                    active ? "bg-primary text-primary-foreground" : "text-foreground/80"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
	          <ProfileButton/>
          </nav>
        </div>
      </div>
    </header>
  );
}
