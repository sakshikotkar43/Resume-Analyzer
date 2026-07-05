function scoreBarClass(score) {
  if (score >= 75) return "green";
  if (score < 50) return "red";
  return "";
}

function formatSuggestion(text) {
  // Turns  Change: "old" -> "new"  into styled inline code
  const parts = text.split(/("(?:[^"]+)")/g);
  return parts.map((part, i) =>
    part.startsWith('"') && part.endsWith('"') ? (
      <code key={i}>{part.slice(1, -1)}</code>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function ResultsScreen({ result, filename, onNewUpload }) {
  const bars = [
    { name: "Content", value: result.content_score },
    { name: "Formatting", value: result.formatting_score },
    { name: "ATS Fit", value: result.ats_score },
    { name: "Keyword Match", value: result.keyword_match_score },
  ].filter((b) => b.value !== null && b.value !== undefined);

  return (
    <div className="results">
      <div className="results-header">
        <div>
          <div className="results-filename">{filename}</div>
          <div className="results-title">Grading report</div>
        </div>
        <button className="link-button" onClick={onNewUpload}>
          ← Grade another
        </button>
      </div>

      <div className="grade-panel">
        <div className="stamp">
          <div className="stamp-score">{Math.round(result.overall_score)}</div>
          <div className="stamp-label">Overall</div>
        </div>

        <div className="bars">
          {bars.map((b) => (
            <div className="bar-row" key={b.name}>
              <div className="bar-name">{b.name}</div>
              <div className="bar-track">
                <div
                  className={`bar-fill ${scoreBarClass(b.value)}`}
                  style={{ width: `${b.value}%` }}
                />
              </div>
              <div className="bar-value">{Math.round(b.value)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="notes-grid">
        <div className="note-card">
          <p className="note-title strengths">✓ Strengths</p>
          <ul className="note-list strengths">
            {result.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="note-card">
          <p className="note-title weaknesses">✕ Weaknesses</p>
          <ul className="note-list weaknesses">
            {result.weaknesses.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="suggestions-card">
        {result.suggestions.map((s, i) => (
          <div className="suggestion-item" key={i}>
            <div className="suggestion-num">{i + 1}</div>
            <div className="suggestion-text">{formatSuggestion(s)}</div>
          </div>
        ))}
      </div>

      {result.missing_keywords && result.missing_keywords.length > 0 && (
        <div className="keywords-card">
          <p className="note-title" style={{ color: "var(--pencil)" }}>
            Missing from the job description
          </p>
          <div className="keyword-chips">
            {result.missing_keywords.map((k, i) => (
              <span className="keyword-chip" key={i}>
                {k}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
