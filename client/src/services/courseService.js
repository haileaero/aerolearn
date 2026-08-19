import api from "../api";

export async function getCourses() {
  const res = await api.get("/courses");

  // Backend returns:
  // {
  //   courses: [...],
  //   pagination: {...}
  // }

  return res.data.courses || [];
}