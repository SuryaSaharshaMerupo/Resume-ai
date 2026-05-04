// frontend/app/dashboard/profile/page.tsx
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any, react/no-unescaped-entities */
import { useState, useEffect, useRef } from "react";
import { profileApi } from "@/services/api/profile";

const emptyProfile = {
  phone: "", location: "", linkedin: "", github: "", portfolio: "",
  education: [{ college: "", degree: "", branch: "", graduation_year: "", gpa: "" }],
  skills: [] as string[],
  work_experience: [{ company: "", role: "", duration: "", description: "" }],
  projects: [{ name: "", description: "", tech_stack: [], link: "" }],
  certifications: [{ name: "", issuer: "", year: "" }],
};

export default function ProfilePage() {
  const [profile, setProfile] = useState(emptyProfile);
  const [skillInput, setSkillInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autofilling, setAutofilling] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    profileApi.get().then(data => setProfile({ ...emptyProfile, ...data })).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await profileApi.update(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  };

  const handleAutofill = async (file: File) => {
    setAutofilling(true);
    try {
      const data = await profileApi.autofill(file);
      const ext = data.extracted;
      setProfile(prev => ({
        ...prev,
        phone: ext.phone || prev.phone,
        location: ext.location || prev.location,
        linkedin: ext.linkedin || prev.linkedin,
        github: ext.github || prev.github,
        portfolio: ext.portfolio || prev.portfolio,
        skills: ext.skills?.length ? ext.skills : prev.skills,
        education: ext.education?.length ? ext.education : prev.education,
        work_experience: ext.work_experience?.length ? ext.work_experience : prev.work_experience,
        projects: ext.projects?.length ? ext.projects : prev.projects,
        certifications: ext.certifications?.length ? ext.certifications : prev.certifications,
      }));
    } catch (e: any) { alert(e.message); }
    finally { setAutofilling(false); }
  };

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      setProfile(p => ({ ...p, skills: [...p.skills, skillInput.trim()] }));
      setSkillInput("");
    }
  };

  const removeSkill = (s: string) =>
    setProfile(p => ({ ...p, skills: p.skills.filter(x => x !== s) }));

  const updateArray = (key: string, index: number, field: string, value: string) => {
    setProfile(p => {
      const arr = [...(p as any)[key]];
      arr[index] = { ...arr[index], [field]: value };
      return { ...p, [key]: arr };
    });
  };

  const addItem = (key: string, template: object) =>
    setProfile(p => ({ ...p, [key]: [...(p as any)[key], { ...template }] }));

  const removeItem = (key: string, index: number) =>
    setProfile(p => ({ ...p, [key]: (p as any)[key].filter((_: any, i: number) => i !== index) }));

  return (
    <>
      <style>{profileStyles}</style>
      <div>
        <p className="page-eyebrow">Profile</p>
        <h1 className="page-title">Your <em>profile</em></h1>
        <p className="page-sub">Keep your information up to date. Auto-fill from your resume for speed.</p>

        {/* Autofill Banner */}
        <div className="autofill-banner">
          <input type="file" ref={fileRef} style={{ display: "none" }}
            onChange={e => { if (e.target.files?.[0]) handleAutofill(e.target.files[0]); }} />
          <div>
            <p className="af-title">Auto-fill from Resume</p>
            <p className="af-sub">Upload your resume and we'll extract your info automatically</p>
          </div>
          <button className="af-btn" onClick={() => fileRef.current?.click()} disabled={autofilling}>
            {autofilling ? "Extracting..." : "Upload Resume →"}
          </button>
        </div>

        {/* Basic Info */}
        <div className="section">
          <p className="section-label">Contact & Links</p>
          <div className="field-grid">
            {[
              ["Phone", "phone", "tel"], ["Location", "location", "text"],
              ["LinkedIn", "linkedin", "url"], ["GitHub", "github", "url"],
              ["Portfolio", "portfolio", "url"]
            ].map(([label, key, type]) => (
              <div key={key} className="field-group">
                <label>{label}</label>
                <input type={type} placeholder={label} value={(profile as any)[key] || ""}
                  onChange={e => setProfile(p => ({ ...p, [key]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>

        {/* Skills */}
        <div className="section">
          <p className="section-label">Skills</p>
          <div className="skill-input-row">
            <input placeholder="Add a skill (e.g. Python, React)" value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && addSkill()} />
            <button onClick={addSkill}>Add</button>
          </div>
          <div className="skill-wrap">
            {profile.skills.map(s => (
              <span key={s} className="skill-tag">
                {s} <button onClick={() => removeSkill(s)}>×</button>
              </span>
            ))}
          </div>
        </div>

        {/* Education */}
        <div className="section">
          <div className="section-header">
            <p className="section-label">Education</p>
            <button className="add-btn" onClick={() => addItem("education",
              { college: "", degree: "", branch: "", graduation_year: "", gpa: "" })}>
              + Add
            </button>
          </div>
          {profile.education.map((edu, i) => (
            <div key={i} className="array-card">
              <div className="array-card-header">
                <span>{edu.college || `Education ${i + 1}`}</span>
                <button onClick={() => removeItem("education", i)}>Remove</button>
              </div>
              <div className="field-grid">
                {[
                  ["College / University", "college"], ["Degree", "degree"],
                  ["Branch / Major", "branch"], ["Graduation Year", "graduation_year"], ["GPA", "gpa"]
                ].map(([label, field]) => (
                  <div key={field} className="field-group">
                    <label>{label}</label>
                    <input placeholder={label} value={(edu as any)[field] || ""}
                      onChange={e => updateArray("education", i, field, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Work Experience */}
        <div className="section">
          <div className="section-header">
            <p className="section-label">Work Experience</p>
            <button className="add-btn" onClick={() => addItem("work_experience",
              { company: "", role: "", duration: "", description: "" })}>+ Add</button>
          </div>
          {profile.work_experience.map((exp, i) => (
            <div key={i} className="array-card">
              <div className="array-card-header">
                <span>{exp.company || `Experience ${i + 1}`}</span>
                <button onClick={() => removeItem("work_experience", i)}>Remove</button>
              </div>
              <div className="field-grid">
                {[["Company", "company"], ["Role / Title", "role"], ["Duration", "duration"]].map(([label, field]) => (
                  <div key={field} className="field-group">
                    <label>{label}</label>
                    <input placeholder={label} value={(exp as any)[field] || ""}
                      onChange={e => updateArray("work_experience", i, field, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="field-group" style={{ marginTop: 12 }}>
                <label>Description</label>
                <textarea rows={3} placeholder="Describe your responsibilities and achievements..."
                  value={exp.description || ""}
                  onChange={e => updateArray("work_experience", i, "description", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="section">
          <div className="section-header">
            <p className="section-label">Projects</p>
            <button className="add-btn" onClick={() => addItem("projects",
              { name: "", description: "", tech_stack: [], link: "" })}>+ Add</button>
          </div>
          {profile.projects.map((proj, i) => (
            <div key={i} className="array-card">
              <div className="array-card-header">
                <span>{proj.name || `Project ${i + 1}`}</span>
                <button onClick={() => removeItem("projects", i)}>Remove</button>
              </div>
              <div className="field-grid">
                {[["Project Name", "name"], ["Link", "link"]].map(([label, field]) => (
                  <div key={field} className="field-group">
                    <label>{label}</label>
                    <input placeholder={label} value={(proj as any)[field] || ""}
                      onChange={e => updateArray("projects", i, field, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="field-group" style={{ marginTop: 12 }}>
                <label>Description</label>
                <textarea rows={3} placeholder="What did this project do? What did you build?"
                  value={proj.description || ""}
                  onChange={e => updateArray("projects", i, "description", e.target.value)} />
              </div>
            </div>
          ))}
        </div>

        {/* Save */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginTop: 40 }}>
          <button className="save-btn" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Profile →"}
          </button>
          {saved && <span style={{ fontSize: 12, color: "#6fcf97", letterSpacing: "0.1em" }}>✓ Saved</span>}
        </div>
      </div>
    </>
  );
}

const profileStyles = `
  .page-eyebrow { font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: #c8a96e; margin-bottom: 16px; }
  .page-title { font-family: 'Cormorant Garamond', serif; font-size: 42px; font-weight: 300; margin-bottom: 8px; }
  .page-title em { font-style: italic; color: #c8a96e; }
  .page-sub { font-size: 13px; color: #6b6b64; letter-spacing: 0.04em; margin-bottom: 32px; }
  .autofill-banner { background: rgba(200,169,110,0.06); border: 1px solid rgba(200,169,110,0.2); border-radius: 2px; padding: 24px 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 40px; flex-wrap: wrap; }
  .af-title { font-size: 14px; font-weight: 500; margin-bottom: 4px; letter-spacing: 0.04em; }
  .af-sub { font-size: 12px; color: #6b6b64; letter-spacing: 0.04em; }
  .af-btn { padding: 12px 28px; background: #c8a96e; color: #1a1a18; border: none; font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: background 0.2s; white-space: nowrap; }
  .af-btn:hover { background: #d4b87a; }
  .af-btn:disabled { opacity: 0.5; }
  .section { margin-bottom: 48px; }
  .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
  .section-label { font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; color: #c8a96e; }
  .add-btn { background: transparent; border: 1px solid rgba(200,169,110,0.3); color: #c8a96e; padding: 6px 14px; font-family: 'Archivo', sans-serif; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: all 0.2s; }
  .add-btn:hover { background: rgba(200,169,110,0.08); }
  .field-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; }
  .field-group label { display: block; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #6b6b64; margin-bottom: 8px; }
  .field-group input, .field-group textarea { width: 100%; background: #0f0f0e; border: 1px solid rgba(242,237,230,0.08); border-radius: 2px; padding: 11px 14px; color: #f2ede6; font-family: 'Archivo', sans-serif; font-size: 12px; font-weight: 300; outline: none; transition: border-color 0.2s; }
  .field-group input:focus, .field-group textarea:focus { border-color: #c8a96e; }
  .field-group textarea { resize: vertical; line-height: 1.6; }
  .skill-input-row { display: flex; gap: 8px; margin-bottom: 12px; }
  .skill-input-row input { flex: 1; background: #0f0f0e; border: 1px solid rgba(242,237,230,0.08); border-radius: 2px; padding: 11px 14px; color: #f2ede6; font-family: 'Archivo', sans-serif; font-size: 12px; outline: none; transition: border-color 0.2s; }
  .skill-input-row input:focus { border-color: #c8a96e; }
  .skill-input-row button { padding: 11px 20px; background: #c8a96e; color: #1a1a18; border: none; font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.1em; cursor: pointer; border-radius: 1px; transition: background 0.2s; }
  .skill-input-row button:hover { background: #d4b87a; }
  .skill-wrap { display: flex; flex-wrap: wrap; gap: 8px; }
  .skill-tag { display: flex; align-items: center; gap: 6px; padding: 5px 12px; background: rgba(200,169,110,0.08); border: 1px solid rgba(200,169,110,0.2); border-radius: 1px; font-size: 11px; letter-spacing: 0.08em; color: #c8a96e; }
  .skill-tag button { background: none; border: none; color: #c8a96e; cursor: pointer; font-size: 14px; line-height: 1; padding: 0; opacity: 0.6; }
  .skill-tag button:hover { opacity: 1; }
  .array-card { background: #0f0f0e; border: 1px solid rgba(242,237,230,0.06); border-radius: 2px; padding: 24px; margin-bottom: 12px; }
  .array-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
  .array-card-header span { font-size: 13px; font-weight: 500; letter-spacing: 0.04em; }
  .array-card-header button { background: none; border: 1px solid rgba(235,87,87,0.2); color: #eb5757; padding: 4px 12px; font-family: 'Archivo', sans-serif; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: all 0.2s; }
  .array-card-header button:hover { background: rgba(235,87,87,0.08); }
  .save-btn { padding: 14px 40px; background: #c8a96e; color: #1a1a18; border: none; font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: background 0.2s; }
  .save-btn:hover { background: #d4b87a; }
  .save-btn:disabled { opacity: 0.5; }
`;
