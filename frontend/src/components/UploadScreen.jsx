import { useState, useRef } from "react";

export default function UploadScreen({ onAnalyze, loading, error }) {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  function handleFile(selected) {
    if (!selected) return;
    setFile(selected);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files?.[0]);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    onAnalyze(file, jobDescription);
  }

  return (
    <div className="sheet">
      <p className="eyebrow">Resume Grader</p>
      <h1 className="headline">Get your resume marked up, honestly.</h1>
      <p className="subhead">
        Upload a resume and get it graded like a hiring manager would review
        it — scored, annotated, and marked up with exactly what to fix.
      </p>

      <form onSubmit={handleSubmit}>
        <div
          className={`dropzone ${dragOver ? "dragover" : ""}`}
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          tabIndex={0}
          role="button"
          aria-label="Upload resume file"
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {file ? (
            <span className="filename-chip">📄 {file.name}</span>
          ) : (
            <>
              <div className="dropzone-icon">[ + ]</div>
              <div className="dropzone-label">
                Drop your resume here, or click to browse
              </div>
              <div className="dropzone-hint">PDF, DOCX, or TXT</div>
            </>
          )}
        </div>

        <label className="field-label" htmlFor="jd">
          Target job description — optional
        </label>
        <textarea
          id="jd"
          className="jd-input"
          placeholder="Paste a job posting here to get a keyword match score and see what's missing..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />

        <button className="submit-btn" type="submit" disabled={!file || loading}>
          {loading ? "Grading…" : "Grade my resume"}
        </button>

        {error && <p className="error-note">{error}</p>}
      </form>
    </div>
  );
}
