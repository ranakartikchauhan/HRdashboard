import axiosInstance from "./axiosInstance";

export const getAttendances = async () => {
  const response = await axiosInstance.get("/attendance");
  return response.data;
};

export const getAttendanceById = async (id) => {
  const response = await axiosInstance.get(`/attendance/${id}`);
  return response.data;
};

export const createAttendance = async (data) => {
  const response = await axiosInstance.post("/attendance", data);
  return response.data;
};

export const updateAttendance = async (id, data) => {
  const response = await axiosInstance.put(`/attendance/${id}`, data);
  return response.data;
};

export const deleteAttendance = async (id) => {
  const response = await axiosInstance.delete(`/attendance/${id}`);
  return response.data;
};


export const TaskAndAttendance = async (data) => {
  const response = await axiosInstance.put("/attendance/update", data);
  return response.data;
};


