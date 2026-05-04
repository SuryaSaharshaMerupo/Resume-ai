"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api/auth";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "job_seeker" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    try {
      const data = await authApi.signup(form);
      sessionStorage.setItem("otp_email", form.email);
      sessionStorage.setItem("otp_purpose", "signup");
      if (data.dev_otp) {
        sessionStorage.setItem("dev_otp", data.dev_otp);
      } else {
        sessionStorage.removeItem("dev_otp");
      }
      router.push("/verify-otp");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Archivo:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#1a1a18;color:#f2ede6;font-family:'Archivo',sans-serif;font-weight:300}
        .wrap{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:40px 24px}
        .card{width:100%;max-width:440px;background:#0f0f0e;border:1px solid rgba(242,237,230,0.08);border-radius:4px;padding:48px}
        .logo{font-family:'Cormorant Garamond',serif;font-size:18px;letter-spacing:0.14em;text-transform:uppercase;color:#c8a96e;margin-bottom:32px;cursor:pointer}
        .title{font-family:'Cormorant Garamond',serif;font-size:36px;font-weight:300;margin-bottom:8px}
        .sub{font-size:12px;color:#6b6b64;margin-bottom:32px}
        .err{background:rgba(220,60,60,0.1);border:1px solid rgba(220,60,60,0.3);color:#e88;padding:12px 16px;border-radius:2px;font-size:12px;margin-bottom:24px}
        .fg{margin-bottom:20px}
        .fg label{display:block;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#6b6b64;margin-bottom:8px}
        .fg input,.fg select{width:100%;background:#1a1a18;border:1px solid rgba(242,237,230,0.1);border-radius:2px;padding:12px 16px;color:#f2ede6;font-family:'Archivo',sans-serif;font-size:13px;outline:none;transition:border-color 0.2s}
        .fg input:focus,.fg select:focus{border-color:#c8a96e}
        .fg select option{background:#1a1a18}
        .btn{width:100%;margin-top:8px;padding:14px;background:#c8a96e;color:#1a1a18;border:none;border-radius:2px;font-family:'Archivo',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;transition:background 0.2s}
        .btn:hover{background:#d4b87a}
        .btn:disabled{opacity:0.5;cursor:not-allowed}
        .lnk{margin-top:24px;font-size:12px;color:#6b6b64;text-align:center}
        .lnk span{color:#c8a96e;cursor:pointer}
        @media (max-width:420px){
          .wrap{padding:20px 14px;align-items:flex-start}
          .card{padding:28px 18px;max-width:100%}
          .logo{font-size:16px;letter-spacing:0.08em;margin-bottom:24px;overflow-wrap:anywhere}
          .title{font-size:30px}
          .sub{line-height:1.6;margin-bottom:24px}
          .btn{letter-spacing:0.12em}
        }
      `}</style>
      <div className="wrap">
        <div className="card">
          <p className="logo" onClick={() => router.push("/")}>ResumeFit AI</p>
          <h1 className="title">Create account</h1>
          <p className="sub">Start building job-winning resumes</p>
          {error && <div className="err">{error}</div>}
          <div className="fg"><label>Full Name</label>
            <input placeholder="Jane Doe" value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} /></div>
          <div className="fg"><label>Email</label>
            <input type="email" placeholder="jane@example.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
          <div className="fg"><label>Password</label>
            <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm({...form, password: e.target.value})} /></div>
          <div className="fg"><label>I am a</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
              <option value="job_seeker">Job Seeker</option>
              <option value="recruiter">Recruiter</option>
            </select></div>
          <button className="btn" onClick={handle} disabled={loading}>
            {loading ? "Creating account..." : "Create Account →"}</button>
          <p className="lnk">Already have an account? <span onClick={() => router.push("/login")}>Sign in</span></p>
        </div>
      </div>
    </>
  );
}
