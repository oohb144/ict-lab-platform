import client from './client';

export const getArticles = (params) => client.get('/articles', { params });
export const getArticle = (id) => client.get(`/articles/${id}`);
export const createArticle = (data) => client.post('/articles', data);
export const updateArticle = (id, data) => client.put(`/articles/${id}`, data);
export const deleteArticle = (id) => client.delete(`/articles/${id}`);
export const getArchive = () => client.get('/articles/archive');
