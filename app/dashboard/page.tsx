// frontend/app/dashboard/page.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities, react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { tokenManager } from "@/services/auth/tokenManager";
import { resumeApi } from "@/services/api/resume";
import Link from "next/link";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setUser(tokenManager.getUser());
    resumeApi.history().then(setHistory).catch(() => {});
  }, []);

  const stats = [
    { label: "Resumes Built", value: history.length },
    { label: "Avg ATS Score", value: history.length ? Math.round(history.reduce((a, r) => a + (r.ats_score || 0), 0) / history.length) + "%" : "—" },
    { label: "Latest Score", value: history[0]?.ats_score ? Math.round(history[0].ats_score) + "%" : "—" },
  ];

  return (
    <>
      <style>{dashStyles}</style>
      <div>
        <p className="page-eyebrow">Dashboard</p>
        <h1 className="page-title">
          Welcome back, <em>{user?.full_name?.split(" ")[0] || "..."}</em>
        </h1>
        <p className="page-sub">Here's what's happening with your career toolkit.</p>

        <div className="stats-grid">
          {stats.map(s => (
            <div key={s.label} className="stat-card">
              <p className="stat-value">{s.value}</p>
              <p className="stat-label">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="quick-actions">
          <p className="section-label">Quick Actions</p>
          <div className="action-grid">
            <Link href="/dashboard/resume" className="action-card">
              <span className="action-icon">◎</span>
              <p className="action-name">Build Resume</p>
              <p className="action-desc">Upload & tailor to a job description</p>
            </Link>
            <Link href="/dashboard/profile" className="action-card">
              <span className="action-icon">◉</span>
              <p className="action-name">Edit Profile</p>
              <p className="action-desc">Update your skills & experience</p>
            </Link>
            <Link href="/dashboard/insights" className="action-card">
              <span className="action-icon">◇</span>
              <p className="action-name">ATS Insights</p>
              <p className="action-desc">See your resume's performance</p>
            </Link>
          </div>
        </div>

        {history.length > 0 && (
          <div>
            <p className="section-label" style={{ marginTop: 48 }}>Recent Resumes</p>
            <div className="history-list">
              {history.slice(0, 5).map((r: any) => (
                <div key={r.id} className="history-item">
                  <div>
                    <p className="history-name">{r.original_filename}</p>
                    <p className="history-date">ATS Score: {r.ats_score ? Math.round(r.ats_score) + "%" : "N/A"}</p>
                  </div>
                  <button className="dl-btn" onClick={() => resumeApi.download(r.id).catch((e) => alert(e.message))}>
                    Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

const dashStyles = `
  .page-eyebrow { font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #c8a96e; margin-bottom: 16px; }
  .page-title { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300; margin-bottom: 8px; }
  .page-title em { font-style: italic; color: #c8a96e; }
  .page-sub { font-size: 13px; color: #6b6b64; letter-spacing: 0.04em; margin-bottom: 48px; }
  .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1px; background: rgba(242,237,230,0.06); margin-bottom: 48px; }
  .stat-card { background: #0f0f0e; padding: 32px 24px; }
  .stat-value { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300; color: #c8a96e; margin-bottom: 6px; }
  .stat-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6b6b64; }
  .section-label { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #c8a96e; margin-bottom: 20px; }
  .action-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1px; background: rgba(242,237,230,0.06); }
  .action-card { background: #0f0f0e; padding: 28px 24px; text-decoration: none; color: inherit; transition: background 0.2s; display: block; }
  .action-card:hover { background: #141413; }
  .action-icon { font-size: 20px; color: #c8a96e; display: block; margin-bottom: 12px; }
  .action-name { font-size: 14px; font-weight: 500; margin-bottom: 6px; letter-spacing: 0.04em; }
  .action-desc { font-size: 11px; color: #6b6b64; letter-spacing: 0.04em; line-height: 1.6; }
  .history-list { display: flex; flex-direction: column; gap: 1px; background: rgba(242,237,230,0.06); }
  .history-item { background: #0f0f0e; padding: 20px 24px; display: flex; align-items: center; justify-content: space-between; }
  .history-name { font-size: 13px; margin-bottom: 4px; letter-spacing: 0.04em; }
  .history-date { font-size: 11px; color: #6b6b64; letter-spacing: 0.06em; }
  .dl-btn { background: transparent; border: 1px solid rgba(242,237,230,0.1); color: #6b6b64; padding: 8px 20px; font-family: 'Archivo', sans-serif; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: all 0.2s; }
  .dl-btn:hover { border-color: #c8a96e; color: #c8a96e; }
`;
