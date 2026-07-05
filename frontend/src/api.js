const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function analyzeResume(file, jobDescription) {
  const formData = new FormData();
  formData.append("file", file);
  if (jobDescription && jobDescription.trim()) {
    formData.append("job_description", jobDescription.trim());
  }

  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed with status ${res.status}`);
  }

  return res.json();
}

export async function getHistory() {
  const res = await fetch(`${API_URL}/history`);
  if (!res.ok) throw new Error("Could not load history");
  return res.json();
}

export async function getResumeAnalyses(resumeId) {
  const res = await fetch(`${API_URL}/resume/${resumeId}/analyses`);
  if (!res.ok) throw new Error("Could not load analyses");
  return res.json();
}
