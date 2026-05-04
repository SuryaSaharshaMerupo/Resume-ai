"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { tokenManager } from "@/services/auth/tokenManager";

export default function Home() {
  const router = useRouter();

  const handleCTA = () => {
    if (tokenManager.isLoggedIn()) {
      router.push("/dashboard/resume");
    } else {
      router.push("/signup");
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Archivo:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root {
          --ivory: #f2ede6; --charcoal: #1a1a18; --mid: #2e2e2a;
          --muted: #6b6b64; --accent: #c8a96e; --border: rgba(242,237,230,0.1);
        }
        body { background: var(--charcoal); color: var(--ivory); font-family: 'Archivo', sans-serif; font-weight: 300; }
        .display { font-family: 'Cormorant Garamond', serif; }

        .ticker-wrap { overflow: hidden; white-space: nowrap; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 10px 0; background: var(--mid); position: relative; z-index: 10; }
        .ticker-track { display: inline-flex; animation: ticker 22s linear infinite; }
        .ticker-item { font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); padding: 0 48px; }
        .ticker-item span { color: var(--accent); margin-right: 12px; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }

        nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; display: flex; align-items: center; justify-content: space-between; padding: 24px 48px; background: linear-gradient(to bottom, rgba(26,26,24,0.95), transparent); backdrop-filter: blur(4px); }
        .nav-logo { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; letter-spacing: 0.12em; text-transform: uppercase; color: var(--ivory); cursor: pointer; }
        .nav-links { display: flex; align-items: center; gap: 32px; }
        .nav-link { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); cursor: pointer; text-decoration: none; transition: color 0.2s; }
        .nav-link:hover { color: var(--ivory); }
        .nav-cta { font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--charcoal); background: var(--accent); padding: 10px 24px; cursor: pointer; text-decoration: none; transition: background 0.2s; border-radius: 1px; font-weight: 600; border: none; font-family: 'Archivo', sans-serif; }
        .nav-cta:hover { background: #d4b87a; }

        .hero { min-height: 100svh; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; overflow: hidden; padding: 120px 48px 80px; }
        .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 60% at 50% 30%, rgba(200,169,110,0.06) 0%, transparent 70%); }
        .hero-grid { position: absolute; inset: 0; background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px); background-size: 80px 80px; mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 30%, transparent 100%); }
        .hero-eyebrow { font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--accent); margin-bottom: 28px; position: relative; }
        .hero-title { font-size: clamp(56px, 9vw, 120px); font-weight: 300; line-height: 0.95; text-align: center; letter-spacing: -0.01em; margin-bottom: 32px; position: relative; }
        .hero-title em { font-style: italic; color: var(--accent); }
        .hero-sub { font-size: 13px; letter-spacing: 0.08em; color: var(--muted); text-align: center; max-width: 380px; line-height: 1.8; margin-bottom: 48px; position: relative; }
        .hero-btns { display: flex; gap: 16px; align-items: center; position: relative; flex-wrap: wrap; justify-content: center; }
        .btn-primary { display: flex; align-items: center; gap: 12px; background: var(--accent); color: var(--charcoal); border: none; padding: 18px 48px; font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: background 0.2s, transform 0.2s; }
        .btn-primary:hover { background: #d4b87a; transform: translateY(-1px); }
        .btn-secondary { display: flex; align-items: center; gap: 12px; background: transparent; color: var(--accent); border: 1px solid rgba(200,169,110,0.4); padding: 17px 32px; font-family: 'Archivo', sans-serif; font-size: 11px; font-weight: 500; letter-spacing: 0.18em; text-transform: uppercase; cursor: pointer; border-radius: 1px; transition: border-color 0.2s, transform 0.2s; }
        .btn-secondary:hover { border-color: var(--accent); transform: translateY(-1px); }

        .scroll-hint { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--muted); }
        .scroll-line { width: 1px; height: 48px; background: linear-gradient(to bottom, var(--accent), transparent); animation: scrollPulse 2s ease-in-out infinite; }
        @keyframes scrollPulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }

        .section-rule { border: none; border-top: 1px solid var(--border); margin: 0 48px; }
        .section-label { font-size: 9px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }

        .how-section { padding: 100px 48px; max-width: 960px; margin: 0 auto; }
        .how-title { font-size: clamp(32px, 5vw, 56px); font-weight: 300; margin-bottom: 16px; }
        .how-title em { font-style: italic; color: var(--accent); }
        .how-desc { font-size: 13px; color: var(--muted); line-height: 1.8; max-width: 480px; margin-bottom: 56px; }
        .steps-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1px; background: var(--border); }
        .step-card { background: var(--charcoal); padding: 40px 32px; }
        .step-num { font-size: 9px; letter-spacing: 0.25em; text-transform: uppercase; color: var(--accent); margin-bottom: 16px; }
        .step-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; margin-bottom: 12px; }
        .step-desc { font-size: 12px; color: var(--muted); line-height: 1.7; }

        .features-section { padding: 100px 48px; max-width: 960px; margin: 0 auto; }
        .features-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: var(--border); }
        .feature-card { background: var(--mid); padding: 40px; }
        .feature-icon { font-size: 20px; color: var(--accent); margin-bottom: 16px; }
        .feature-title { font-size: 16px; font-weight: 400; margin-bottom: 10px; letter-spacing: 0.04em; }
        .feature-desc { font-size: 12px; color: var(--muted); line-height: 1.7; }

        .cta-section { padding: 100px 48px; text-align: center; background: var(--mid); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .cta-title { font-size: clamp(36px, 6vw, 72px); font-weight: 300; margin-bottom: 24px; }
        .cta-title em { font-style: italic; color: var(--accent); }
        .cta-sub { font-size: 13px; color: var(--muted); margin-bottom: 40px; }

        footer { border-top: 1px solid var(--border); padding: 32px 48px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
        .footer-logo { font-family: 'Cormorant Garamond', serif; font-size: 16px; letter-spacing: 0.14em; text-transform: uppercase; }
        .footer-copy { font-size: 10px; letter-spacing: 0.14em; color: var(--muted); }

        @media (max-width: 768px) {
          nav { padding: 20px 24px; }
          .hero { padding: 100px 24px 80px; }
          .how-section, .features-section { padding: 60px 24px; }
          .steps-grid, .features-grid { grid-template-columns: 1fr; }
          .section-rule { margin: 0 24px; }
          .cta-section { padding: 60px 24px; }
          footer { padding: 24px; }
        }
      `}</style>

      {/* NAV */}
      <nav>
        <div className="nav-logo display">ResumeFit AI</div>
        <div className="nav-links">
          <span className="nav-link" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>How it works</span>
          <span className="nav-link" onClick={() => router.push("/login")}>Sign in</span>
          <button className="nav-cta" onClick={handleCTA}>Get started</button>
        </div>
      </nav>

      {/* TICKER */}
      <div className="ticker-wrap">
        <div className="ticker-track">
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{ display: "inline-flex" }}>
              {["ATS Optimized", "Keyword Matched", "AI Tailored", "Job-Ready in Seconds", "Recruiter Approved", "Designed for Humans"].map(t => (
                <span key={t} className="ticker-item"><span>✦</span>{t}</span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid" />
        <motion.p className="hero-eyebrow" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
          AI Resume Builder - ATS Resume Optimizer
        </motion.p>
        <motion.h1 className="hero-title display" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.2 }}>
          ResumeFit<br /><em>AI</em>
        </motion.h1>
        <motion.p className="hero-sub" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}>
          Build a tailored, ATS-friendly resume with AI. Upload your resume, paste a job description, and download a recruiter-ready PDF.
        </motion.p>
        <motion.div className="hero-btns" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.6 }}>
          <button className="btn-primary" onClick={handleCTA}>Build My Resume →</button>
          <button className="btn-secondary" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>See how it works</button>
        </motion.div>
        <div className="scroll-hint">
          <div className="scroll-line" />
          <span>Scroll</span>
        </div>
      </section>

      <hr className="section-rule" />

      {/* HOW IT WORKS */}
      <section className="how-section" id="how">
        <motion.p className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>How It Works</motion.p>
        <motion.h2 className="how-title display" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          Three steps to your<br /><em>perfect resume</em>
        </motion.h2>
        <p className="how-desc">Our AI reads your experience and the job posting simultaneously — rewriting and reprioritizing to match what the hiring manager actually wants to see.</p>
        <div className="steps-grid">
          {[
            { num: "01", title: "Upload Resume", desc: "Drop your existing PDF or DOCX. We extract every detail automatically." },
            { num: "02", title: "Paste Job Description", desc: "Copy the full job posting. Our AI identifies every keyword and requirement." },
            { num: "03", title: "Download & Apply", desc: "Receive your tailored resume with ATS score and missing keyword analysis." },
          ].map((s, i) => (
            <motion.div key={s.num} className="step-card" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
              <p className="step-num">{s.num}</p>
              <p className="step-title">{s.title}</p>
              <p className="step-desc">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <hr className="section-rule" />

      {/* FEATURES */}
      <section className="features-section">
        <motion.p className="section-label" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>Features</motion.p>
        <div className="features-grid">
          {[
            { icon: "◎", title: "ATS Score Analysis", desc: "See exactly how well your resume matches the job posting with a percentage score." },
            { icon: "◇", title: "Missing Keyword Detection", desc: "Instantly see which keywords recruiters are looking for that your resume lacks." },
            { icon: "◉", title: "AI Feedback System", desc: "Get specific suggestions to improve weak bullet points, add metrics, and stronger action verbs." },
            { icon: "◈", title: "Chat-Based Editing", desc: "Tell the AI what to change in plain English and watch your resume update instantly." },
          ].map((f, i) => (
            <motion.div key={f.title} className="feature-card" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }}>
              <p className="feature-icon">{f.icon}</p>
              <p className="feature-title">{f.title}</p>
              <p className="feature-desc">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="cta-section">
        <motion.h2 className="cta-title display" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
          Ready to <em>elevate</em><br />your career?
        </motion.h2>
        <p className="cta-sub">Join thousands of job seekers landing more interviews with AI-tailored resumes.</p>
        <motion.button className="btn-primary" onClick={handleCTA} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }}>
          Get Started Free →
        </motion.button>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-logo display">ResumeFit AI</div>
        <div className="footer-copy">AI resume builder for ATS-friendly job applications</div>
      </footer>
    </>
  );
}
