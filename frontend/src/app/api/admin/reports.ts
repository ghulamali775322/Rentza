import api from "@/app/api/axios";

export const getReports = (status?: string, search?: string) => {
  const params: any = {};
  if (status) params.status = status;
  if (search) params.search = search;

  return api.get("/api/admin/reports", { params });
};

export const getReportDetails = (id: string) => {
  return api.get(`/api/admin/reports/${id}`);
};

export const updateReportStatus = (id: string, status: string) => {
  return api.put(`/api/admin/reports/${id}/status`, { status });
};

export const executeReportAction = (id: string, actionType: string) => {
  return api.post(`/api/admin/reports/${id}/action`, { actionType });
};

export const deleteReport = (id: string) => {
  return api.delete(`/api/admin/reports/${id}`);
};
