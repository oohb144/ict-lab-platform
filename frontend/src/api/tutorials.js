import client from './client.js';

export const getTutorials = () => client.get('/tutorials');
export const getTutorial = (id) => client.get(`/tutorials/${id}`);
export const createTutorial = (data) => client.post('/tutorials', data);
export const deleteTutorial = (id) => client.delete(`/tutorials/${id}`);
