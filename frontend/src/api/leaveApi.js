import axiosInstance from "./axiosInstance";

export const getLeaves = async (date=null) => {
  const response = await axiosInstance.get("/leave?date="+date);
  return response.data;
};

export const getLeaveById = async (id) => {
  const response = await axiosInstance.get(`/leave/${id}`);
  return response.data;
};

export const createLeave = async (data) => {
  const response = await axiosInstance.post("/leave", data);
  return response.data;
};

export const updateLeave = async (id, data) => {
  const response = await axiosInstance.put(`/leave/${id}`, data);
  return response.data;
};

export const deleteLeave = async (id) => {
  const response = await axiosInstance.delete(`/leave/${id}`);
  return response.data;
};

export const updateLeaveStatus = async(id,status)=>{
  const response = await axiosInstance.put(`/leave/updateStatus/${id}`,{status:status});
  return response.data;
}