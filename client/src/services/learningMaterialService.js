import api from "../api";

export const getLearningMaterials = async () => {
  const response = await api.get("/learning-materials");
  return response.data;
};

export const getLearningMaterial = async (id) => {
  const response = await api.get(`/learning-materials/${id}`);
  return response.data;
};

export const createLearningMaterial = async (formData) => {
  const response = await api.post(
    "/learning-materials",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const updateLearningMaterial = async (
  id,
  formData
) => {
  const response = await api.put(
    `/learning-materials/${id}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

export const deleteLearningMaterial = async (
  id
) => {
  const response = await api.delete(
    `/learning-materials/${id}`
  );

  return response.data;
};