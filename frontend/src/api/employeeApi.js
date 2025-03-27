import axiosInstance from "./axiosInstance";

export const getEmployees = async () => {
  const response = await axiosInstance.get("/employee");
  return response.data;
};

export const getEmployeeById = async (id) => {
  const response = await axiosInstance.get(`/employee/${id}`);
  return response.data;
};

export const createEmployee = async (data) => {
  const response = await axiosInstance.post("/employee", data);
  return response.data;
};

export const updateEmployee = async (id, data) => {
  const response = await axiosInstance.put(`/employee/${id}`, data);
  return response.data;
};

export const deleteEmployee = async (id) => {
  const response = await axiosInstance.delete(`/employee/${id}`);
  return response.data;
};


export const getEmployeesWithAttendance = async (id) => {
  const response = await axiosInstance.get(`/employee/attendance`);
  return response.data;
};

export const searchEmployees = async (name) => {
  const response = await axiosInstance.get(`/employee?name=${name}`);
  return response.data;
};
