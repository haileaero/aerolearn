import api from "../api";

// ==========================
// Get All Announcements
// ==========================
export async function getAnnouncements() {
  const res = await api.get(
    "/announcements"
  );

  return res.data;
}

// ==========================
// Create Announcement
// ==========================
export async function createAnnouncement(
  data
) {
  const res = await api.post(
    "/announcements",
    data
  );

  return res.data;
}

// ==========================
// Update Announcement
// ==========================
export async function updateAnnouncement(
  id,
  data
) {
  const res = await api.put(
    `/announcements/${id}`,
    data
  );

  return res.data;
}

// ==========================
// Delete Announcement
// ==========================
export async function deleteAnnouncement(
  id
) {
  const res = await api.delete(
    `/announcements/${id}`
  );

  return res.data;
}