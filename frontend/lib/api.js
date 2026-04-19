const API_BASE_URL = 'https://newproject-production-452c.up.railway.app/api';

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.refreshInProgress = false;
    this.refreshPromise = null;
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
    if (this.refreshInProgress) {
      return this.refreshPromise;
    }

    this.refreshInProgress = true;

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
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
    } finally {
      this.refreshInProgress = false;
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
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me')
};

export const userAPI = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  updateProfile: (data) => api.put('/users/profile', data),
  updateWallet: (data) => api.put('/users/wallet', data),
  updateRole: (id, data) => api.put(`/users/${id}/role`, data)
};

export const orderAPI = {
  create: (data) => api.post('/orders', data),
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  uploadProof: (id, file) => api.uploadFile(`/orders/${id}/proof`, file),
  getAll: (params) => api.get('/orders/admin/all', { params }),
  approve: (id, data) => api.put(`/orders/${id}/approve`, data),
  reject: (id, data) => api.put(`/orders/${id}/reject`, data),
  updateTxid: (id, txid) => api.put(`/orders/${id}/txid`, { txid })
};

export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};

export const rateAPI = {
  get: () => api.get('/rate'),
  update: (data) => api.put('/rate', data)
};

export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params })
};

export const currencyAPI = {
  getAll: () => api.get('/currencies'),
  get: (code) => api.get(`/currencies/${code}`),
  update: (code, data) => api.put(`/currencies/${code}`, data)
};
