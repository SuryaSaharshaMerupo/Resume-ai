// frontend/app/(auth)/login/page.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api/auth";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      const data = await authApi.login(form);
      sessionStorage.setItem("otp_email", form.email);
      sessionStorage.setItem("otp_purpose", "login");
      if (data.dev_otp) {
        sessionStorage.setItem("dev_otp", data.dev_otp);
      } else {
        sessionStorage.removeItem("dev_otp");
      }
      router.push("/verify-otp");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=Archivo:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #1a1a18; color: #f2ede6; font-family: 'Archivo', sans-serif; font-weight: 300; }
        .auth-wrap { min-height: 100svh; display: flex; align-items: center; justify-content: center; padding: 40px 24px; }
        .auth-card { width: 100%; max-width: 440px; background: #0f0f0e; border: 1px solid rgba(242,237,230,0.08); border-radius: 4px; padding: 48px; }
        .auth-logo { font-family: 'Cormorant Garamond', serif; font-size: 18px; letter-spacing: 0.14em; text-transform: uppercase; color: #c8a96e; margin-bottom: 32px; }
        .auth-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; margin-bottom: 8px; }
        .auth-sub { font-size: 12px; color: #6b6b64; letter-spacing: 0.06em; margin-bottom: 32px; }
        .auth-error { background: rgba(220,60,60,0.1); border: 1px solid rgba(220,60,60,0.3); color: #e88; padding: 12px 16px; border-radius: 2px; font-size: 12px; margin-bottom: 24px; }
        .field-group { margin-bottom: 20px; }
        .field-group label { display: block; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #6b6b64; margin-bottom: 8px; }
        .field-group input { width: 100%; background: #1a1a18; border: 1px solid rgba(242,237,230,0.1); border-radius: 2px; padding: 12px 16px; color: #f2ede6; font-family: 'Archivo', sans-serif; font-size: 13px; outline: none; transition: border-color 0.2s; }
        .field-group input:focus { border-color: #c8a96e; }
        .auth-btn { width: 100%; margin-top: 8px; padding: 14px; background: #c8a96e; color: #1a1a18; border: none; border-radius: 2px; font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
        .auth-btn:hover { background: #d4b87a; }
        .auth-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .auth-link { margin-top: 24px; font-size: 12px; color: #6b6b64; text-align: center; }
        .auth-link a { color: #c8a96e; text-decoration: none; }
      `}</style>
      <div className="auth-wrap">
        <div className="auth-card">
          <p className="auth-logo">ResumeAI</p>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Sign in to continue building your career</p>

          {error && <div className="auth-error">{error}</div>}

          <div className="field-group">
            <label>Email</label>
            <input type="email" placeholder="jane@example.com" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field-group">
            <label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          <button className="auth-btn" onClick={handle} disabled={loading}>
            {loading ? "Signing in..." : "Sign In →"}
          </button>

          <p className="auth-link">
            Don&apos;t have an account? <Link href="/signup">Create one</Link>
          </p>
        </div>
      </div>
    </>
  );
}
