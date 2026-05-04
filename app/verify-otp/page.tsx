"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react-hooks/set-state-in-effect */
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api/auth";
import { tokenManager } from "@/services/auth/tokenManager";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [digits, setDigits] = useState(["","","","","",""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [email, setEmail] = useState("");
  const [purpose, setPurpose] = useState("login");
  const [devOtp, setDevOtp] = useState("");
  const refs = useRef<(HTMLInputElement|null)[]>([]);

  useEffect(() => {
    const e = sessionStorage.getItem("otp_email") || "";
    const p = sessionStorage.getItem("otp_purpose") || "login";
    const d = sessionStorage.getItem("dev_otp") || "";
    if (!e) { router.push("/login"); return; }
    setEmail(e); setPurpose(p);
    setDevOtp(d);
    const t = setInterval(() => setCooldown(c => c > 0 ? c-1 : 0), 1000);
    return () => clearInterval(t);
  }, [router]);

  const handleDigit = (i: number, v: string) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...digits]; n[i] = v; setDigits(n);
    if (v && i < 5) refs.current[i+1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i-1]?.focus();
  };

  const handleVerify = async () => {
    const code = digits.join("");
    if (code.length < 6) { setError("Enter the full 6-digit code"); return; }
    setError(""); setLoading(true);
    try {
      const data = await authApi.verifyOtp({ email, otp_code: code, purpose });
      tokenManager.setToken(data.access_token);
      tokenManager.setUser({ user_id: data.user_id, full_name: data.full_name, role: data.role });
      sessionStorage.removeItem("otp_email");
      sessionStorage.removeItem("otp_purpose");
      sessionStorage.removeItem("dev_otp");
      router.push("/dashboard");
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    try {
      const data = await authApi.resendOtp(email, purpose);
      setDevOtp(data.dev_otp || "");
      if (data.dev_otp) {
        sessionStorage.setItem("dev_otp", data.dev_otp);
      } else {
        sessionStorage.removeItem("dev_otp");
      }
      setCooldown(60); setDigits(["","","","","",""]); setError("");
    } catch (e: any) { setError(e.message); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400&family=Archivo:wght@300;400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        body{background:#1a1a18;color:#f2ede6;font-family:'Archivo',sans-serif}
        .wrap{min-height:100svh;display:flex;align-items:center;justify-content:center;padding:40px 24px}
        .card{width:100%;max-width:420px;background:#0f0f0e;border:1px solid rgba(242,237,230,0.08);border-radius:4px;padding:48px;text-align:center}
        .logo{font-family:'Cormorant Garamond',serif;font-size:18px;letter-spacing:0.14em;text-transform:uppercase;color:#c8a96e;margin-bottom:32px}
        .title{font-family:'Cormorant Garamond',serif;font-size:32px;font-weight:300;margin-bottom:8px}
        .sub{font-size:12px;color:#6b6b64;line-height:1.7;margin-bottom:6px}
        .em{font-size:12px;color:#c8a96e;margin-bottom:36px}
        .dev{background:rgba(200,169,110,0.1);border:1px solid rgba(200,169,110,0.28);color:#c8a96e;padding:10px 12px;border-radius:2px;font-size:12px;margin-bottom:24px}
        .boxes{display:flex;gap:10px;justify-content:center;margin-bottom:28px}
        .box{width:48px;height:56px;text-align:center;font-size:22px;font-family:'Cormorant Garamond',serif;background:#1a1a18;border:1px solid rgba(242,237,230,0.12);border-radius:2px;color:#f2ede6;outline:none;transition:border-color 0.2s}
        .box:focus{border-color:#c8a96e}
        .err{background:rgba(220,60,60,0.1);border:1px solid rgba(220,60,60,0.3);color:#e88;padding:12px;border-radius:2px;font-size:12px;margin-bottom:20px}
        .btn{width:100%;padding:14px;background:#c8a96e;color:#1a1a18;border:none;border-radius:2px;font-family:'Archivo',sans-serif;font-size:11px;font-weight:600;letter-spacing:0.18em;text-transform:uppercase;cursor:pointer;transition:background 0.2s;margin-bottom:20px}
        .btn:hover{background:#d4b87a}
        .btn:disabled{opacity:0.5;cursor:not-allowed}
        .resend{font-size:12px;color:#6b6b64}
        .resend button{background:none;border:none;color:#c8a96e;cursor:pointer;font-size:12px;padding:0}
        .resend button:disabled{color:#6b6b64;cursor:not-allowed}
      `}</style>
      <div className="wrap">
        <div className="card">
          <p className="logo">ResumeFit AI</p>
          <h1 className="title">Verify your identity</h1>
          <p className="sub">We sent a 6-digit code to</p>
          <p className="em">{email}</p>
          {devOtp && <div className="dev">Development OTP: {devOtp}</div>}
          <div className="boxes">
            {digits.map((d,i) => (
              <input key={i} className="box" maxLength={1} value={d}
                ref={el => { refs.current[i] = el; }}
                onChange={e => handleDigit(i, e.target.value)}
                onKeyDown={e => handleKey(i, e)} />
            ))}
          </div>
          {error && <div className="err">{error}</div>}
          <button className="btn" onClick={handleVerify} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP →"}</button>
          <div className="resend">
            {cooldown > 0 ? `Resend in ${cooldown}s` :
              <><span>Didn&apos;t get it? </span><button onClick={handleResend}>Resend OTP</button></>}
          </div>
        </div>
      </div>
    </>
  );
}
