const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  getAccessToken() {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('accessToken');
    }
    return null;
  }

  setAccessToken(token) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  clearAccessToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getAccessToken();

    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    if (config.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const response = await fetch(url, config);

    if (response.status === 401) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.getAccessToken()}`;
        const retryResponse = await fetch(url, config);
        return this.handleResponse(retryResponse);
      }
    }

    return this.handleResponse(response);
  }

  async handleResponse(response) {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(data?.error || 'An error occurred');
    }

    return data;
  }

  async refreshToken() {
    try {
      const response = await fetch(`${this.baseUrl}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        this.setAccessToken(data.accessToken);
        return true;
      }
    } catch (error) {
      console.error('Refresh token failed:', error);
    }
    return false;
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'POST', body });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: 'PUT', body });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }

  async uploadFile(endpoint, file, additionalData = {}) {
    const formData = new FormData();
    formData.append('proof', file);

    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const token = this.getAccessToken();
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    return this.handleResponse(response);
  }
}

const api = new ApiClient();
export default api;

export const authAPI = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  logout: () => api.post('/api/auth/logout'),
  me: () => api.get('/api/auth/me')
};

export const userAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  updateProfile: (data) => api.put('/api/users/profile', data),
  updateWallet: (data) => api.put('/api/users/wallet', data)
};

export const orderAPI = {
  create: (data) => api.post('/api/orders', data),
  getMyOrders: () => api.get('/api/orders'),
  getById: (id) => api.get(`/api/orders/${id}`),
  uploadProof: (id, file) => api.uploadFile(`/api/orders/${id}/proof`, file),
  getAll: (params) => api.get('/api/orders/admin/all', { params }),
  approve: (id, data) => api.put(`/api/orders/${id}/approve`, data),
  reject: (id, data) => api.put(`/api/orders/${id}/reject`, data)
};

export const rateAPI = {
  get: () => api.get('/api/rate'),
  update: (data) => api.put('/api/rate', data)
};

export const transactionAPI = {
  getAll: (params) => api.get('/api/transactions', { params })
};
