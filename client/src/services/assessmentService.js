import api from "../api";

export async function getAssessments() {
  const res = await api.get("/assessment");
  return res.data;
}

export async function createAssessment(data) {
  const res = await api.post("/assessment", data);
  return res.data;
}

export async function updateAssessment(id, data) {
  const res = await api.put(`/assessment/${id}`, data);
  return res.data;
}

export async function deleteAssessment(id) {
  const res = await api.delete(`/assessment/${id}`);
  return res.data;
}