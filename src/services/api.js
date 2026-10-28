const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:6000/api';

function getToken() {
  return localStorage.getItem('novabill_token');
}

function setToken(token) {
  if (token) {
    localStorage.setItem('novabill_token', token);
  } else {
    localStorage.removeItem('novabill_token');
  }
}

function getUser() {
  const u = localStorage.getItem('novabill_user');
  try {
    return u ? JSON.parse(u) : null;
  } catch (e) {
    return null;
  }
}

function setUser(user) {
  if (user) {
    localStorage.setItem('novabill_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('novabill_user');
  }
}

function clearAuth() {
  localStorage.removeItem('novabill_token');
  localStorage.removeItem('novabill_user');
}

function getHeaders(customHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...customHeaders,
  };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      clearAuth();
    }
    const error = new Error(data.error || 'API request failed');
    error.status = res.status;
    error.data = data;
    throw error;
  }
  return data;
}

export const api = {
  getToken,
  setToken,
  getUser,
  setUser,
  clearAuth,

  // Auth
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await handleResponse(res);
    if (data.token) {
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  },

  async getCurrentUser() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(),
    });
    const data = await handleResponse(res);
    if (data.user) {
      setUser(data.user);
    }
    return data;
  },

  async logout() {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getHeaders(),
      });
    } catch (e) {
      // ignore network errors on logout
    } finally {
      clearAuth();
    }
  },

  // Categories
  async getCategories() {
    const res = await fetch(`${API_BASE}/categories`, { headers: getHeaders() });
    return handleResponse(res);
  },
  async getCategory(id) {
    const res = await fetch(`${API_BASE}/categories/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  async createCategory(payload) {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async updateCategory(id, payload) {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async deleteCategory(id, force = false) {
    const res = await fetch(`${API_BASE}/categories/${id}${force ? '?force=true' : ''}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Products
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.categoryId) query.append('categoryId', params.categoryId);
    if (params.isActive !== undefined) query.append('isActive', params.isActive);
    if (params.lowStock) query.append('lowStock', params.lowStock);

    const res = await fetch(`${API_BASE}/products?${query.toString()}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  async getProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  async createProduct(payload) {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async updateProduct(id, payload) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async deleteProduct(id) {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },
  async adjustProductStock(id, delta) {
    const res = await fetch(`${API_BASE}/products/${id}/stock`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ delta }),
    });
    return handleResponse(res);
  },

  // Bills / Invoices
  async getBills(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.paymentStatus) query.append('paymentStatus', params.paymentStatus);
    if (params.fromDate) query.append('fromDate', params.fromDate);
    if (params.toDate) query.append('toDate', params.toDate);

    const res = await fetch(`${API_BASE}/bills?${query.toString()}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  async getBill(id) {
    const res = await fetch(`${API_BASE}/bills/${id}`, { headers: getHeaders() });
    return handleResponse(res);
  },
  async getNextBillNumber() {
    const res = await fetch(`${API_BASE}/bills/generate-number`, { headers: getHeaders() });
    return handleResponse(res);
  },
  async createBill(payload) {
    const res = await fetch(`${API_BASE}/bills`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },
  async deleteBill(id) {
    const res = await fetch(`${API_BASE}/bills/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // Settings
  async getSettings() {
    const res = await fetch(`${API_BASE}/settings`, { headers: getHeaders() });
    return handleResponse(res);
  },
  async updateSettings(payload) {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse(res);
  },

  // Dashboard Stats
  async getDashboardStats() {
    const res = await fetch(`${API_BASE}/dashboard/stats`, { headers: getHeaders() });
    return handleResponse(res);
  },
};
