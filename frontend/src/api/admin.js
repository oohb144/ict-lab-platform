import client from "./client.js";

export const getSiteContent = () => client.get("/site-content");

// 用户管理
export const getUsers = (search) =>
  client.get("/admin/users", { params: { search } });
export const approveUser = (id) => client.patch(`/admin/users/${id}/approve`);
export const addUser = (data) => client.post("/admin/users", data);
export const deleteUser = (id) => client.delete(`/admin/users/${id}`);
export const setUserRole = (id, role) =>
  client.patch(`/admin/users/${id}/set-role`, { role });

// 器材管理
export const addEquipment = (data) => client.post("/admin/equipment", data);
export const updateEquipment = (id, data) =>
  client.put(`/admin/equipment/${id}`, data);
export const deleteEquipment = (id) => client.delete(`/admin/equipment/${id}`);

// 借阅管理
export const getBorrows = () => client.get("/admin/borrows");
export const updateBorrow = (id, data) =>
  client.patch(`/admin/borrows/${id}`, data);
export const deleteBorrow = (id) => client.delete(`/admin/borrows/${id}`);

// 站点内容（含工位配置）
export const updateSiteContent = (data) =>
  client.put("/admin/site-content", data);

// 资料管理
export const deleteResource = (id) => client.delete(`/admin/resources/${id}`);

// 通知管理
export const getAllNotifications = () => client.get("/notifications/all");
export const createNotification = (data) => client.post("/notifications", data);
export const updateNotification = (id, data) =>
  client.put(`/notifications/${id}`, data);
export const deleteNotification = (id) => client.delete(`/notifications/${id}`);

// 打卡
export const getTodayCheckins = () => client.get("/checkins/today");
export const doCheckIn = () => client.post("/checkins");

// 公开通知（首页用）
export const getActiveNotifications = () => client.get("/notifications");
