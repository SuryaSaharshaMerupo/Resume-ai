// frontend/app/dashboard/layout.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { tokenManager } from "@/services/auth/tokenManager";
import Link from "next/link";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!tokenManager.isLoggedIn()) { router.push("/login"); return; }
    setUser(tokenManager.getUser());
  }, [router]);

  const logout = () => {
    tokenManager.removeToken();
    document.cookie = "resumeai_token=; path=/; max-age=0";
    router.push("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: "◈" },
    { href: "/dashboard/resume", label: "Resume Tool", icon: "◎" },
    { href: "/dashboard/profile", label: "Profile", icon: "◉" },
    { href: "/dashboard/insights", label: "ATS Insights", icon: "◇" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Archivo:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1a18; color: #f2ede6; font-family: 'Archivo', sans-serif; font-weight: 300; }
        .dash-shell { display: flex; min-height: 100svh; }
        .sidebar { width: 240px; background: #0f0f0e; border-right: 1px solid rgba(242,237,230,0.06); display: flex; flex-direction: column; padding: 32px 0; flex-shrink: 0; position: fixed; top: 0; bottom: 0; }
        .sb-logo { font-family: 'Cormorant Garamond', serif; font-size: 18px; letter-spacing: 0.14em; text-transform: uppercase; color: #c8a96e; padding: 0 28px 40px; border-bottom: 1px solid rgba(242,237,230,0.06); margin-bottom: 24px; }
        .sb-nav { flex: 1; padding: 0 16px; display: flex; flex-direction: column; gap: 4px; }
        .sb-link { display: flex; align-items: center; gap: 12px; padding: 11px 12px; border-radius: 2px; font-size: 12px; letter-spacing: 0.1em; color: #6b6b64; text-decoration: none; transition: all 0.2s; }
        .sb-link:hover { color: #f2ede6; background: rgba(242,237,230,0.04); }
        .sb-link.active { color: #c8a96e; background: rgba(200,169,110,0.08); }
        .sb-icon { font-size: 14px; width: 20px; text-align: center; }
        .sb-bottom { padding: 24px 28px 0; border-top: 1px solid rgba(242,237,230,0.06); }
        .sb-user { font-size: 11px; color: #6b6b64; margin-bottom: 12px; letter-spacing: 0.06em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .sb-logout { background: none; border: 1px solid rgba(242,237,230,0.1); color: #6b6b64; padding: 8px 16px; font-family: 'Archivo', sans-serif; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: all 0.2s; width: 100%; }
        .sb-logout:hover { border-color: #c8a96e; color: #c8a96e; }
        .dash-main { margin-left: 240px; flex: 1; padding: 48px; min-height: 100svh; }
        @media (max-width: 768px) {
          .sidebar { display: none; }
          .dash-main { margin-left: 0; padding: 24px; }
        }
      `}</style>
      <div className="dash-shell">
        <aside className="sidebar">
          <div className="sb-logo">ResumeFit AI</div>
          <nav className="sb-nav">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`sb-link${pathname === item.href ? " active" : ""}`}
              >
                <span className="sb-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="sb-bottom">
            <p className="sb-user">{user?.full_name || "Loading..."}</p>
            <button className="sb-logout" onClick={logout}>Sign Out</button>
          </div>
        </aside>
        <main className="dash-main">{children}</main>
      </div>
    </>
  );
}
