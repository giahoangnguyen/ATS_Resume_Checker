/* src/App.jsx */
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "./App.css";
import "./matcher.css"; // keep or merge into App.css

/* ---------------- score helpers ---------------- */
const pickScore = (o) =>
  typeof o?.score === "number"
    ? o.score
    : typeof o?.match_score === "number"
    ? o.match_score
    : typeof o?.match?.score === "number"
    ? o.match.score
    : 0;

const normalizeScore = (s) => (s > 1 ? Math.round(s) : Math.round(s * 100));

/* ---------- small UI atoms (inline for convenience) ---------- */
function ScoreCircle({ score }) {
  const pct = Math.min(Math.max(score ?? 0, 0), 100);
  const style = {
    background: `conic-gradient(var(--primary-color) 0% ${pct}%, #374151 ${pct}% 100%)`,
    color: "#0f172a",                 
    textShadow: "0 0 2px rgba(255,255,255,0.35)" 
  };
  return (
    <div className="score-wrapper">
      <div className="score-circle" style={style}>
        {pct}%
      </div>
      <div className="score-label">Overall Score</div>
    </div>
  );
}

function ResultCard({ data }) {
  // Accept both single and multi responses
  let best = data;
  if (Array.isArray(data?.results)) {
    const idx = data.results
      .map((r, i) => ({ i, s: pickScore(r) }))
      .reduce((best, cur) => (cur.s > best.s ? cur : best), { i: 0, s: -Infinity })
      .i;
    best = data.results[idx];
  }

  const score = normalizeScore(pickScore(best));

  const level =
    score >= 75 ? "match-high" : score >= 50 ? "match-medium" : "match-low";

  const matched = best?.matched_keywords || best?.matched || [];
  const missing = best?.missing_keywords || best?.missing || [];
  const strengths = best?.details?.strengths || [];
  const gaps = best?.details?.gaps || [];

  return (
    <article className={`result-card ${level}`}>
      <div className="result-header">
        <h3 className="result-title">Match Result</h3>
        <ScoreCircle score={score} />
      </div>

      <div className="result-body">
        {best?.summary && (
          <section className="result-section">
            <h4>Tóm tắt</h4>
            <p>{best.summary}</p>
          </section>
        )}

        {!!matched.length && (
          <section className="result-section">
            <h4>Kỹ năng khớp</h4>
            {matched.map((k, i) => (
              <span className="badge" key={i}>
                {k}
              </span>
            ))}
          </section>
        )}

        {!!missing.length && (
          <section className="result-section">
            <h4>Kỹ năng thiếu</h4>
            {missing.map((k, i) => (
              <span className="badge" key={i}>
                {k}
              </span>
            ))}
          </section>
        )}

        {(strengths.length || gaps.length) && (
          <section className="result-section">
            <h4>Chi tiết</h4>

            {!!strengths.length && (
              <>
                <h5>Strengths</h5>
                <ul>
                  {strengths.map((s, idx) => (
                    <li key={idx}>{s}</li>
                  ))}
                </ul>
              </>
            )}

            {!!gaps.length && (
              <>
                <h5>Gaps</h5>
                <ul>
                  {gaps.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}
      </div>
    </article>
  );
}

function SearchBar({ value, onChange, onClear }) {
  return (
    <div style={{ display: "flex", gap: 8, margin: "16px 0" }}>
      <div className="search-bar" style={{ flex: 1 }}>
        <input
          type="search"
          placeholder="Search in the result (skills, keywords)..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <button className="btn-clear" onClick={onClear}>
        Clear
      </button>
    </div>
  );
}

function UploadModal({ open, onClose, onMatch }) {
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    await onMatch({ resumeText, jdText });
  };

  return (
    <div className={`modal-overlay ${open ? "show" : ""}`}>
      <div className="modal-content">
        <form onSubmit={submit}>
          <h2>Resume & Job Description</h2>

          <div className="form-group">
            <label>Resume (paste)</label>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume text..."
            />
          </div>

          <div className="form-group">
            <label>Job Description (paste)</label>
            <textarea
              rows={6}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste JD text..."
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              Match
            </button>
            <button type="button" className="btn-outline" onClick={onClose}>
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ---------- animated background component ---------- */
function AnimatedBG() {
  return (
    <div className="bg-wrap">
      <span className="blob blob-1" />
      <span className="blob blob-2" />
      <span className="blob blob-3" />
    </div>
  );
}

export default function App() {
  /* ---------- stage & UI state ---------- */
  const [stage, setStage] = useState("welcome"); // welcome | main
  const [active, setActive] = useState("Text"); // active tab
  const [threshold, setThreshold] = useState(0.8);

  /* NEW: modal + search */
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  /* ---------- matching payload state ---------- */
  const [resumeText, setResumeText] = useState("");
  const [jobText, setJobText] = useState("");
  const [resumeFiles, setResumeFiles] = useState([]);
  const [jobFile, setJobFile] = useState(null);
  const [multiResumes, setMultiResumes] = useState([]);

  /* ---------- result & UX flags ---------- */
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pretty = (o) => JSON.stringify(o, null, 2);
  const reset = () => {
    setResult(null);
    setError("");
  };

  /* ---------- drag helpers ---------- */
  const stopDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e, single = false, isResume = true) => {
    stopDefaults(e);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (!files.length) return;
    if (single) {
      isResume ? setResumeFiles([files[0]]) : setJobFile(files[0]);
    } else {
      setResumeFiles((prev) => [...prev, ...files]);
    }
  };

  /* ---------- API CALLS ---------- */
  const handleTextMatch = async (payload) => {
    // used by modal (payload) OR by Text tab (use local state)
    try {
      setLoading(true);
      const resText = payload?.resumeText ?? resumeText;
      const jd = payload?.jdText ?? jobText;
      const { data } = await axios.post("/match-text", {
        resume_text: resText,
        job_text: jd,
        threshold: Number(threshold),
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageMatch = async () => {
    try {
      if (!jobFile || resumeFiles.length === 0) {
        setError("Please choose both resume and JD images.");
        return;
      }
      setLoading(true);
      const fd = new FormData();
      fd.append("resume_file", resumeFiles[0]);
      fd.append("job_file", jobFile);
      fd.append("threshold", threshold);
      const { data } = await axios.post("/match-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiTextMatch = async () => {
    try {
      if (multiResumes.length === 0) {
        setError("Add at least one resume text.");
        return;
      }
      setLoading(true);
      const { data } = await axios.post("/match-text-multiple", {
        resume_texts: multiResumes,
        job_text: jobText,
        threshold: Number(threshold),
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMultiImageMatch = async () => {
    try {
      if (!jobFile || resumeFiles.length === 0) {
        setError("Pick at least one resume image and one JD image.");
        return;
      }
      setLoading(true);
      const fd = new FormData();
      resumeFiles.forEach((f) => fd.append("resume_files", f));
      fd.append("job_file", jobFile);
      fd.append("threshold", threshold);
      const { data } = await axios.post("/match-image-multiple", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- panel fade re-trigger ---------- */
  useEffect(() => {
    const card = document.querySelector(".panel");
    if (card) {
      card.classList.remove("fade");
      void card.offsetWidth;
      card.classList.add("fade");
    }
  }, [active]);

  /* ---------- tiny file list ---------- */
  const FileDisplay = ({ files, onRemove }) => (
    <ul className="fileList">
      {files.map((f, i) => (
        <li key={i}>
          {f.name}
          <button className="removeBtn" onClick={() => onRemove(i)}>
            ✕
          </button>
        </li>
      ))}
    </ul>
  );

  /* ---------- search (client-side, single result) ---------- */
  const filteredResult = useMemo(() => {
    if (!result) return null;
    if (!searchQuery.trim()) return result;
    const lower = JSON.stringify(result).toLowerCase();
    return lower.includes(searchQuery.toLowerCase()) ? result : null;
  }, [result, searchQuery]);

  /* ---------- WELCOME SCREEN ---------- */
  if (stage === "welcome") {
    return (
      <>
        <AnimatedBG />
        <div className="welcome">
          <h1 className="welcome__title">
            <span>ATS Resume Matcher</span> – get your CV close to&nbsp;
            <span className="dream">JDreams</span>
          </h1>
          <p className="welcome__tag">
            Our service is the bridge that brings every resume to its ideal job
            description instantly!
          </p>
          <button className="welcome__btn" onClick={() => setStage("main")}>
            Get Started
          </button>
        </div>
      </>
    );
  }

  /* ---------- MAIN UI ---------- */
  return (
    <>
      <AnimatedBG />
      <div className="container">
        <header className="app-header">
          <h1 className="title">ATS Resume Checker</h1>
        </header>

        {/* navigation (keep your old modes for power users) */}
        <nav className="tabs">
          {["Text", "Image", "Multi-Text", "Multi-Image"].map((id) => (
            <button
              key={id}
              className={`tab ${active === id ? "tab--active" : ""}`}
              onClick={() => {
                setActive(id);
                reset();
              }}
            >
              {id.replace(/-/g, " ")}
            </button>
          ))}
        </nav>

        {/* threshold input */}
        <label className="threshold">
          Threshold&nbsp;
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </label>

        {/* panels */}
        <section className="panel fade">
          {/* TEXT */}
          {active === "Text" && (
          <>
            <textarea
              placeholder="Paste resume text…"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
            <textarea
              placeholder="Paste JD text…"
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
            />
            <button onClick={() => handleTextMatch()} disabled={loading}>
              {loading ? <span className="spinner" /> : "Match text"}
            </button>
          </>
          )}

          {/* SINGLE IMAGE */}
          {active === "Image" && (
            <>
              <div
                className="dropZone"
                onDragOver={stopDefaults}
                onDrop={(e) => handleDrop(e, true, true)}
              >
                <p>
                  📄 Drop or Browse <strong>RESUME</strong> image here
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setResumeFiles(e.target.files ? [e.target.files[0]] : [])
                  }
                />
              </div>
              {resumeFiles.length === 1 && (
                <FileDisplay
                  files={resumeFiles}
                  onRemove={() => setResumeFiles([])}
                />
              )}

              <div
                className="dropZone jd"
                onDragOver={stopDefaults}
                onDrop={(e) => handleDrop(e, true, false)}
              >
                <p>
                  📝 Drop or Browse <strong>JD</strong> image here
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setJobFile(e.target.files[0])}
                />
              </div>
              {jobFile && <p className="fileName">{jobFile.name}</p>}

              <button onClick={handleImageMatch} disabled={loading}>
                {loading ? <span className="spinner" /> : "Match image"}
              </button>
            </>
          )}

          {/* MULTI TEXT */}
          {active === "Multi-Text" && (
            <>
              <textarea
                placeholder="Paste resume then Add…"
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
              />
              <button
                onClick={() => {
                  if (resumeText.trim()) {
                    setMultiResumes([...multiResumes, resumeText.trim()]);
                    setResumeText("");
                  }
                }}
              >
                Add ({multiResumes.length})
              </button>
              <textarea
                placeholder="JD text…"
                value={jobText}
                onChange={(e) => setJobText(e.target.value)}
              />
              <button onClick={handleMultiTextMatch} disabled={loading}>
                {loading ? <span className="spinner" /> : "Match ALL"}
              </button>
            </>
          )}

          {/* MULTI IMAGE */}
          {active === "Multi-Image" && (
            <>
              <div
                className="dropZone"
                onDragOver={stopDefaults}
                onDrop={(e) => handleDrop(e, false, true)}
              >
                <p>
                  📄 Drop or Browse <strong>RESUME image(s)</strong>
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) =>
                    setResumeFiles((prev) => [
                      ...prev,
                      ...(e.target.files ? [...e.target.files] : []),
                    ])
                  }
                />
              </div>
              {resumeFiles.length > 0 && (
                <FileDisplay
                  files={resumeFiles}
                  onRemove={(i) =>
                    setResumeFiles(resumeFiles.filter((_, idx) => idx !== i))
                  }
                />
              )}

              <div
                className="dropZone jd"
                onDragOver={stopDefaults}
                onDrop={(e) => handleDrop(e, true, false)}
              >
                <p>
                  📝 Drop or Browse <strong>JD</strong> image
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setJobFile(e.target.files[0])}
                />
              </div>
              {jobFile && <p className="fileName">{jobFile.name}</p>}

              <button onClick={handleMultiImageMatch} disabled={loading}>
                {loading ? <span className="spinner" /> : "Match ALL"}
              </button>
            </>
          )}
        </section>

        {/* search + results (new UI) */}
        {result && !Array.isArray(result) && (
          <>
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />

            {filteredResult ? (
              <ResultCard data={filteredResult} />
            ) : (
              <div className="empty-message">
                Không tìm thấy kết quả khớp tìm kiếm.
              </div>
            )}
          </>
        )}

        {/* keep raw JSON for debugging */}
        {error && <pre className="error">{error}</pre>}
        {result && (
          <details open className="results fade">
            <summary>Result JSON</summary>
            <pre>{pretty(result)}</pre>
          </details>
        )}
      </div>

      {/* Modal for the “quick” text workflow */}
      <UploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onMatch={async ({ resumeText, jdText }) => {
          await handleTextMatch({ resumeText, jdText });
          setIsUploadOpen(false);
        }}
      />
    </>
  );
}



