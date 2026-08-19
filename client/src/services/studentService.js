import api from "../api";

export async function getStudents() {
  const res = await api.get("/students");
  return res.data;
}