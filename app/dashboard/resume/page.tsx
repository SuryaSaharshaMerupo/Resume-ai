// frontend/app/dashboard/resume/page.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from "react";
import { resumeApi } from "@/services/api/resume";

export default function ResumePage() {
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatInstruction, setChatInstruction] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [editedResume, setEditedResume] = useState("");
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleTailor = async () => {
    if (!file || !jd) return;
    setLoading(true);
    try {
      const data = await resumeApi.tailor(file, jd);
      setResult(data);
      setEditedResume(data.tailored_text || "");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChatEdit = async () => {
    if (!chatInstruction || !editedResume) return;
    setChatLoading(true);
    try {
      const data = await resumeApi.chatEdit(editedResume, chatInstruction);
      setEditedResume(data.updated_resume);
      setChatInstruction("");
    } catch (e: any) {
      alert(e.message);
    } finally {
      setChatLoading(false);
    }
  };

  const handleDownload = () => {
    if (!editedResume.trim()) return;

    try {
      const sourceName = result?.original_filename
        ? result.original_filename.replace(/\.[^/.]+$/, "")
        : `resume_${result?.id || "latest"}`;

      resumeApi.downloadFromText(editedResume, `${sourceName}_tailored.pdf`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const scoreColor = (score: number) =>
    score >= 75 ? "#6fcf97" : score >= 50 ? "#f2c94c" : "#eb5757";

  return (
    <>
      <style>{resumePageStyles}</style>
      <div>
        <p className="page-eyebrow">Resume Tool</p>
        <h1 className="page-title">Tailor your <em>resume</em></h1>
        <p className="page-sub">Upload your resume and paste a job description to get a perfectly matched result.</p>

        <div className="two-col">
          {/* LEFT — Upload & JD */}
          <div>
            <p className="field-label">Your Resume</p>
            <input type="file" ref={fileRef} style={{ display: "none" }}
              onChange={e => setFile(e.target.files?.[0] || null)} />
            <div
              className={`upload-zone${dragging ? " drag-over" : ""}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => { e.preventDefault(); setDragging(false); setFile(e.dataTransfer.files?.[0] || null); }}
            >
              {file
                ? <><p className="uz-loaded">✓ {file.name}</p><p className="uz-hint">Click to replace</p></>
                : <><p className="uz-label">Drop PDF or DOCX</p><p className="uz-hint">Click or drag to upload</p></>
              }
            </div>

            <p className="field-label" style={{ marginTop: 24 }}>Job Description</p>
            <textarea
              placeholder="Paste the full job description here..."
              rows={10}
              value={jd}
              onChange={e => setJd(e.target.value)}
            />

            <button className="primary-btn" onClick={handleTailor} disabled={loading || !file || !jd}>
              {loading ? "Tailoring..." : "Generate Tailored Resume →"}
            </button>
          </div>

          {/* RIGHT — Results */}
          {result && (
            <div>
              {/* ATS Score */}
              <div className="score-card">
                <p className="field-label">ATS Score</p>
                <div className="score-display">
                  <span className="score-num" style={{ color: scoreColor(result.ats_score || 0) }}>
                    {Math.round(result.ats_score || 0)}%
                  </span>
                  <div className="score-bar-wrap">
                    <div className="score-bar" style={{
                      width: `${result.ats_score || 0}%`,
                      background: scoreColor(result.ats_score || 0)
                    }} />
                  </div>
                </div>

                {result.missing_keywords && (
                  <div style={{ marginTop: 16 }}>
                    <p className="field-label">Missing Keywords</p>
                    <div className="keyword-wrap">
                      {result.missing_keywords.split(",").filter(Boolean).map((kw: string) => (
                        <span key={kw} className="keyword-tag">{kw.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Tailored Resume */}
              <p className="field-label" style={{ marginTop: 24 }}>Tailored Resume</p>
              <textarea
                className="result-textarea"
                value={editedResume}
                onChange={e => setEditedResume(e.target.value)}
                rows={16}
              />

              {/* Chat Edit */}
              <p className="field-label" style={{ marginTop: 24 }}>Chat Edit</p>
              <div className="chat-row">
                <input
                  placeholder='e.g. "Make the summary more senior" or "Add Python to skills"'
                  value={chatInstruction}
                  onChange={e => setChatInstruction(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleChatEdit()}
                />
                <button onClick={handleChatEdit} disabled={chatLoading}>
                  {chatLoading ? "..." : "→"}
                </button>
              </div>

              {/* AI Feedback */}
              {result.ai_feedback && (
                <details style={{ marginTop: 24 }}>
                  <summary className="field-label" style={{ cursor: "pointer" }}>
                    AI Feedback (click to expand)
                  </summary>
                  <div className="feedback-box">{result.ai_feedback}</div>
                </details>
              )}

              {/* Download */}
              <button className="secondary-btn" onClick={handleDownload}
                style={{ marginTop: 24 }}>
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

const resumePageStyles = `
  .page-eyebrow { font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #c8a96e; margin-bottom: 16px; }
  .page-title { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300; margin-bottom: 8px; }
  .page-title em { font-style: italic; color: #c8a96e; }
  .page-sub { font-size: 13px; color: #6b6b64; letter-spacing: 0.04em; margin-bottom: 40px; }
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
  @media (max-width: 900px) { .two-col { grid-template-columns: 1fr; } }
  .field-label { font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #6b6b64; margin-bottom: 10px; display: block; }
  .upload-zone { background: #0f0f0e; border: 1px solid rgba(242,237,230,0.08); border-radius: 2px; padding: 36px 24px; text-align: center; cursor: pointer; transition: all 0.2s; margin-bottom: 4px; }
  .upload-zone:hover, .upload-zone.drag-over { border-color: #c8a96e; background: rgba(200,169,110,0.04); }
  .uz-loaded { font-size: 13px; color: #c8a96e; margin-bottom: 4px; }
  .uz-label { font-size: 12px; color: #f2ede6; margin-bottom: 4px; }
  .uz-hint { font-size: 11px; color: #6b6b64; }
  textarea { width: 100%; background: #0f0f0e; border: 1px solid rgba(242,237,230,0.08); border-radius: 2px; padding: 16px; color: #f2ede6; font-family: 'Archivo', sans-serif; font-size: 12px; font-weight: 300; line-height: 1.7; outline: none; resize: vertical; transition: border-color 0.2s; }
  textarea:focus { border-color: #c8a96e; }
  .result-textarea { border: 1px solid rgba(200,169,110,0.2); }
  .primary-btn { width: 100%; margin-top: 20px; padding: 14px; background: #c8a96e; color: #1a1a18; border: none; border-radius: 2px; font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
  .primary-btn:hover { background: #d4b87a; }
  .primary-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .secondary-btn { padding: 11px 24px; background: transparent; border: 1px solid rgba(242,237,230,0.1); color: #6b6b64; font-family: 'Archivo', sans-serif; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: all 0.2s; }
  .secondary-btn:hover { border-color: #c8a96e; color: #c8a96e; }
  .score-card { background: #0f0f0e; border: 1px solid rgba(242,237,230,0.06); padding: 24px; border-radius: 2px; }
  .score-display { display: flex; align-items: center; gap: 16px; margin: 8px 0; }
  .score-num { font-family: 'Cormorant Garamond', serif; font-size: 48px; font-weight: 300; line-height: 1; }
  .score-bar-wrap { flex: 1; height: 2px; background: rgba(242,237,230,0.08); border-radius: 1px; }
  .score-bar { height: 100%; border-radius: 1px; transition: width 0.6s ease; }
  .keyword-wrap { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
  .keyword-tag { padding: 4px 10px; background: rgba(235,87,87,0.1); border: 1px solid rgba(235,87,87,0.25); border-radius: 1px; font-size: 10px; letter-spacing: 0.1em; color: #eb5757; }
  .chat-row { display: flex; gap: 8px; }
  .chat-row input { flex: 1; background: #0f0f0e; border: 1px solid rgba(242,237,230,0.08); border-radius: 2px; padding: 12px 16px; color: #f2ede6; font-family: 'Archivo', sans-serif; font-size: 12px; outline: none; transition: border-color 0.2s; }
  .chat-row input:focus { border-color: #c8a96e; }
  .chat-row button { padding: 12px 20px; background: #c8a96e; color: #1a1a18; border: none; border-radius: 2px; font-size: 16px; cursor: pointer; transition: background 0.2s; font-weight: 600; }
  .chat-row button:hover { background: #d4b87a; }
  .chat-row button:disabled { opacity: 0.5; }
  .feedback-box { background: #0f0f0e; border: 1px solid rgba(242,237,230,0.06); padding: 20px; margin-top: 12px; font-size: 12px; line-height: 1.8; color: #9a9a90; white-space: pre-wrap; border-radius: 2px; }
`;
