
import axios from 'axios';
import { ProjectPayload } from '../types';

const api = axios.create({
  baseURL: '/api', // Use proxy defined in main app's vite.config.ts
});

export const saveProject = async (payload: ProjectPayload, token: string) => {
  try {
    const response = await api.post('/projects/', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
        // Provide more specific error message from backend if available
        const errorMessage = error.response?.data?.detail || error.message;
        throw new Error(errorMessage);
    }
    throw new Error('An unexpected error occurred while saving the project.');
  }
};
