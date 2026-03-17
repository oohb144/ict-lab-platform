import client from './client.js';

export const getResources = () => client.get('/resources');
export const createResource = (data) => client.post('/resources', data);
export const uploadFile = (formData) => client.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

// 生成通过后端代理访问文件的 URL（解决 Gitee raw 链接被 iframe 拦截）
export const getProxyUrl = (url) => {
  const base = import.meta.env.VITE_API_URL || '/api';
  return `${base}/upload/proxy?url=${encodeURIComponent(url)}`;
};
