export default function HistoryScreen({ history, loading }) {
  if (loading) {
    return <p className="empty-note">Loading history…</p>;
  }

  if (!history.length) {
    return <p className="empty-note">No resumes graded yet. Upload one to get started.</p>;
  }

  return (
    <div className="history-list">
      {history.map((item) => (
        <div className="history-item" key={item.id}>
          <span className="history-name">{item.filename}</span>
          <span className="history-date">
            {new Date(item.uploaded_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      ))}
    </div>
  );
}
