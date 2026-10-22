
const API_BASE = (
  import.meta.env.VITE_API_BASE_URL || '/api'
).replace(/\/+$/, '');

export async function request(endpoint, options = {}) {
  const normalizedEndpoint = endpoint.startsWith('/')
    ? endpoint
    : `/${endpoint}`;

  const url = `${API_BASE}${normalizedEndpoint}`;
  const token = localStorage.getItem('smartspend_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers,
    credentials: 'include'
  };

  if (
    options.body &&
    typeof options.body === 'object' &&
    !(options.body instanceof FormData)
  ) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(
        data.message || `Request failed with status ${response.status}`
      );

      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (!error.status && error.name === 'TypeError') {
      error.message =
        'Unable to connect to SmartSpend server. Please check your internet connection and backend deployment.';
    }

    throw error;
  }
}

// Auth API
export const authApi = {
  login: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: credentials
    }),

  register: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: userData
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST'
    }),

  getMe: () => request('/auth/me')
};

// Transactions API
export const transactionsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/transactions${query ? `?${query}` : ''}`);
  },

  getById: (id) => request(`/transactions/${id}`),

  create: (data) =>
    request('/transactions', {
      method: 'POST',
      body: data
    }),

  update: (id, data) =>
    request(`/transactions/${id}`, {
      method: 'PATCH',
      body: data
    }),

  delete: (id) =>
    request(`/transactions/${id}`, {
      method: 'DELETE'
    })
};

// Budgets API
export const budgetsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/budgets${query ? `?${query}` : ''}`);
  },

  create: (data) =>
    request('/budgets', {
      method: 'POST',
      body: data
    }),

  update: (id, data) =>
    request(`/budgets/${id}`, {
      method: 'PATCH',
      body: data
    }),

  delete: (id) =>
    request(`/budgets/${id}`, {
      method: 'DELETE'
    })
};

// Dashboard API
export const dashboardApi = {
  getSummary: () => request('/dashboard/summary'),

  getCharts: () => request('/dashboard/charts')
};

// Reports API
export const reportsApi = {
  getMonthly: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/monthly${query ? `?${query}` : ''}`);
  },

  getCategories: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/reports/categories${query ? `?${query}` : ''}`);
  }
};

// Profile API
export const profileApi = {
  get: () => request('/profile'),

  update: (data) =>
    request('/profile', {
      method: 'PATCH',
      body: data
    }),

  changePassword: (data) =>
    request('/profile/change-password', {
      method: 'POST',
      body: data
    })
};

// Config API
export const configApi = {
  getClientSettings: () => request('/config/client-settings')
};
