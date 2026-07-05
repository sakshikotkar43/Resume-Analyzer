import { useState } from "react";
import UploadScreen from "./components/UploadScreen.jsx";
import LoadingScreen from "./components/LoadingScreen.jsx";
import ResultsScreen from "./components/ResultsScreen.jsx";
import HistoryScreen from "./components/HistoryScreen.jsx";
import { analyzeResume, getHistory } from "./api.js";

export default function App() {
  const [view, setView] = useState("upload"); // upload | loading | results | history
  const [result, setResult] = useState(null);
  const [filename, setFilename] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  async function handleAnalyze(file, jobDescription) {
    setError("");
    setView("loading");
    try {
      const data = await analyzeResume(file, jobDescription);
      setResult(data);
      setFilename(file.name);
      setView("results");
    } catch (e) {
      setError(e.message || "Something went wrong. Try again.");
      setView("upload");
    }
  }

  async function openHistory() {
    setView("history");
    setHistoryLoading(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }

  function goToUpload() {
    setResult(null);
    setError("");
    setView("upload");
  }

  return (
    <div className="app">
      <div className="topbar">
        <div className="brand">
          resume<span>grader</span>
        </div>
        <div className="topbar-actions">
          <button className="link-button" onClick={goToUpload}>
            New
          </button>
          <button className="link-button" onClick={openHistory}>
            History
          </button>
        </div>
      </div>

      {view === "upload" && (
        <UploadScreen onAnalyze={handleAnalyze} loading={false} error={error} />
      )}
      {view === "loading" && <LoadingScreen />}
      {view === "results" && result && (
        <ResultsScreen result={result} filename={filename} onNewUpload={goToUpload} />
      )}
      {view === "history" && (
        <HistoryScreen history={history} loading={historyLoading} />
      )}
    </div>
  );
}
