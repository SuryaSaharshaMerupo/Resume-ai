// frontend/app/dashboard/insights/page.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import { useEffect, useState } from "react";
import { resumeApi } from "@/services/api/resume";

export default function InsightsPage() {
  const [history, setHistory] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);

  useEffect(() => {
    resumeApi.history().then(data => {
      setHistory(data);
      if (data.length) setSelected(data[0]);
    }).catch(() => {});
  }, []);

  const avg = history.length
    ? Math.round(history.reduce((a, r) => a + (r.ats_score || 0), 0) / history.length)
    : 0;

  const scoreColor = (s: number) => s >= 75 ? "#6fcf97" : s >= 50 ? "#f2c94c" : "#eb5757";

  return (
    <>
      <style>{`
        .page-eyebrow { font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #c8a96e; margin-bottom: 16px; }
        .page-title { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300; margin-bottom: 8px; }
        .page-title em { font-style: italic; color: #c8a96e; }
        .page-sub { font-size: 13px; color: #6b6b64; margin-bottom: 40px; }
        .top-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1px; background: rgba(242,237,230,0.06); margin-bottom: 40px; }
        .stat { background: #0f0f0e; padding: 28px 20px; }
        .stat-val { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: #c8a96e; }
        .stat-lbl { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6b6b64; margin-top: 4px; }
        .two-panel { display: grid; grid-template-columns: 1fr 1.4fr; gap: 24px; }
        @media (max-width: 900px) { .two-panel { grid-template-columns: 1fr; } }
        .panel-label { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #6b6b64; margin-bottom: 12px; }
        .resume-list { display: flex; flex-direction: column; gap: 1px; background: rgba(242,237,230,0.06); }
        .resume-item { background: #0f0f0e; padding: 16px 18px; cursor: pointer; transition: background 0.15s; border-left: 2px solid transparent; }
        .resume-item:hover { background: #141413; }
        .resume-item.active { border-left-color: #c8a96e; background: rgba(200,169,110,0.04); }
        .ri-name { font-size: 12px; letter-spacing: 0.04em; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ri-score { font-size: 11px; }
        .detail-card { background: #0f0f0e; border: 1px solid rgba(242,237,230,0.06); border-radius: 2px; padding: 28px; height: fit-content; }
        .big-score { font-family: 'Cormorant Garamond', serif; font-size: 72px; font-weight: 300; line-height: 1; margin-bottom: 8px; }
        .score-bar-wrap { height: 2px; background: rgba(242,237,230,0.08); border-radius: 1px; margin: 12px 0 24px; }
        .score-bar { height: 100%; border-radius: 1px; transition: width 0.6s; }
        .kw-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6b6b64; margin-bottom: 10px; }
        .kw-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 24px; }
        .kw-tag { padding: 4px 10px; background: rgba(235,87,87,0.08); border: 1px solid rgba(235,87,87,0.2); font-size: 10px; letter-spacing: 0.1em; color: #eb5757; border-radius: 1px; }
        .fb-box { background: #141413; border: 1px solid rgba(242,237,230,0.06); padding: 16px; font-size: 11px; line-height: 1.8; color: #9a9a90; white-space: pre-wrap; max-height: 300px; overflow-y: auto; border-radius: 1px; }
        .empty { padding: 80px; text-align: center; color: #6b6b64; font-size: 13px; }
      `}</style>

      <div>
        <p className="page-eyebrow">ATS Insights</p>
        <h1 className="page-title">Your <em>performance</em></h1>
        <p className="page-sub">Track your ATS scores and see what keywords you're missing.</p>

        <div className="top-stats">
          <div className="stat"><p className="stat-val">{history.length}</p><p className="stat-lbl">Total Resumes</p></div>
          <div className="stat"><p className="stat-val">{avg}%</p><p className="stat-lbl">Avg ATS Score</p></div>
          <div className="stat">
            <p className="stat-val" style={{ color: scoreColor(history[0]?.ats_score || 0) }}>
              {history[0] ? Math.round(history[0].ats_score) + "%" : "—"}
            </p>
            <p className="stat-lbl">Latest Score</p>
          </div>
        </div>

        {history.length === 0 ? (
          <div className="empty">No resumes yet. Build your first one in the Resume Tool.</div>
        ) : (
          <div className="two-panel">
            <div>
              <p className="panel-label">Resume History</p>
              <div className="resume-list">
                {history.map(r => (
                  <div key={r.id}
                    className={`resume-item${selected?.id === r.id ? " active" : ""}`}
                    onClick={() => setSelected(r)}>
                    <p className="ri-name">{r.original_filename}</p>
                    <p className="ri-score" style={{ color: scoreColor(r.ats_score || 0) }}>
                      ATS: {r.ats_score ? Math.round(r.ats_score) + "%" : "N/A"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {selected && (
              <div className="detail-card">
                <p className="panel-label">Selected — {selected.original_filename}</p>
                <p className="big-score" style={{ color: scoreColor(selected.ats_score || 0) }}>
                  {Math.round(selected.ats_score || 0)}%
                </p>
                <div className="score-bar-wrap">
                  <div className="score-bar" style={{
                    width: `${selected.ats_score || 0}%`,
                    background: scoreColor(selected.ats_score || 0)
                  }} />
                </div>

                {selected.missing_keywords && (
                  <>
                    <p className="kw-label">Missing Keywords</p>
                    <div className="kw-wrap">
                      {selected.missing_keywords.split(",").filter(Boolean).map((kw: string) => (
                        <span key={kw} className="kw-tag">{kw.trim()}</span>
                      ))}
                    </div>
                  </>
                )}

                {selected.ai_feedback && (
                  <>
                    <p className="kw-label">AI Feedback</p>
                    <div className="fb-box">{selected.ai_feedback}</div>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
