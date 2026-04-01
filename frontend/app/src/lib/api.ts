import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Attach access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const { data } = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
          localStorage.setItem("access_token", data.accessToken);
          localStorage.setItem("refresh_token", data.refreshToken);
          original.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(err);
  }
);

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }).then((r) => r.data),
  register: (email: string, password: string, name: string) =>
    api.post("/auth/register", { email, password, name }).then((r) => r.data),
  logout: (refreshToken: string) =>
    api.post("/auth/logout", { refreshToken }).then((r) => r.data),
  me: () => api.get("/auth/me").then((r) => r.data),
};

// Projects
export const projectsApi = {
  list: () => api.get("/projects").then((r) => r.data),
  get: (id: string) => api.get(`/projects/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/projects", data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/projects/${id}`, data).then((r) => r.data),
  addMember: (id: string, data: any) => api.post(`/projects/${id}/members`, data).then((r) => r.data),
  getMilestones: (id: string) => api.get(`/projects/${id}/milestones`).then((r) => r.data),
  createMilestone: (id: string, data: any) => api.post(`/projects/${id}/milestones`, data).then((r) => r.data),
  getRisks: (id: string) => api.get(`/projects/${id}/risks`).then((r) => r.data),
  createRisk: (id: string, data: any) => api.post(`/projects/${id}/risks`, data).then((r) => r.data),
  updateRisk: (id: string, riskId: string, data: any) =>
    api.patch(`/projects/${id}/risks/${riskId}`, data).then((r) => r.data),
};

// Tasks
export const tasksApi = {
  list: (projectId: string, filters?: any) =>
    api.get("/tasks", { params: { projectId, ...filters } }).then((r) => r.data),
  get: (id: string) => api.get(`/tasks/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/tasks", data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/tasks/${id}`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/tasks/${id}`).then((r) => r.data),
};

// Status Updates
export const statusApi = {
  list: (projectId: string, taskId?: string) =>
    api.get("/status-updates", { params: { projectId, taskId } }).then((r) => r.data),
  create: (data: any) => api.post("/status-updates", data).then((r) => r.data),
};

// Reports
export const reportsApi = {
  list: (projectId: string) =>
    api.get("/reports", { params: { projectId } }).then((r) => r.data),
  get: (id: string) => api.get(`/reports/${id}`).then((r) => r.data),
  create: (data: any) => api.post("/reports", data).then((r) => r.data),
  update: (id: string, data: any) => api.patch(`/reports/${id}`, data).then((r) => r.data),
  send: (id: string) => api.post(`/reports/${id}/send`).then((r) => r.data),
};

// Notifications
export const notificationsApi = {
  list: () => api.get("/notifications").then((r) => r.data),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => api.patch("/notifications/read-all").then((r) => r.data),
};
