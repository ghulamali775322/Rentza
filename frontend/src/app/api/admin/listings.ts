import api from "@/app/api/axios";

export const getListings = (status?: string, search?: string) => {
  const params: any = {};
  if (status) params.status = status;
  if (search) params.search = search;

  return api.get("/api/admin/listings", { params });
};

export const getListingDetails = (id: string) => {
  return api.get(`/api/admin/listings/${id}`);
};

export const updateListingStatus = (id: string, status: string) => {
  return api.put(`/api/admin/listings/${id}/status`, { status });
};

export const updateListing = (id: string, data: any) => {
  return api.put(`/api/admin/listings/${id}`, data);
};

export const deleteListing = (id: string) => {
  return api.delete(`/api/admin/listings/${id}`);
};
