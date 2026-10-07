import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';

    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
        window.location.href = '/login';
      }
    }

    return Promise.reject({
      status,
      message,
      data: error.response?.data,
    });
  }
);

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/users/me'),
};

// Resume APIs
export const resumeAPI = {
  uploadResume: (formData) => api.post('/resumes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getResumes: () => api.get('/resumes'),
  getResumeById: (id) => api.get(`/resumes/${id}`),
};

// Interview APIs
export const interviewAPI = {
  createInterview: (data) => api.post('/interviews', data),
  getUserInterviews: () => api.get('/interviews'),
  getInterviewById: (id) => api.get(`/interviews/${id}`),
  getInterviewResults: (id) => api.get(`/interviews/${id}/results`),
  completeInterview: (id) => api.post(`/interviews/${id}/complete`),
  getTranscript: (id) => api.get(`/interviews/${id}/transcript`),
};

// Answer APIs (Fallback / Direct submission)
export const answerAPI = {
  submitAnswer: (data) => api.post('/answers', data),
};

// Question Bank APIs
export const questionAPI = {
  getQuestions: (params) => api.get('/questions', { params }),
};

// Admin APIs
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getUsers: () => api.get('/admin/users'),
  getInterviews: () => api.get('/admin/interviews'),
  getQuestions: () => api.get('/admin/questions'),
};

export default api;
