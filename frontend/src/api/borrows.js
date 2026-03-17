import client from './client.js';

export const applyBorrow = (data) => client.post('/borrows', data);
export const getMyBorrows = () => client.get('/borrows/mine');
