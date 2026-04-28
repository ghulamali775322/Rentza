import api from "@/app/api/axios";

export const getUsers = (isActive?: boolean, search?: string) => {
  const params: any = {};
  if (isActive !== undefined) params.isActive = isActive;
  if (search) params.search = search;

  return api.get("/api/admin/users", { params });
};

export const getUserDetails = (id: string) => {
  return api.get(`/api/admin/users/${id}`);
};

export const getUserListings = (id: string) => {
  return api.get(`/api/admin/users/${id}/listings`);
};

export const updateUserStatus = (id: string, isActive: boolean) => {
  return api.put(`/api/admin/users/${id}/status`, { isActive });
};

export const deleteUser = (id: string) => {
  return api.delete(`/api/admin/users/${id}`);
};

// src/app/api/admin/users.ts
export const getUsersStats = () => {
  return api.get("/api/admin/dashboard-stats");
};
