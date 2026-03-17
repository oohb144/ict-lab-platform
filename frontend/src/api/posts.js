import client from './client.js';

export const getPosts = () => client.get('/posts');
export const createPost = (data) => client.post('/posts', data);
export const replyPost = (id, data) => client.post(`/posts/${id}/replies`, data);
export const deletePost = (id) => client.delete(`/posts/${id}`);
