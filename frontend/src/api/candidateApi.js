import axiosInstance from "./axiosInstance";

export const getCandidates = async () => {
  const response = await axiosInstance.get("/candidate");
  return response.data;
};

export const getCandidateById = async (id) => {
  const response = await axiosInstance.get(`/candidate/${id}`);
  return response.data;
};

export const createCandidate = async (data) => {
  const response = await axiosInstance.post("/candidate", data);
  return response.data;
};

export const updateCandidate = async (id, data) => {
  const response = await axiosInstance.put(`/candidate/${id}`, data);
  return response.data;
};

export const deleteCandidate = async (id) => {
  const response = await axiosInstance.delete(`/candidate/${id}`);
  return response.data;
};

export const changeCandidateStatus = async (id, status) => {
  const response = await axiosInstance.put(`/candidate/${id}/status`, { status });
  return response.data;
};
