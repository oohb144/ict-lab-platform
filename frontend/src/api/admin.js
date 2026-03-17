import client from './client.js';

export const getSiteContent = () => client.get('/site-content');

// 管理员接口
export const getUsers = (search) => client.get('/admin/users', { params: { search } });
export const approveUser = (id) => client.patch(`/admin/users/${id}/approve`);
export const addUser = (data) => client.post('/admin/users', data);
export const deleteUser = (id) => client.delete(`/admin/users/${id}`);

export const addEquipment = (data) => client.post('/admin/equipment', data);
export const updateEquipment = (id, data) => client.put(`/admin/equipment/${id}`, data);
export const deleteEquipment = (id) => client.delete(`/admin/equipment/${id}`);

export const getBorrows = () => client.get('/admin/borrows');
export const updateBorrow = (id, data) => client.patch(`/admin/borrows/${id}`, data);
export const deleteBorrow = (id) => client.delete(`/admin/borrows/${id}`);

export const updateSiteContent = (data) => client.put('/admin/site-content', data);

export const deleteResource = (id) => client.delete(`/admin/resources/${id}`);
