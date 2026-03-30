import api from "@/app/api/axios";

export const getListingsGrowth = () => {
  return api.get("/api/admin/analytics/listings-growth");
};

export const getUsersGrowth = () => {
  return api.get("/api/admin/analytics/users-growth");
};
