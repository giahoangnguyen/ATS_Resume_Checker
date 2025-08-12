import { useState } from "react";

export default function UploadModal({ open, onClose, onMatch }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [jdFile, setJdFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jdText, setJdText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onMatch({ resumeFile, jdFile, resumeText, jdText });
  };

  return (
    <div className={`modal-overlay ${open ? "show" : ""}`}>
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>Resume & Job Description</h2>

          <div className="form-group">
            <label>Resume (PDF/DOCX)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="form-group">
          <label>Hoặc dán nội dung Resume</label>
            <textarea
              rows={6}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste resume text..."
            />
          </div>

          <div className="form-group">
            <label>Job Description (tùy chọn)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setJdFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div className="form-group">
            <label>Hoặc dán JD</label>
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
