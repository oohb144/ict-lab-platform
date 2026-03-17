import client from './client.js';

export const getEquipment = (search) => client.get('/equipment', { params: { search } });
