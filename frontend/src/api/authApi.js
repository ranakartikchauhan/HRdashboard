import axiosInstance from "./axiosInstance";
export const login = async (data) => {
  const response = await axiosInstance.post("/user/login", data);
  return response.data;
};


export const register = async (data) => {
  const response = await axiosInstance.post("/user/signup", data);
  return response.data;
};

export const logout = async (data) => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
   document.cookie = "authToken="
};
