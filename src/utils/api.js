
export const API_BASE_URL = 'http://localhost:8000/api';

const extractErrorMessage = async (response) => {
    const errorData = await response.json().catch(() => ({}));

    if (!errorData) {
        return `API Error: ${response.status}`;
    }

    if (typeof errorData === 'string') {
        return errorData;
    }

    if (Array.isArray(errorData)) {
        return errorData[0] || `API Error: ${response.status}`;
    }

    if (errorData.detail) {
        return errorData.detail;
    }

    const firstKey = Object.keys(errorData)[0];
    if (firstKey) {
        const firstValue = errorData[firstKey];
        if (Array.isArray(firstValue)) {
            return firstValue[0];
        }
        if (typeof firstValue === 'string') {
            return firstValue;
        }
    }

    return `API Error: ${response.status}`;
};

export const getAuthHeaders = () => {
    const token = localStorage.getItem('garage_token');
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    return headers;
};

export const getPublicHeaders = () => ({
    'Content-Type': 'application/json',
});

const resolveHeaders = (useAuth = true) => (useAuth ? getAuthHeaders() : getPublicHeaders());

const requestJson = async (endpoint, options = {}, useAuth = true) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: resolveHeaders(useAuth),
        ...options,
    });

    if (!response.ok) {
        throw new Error(await extractErrorMessage(response));
    }

    return response.status === 204 ? null : response.json();
};

export const api = {
    get: async (endpoint, options = {}) => {
        return requestJson(endpoint, { method: 'GET' }, options.auth !== false);
    },
    post: async (endpoint, data, options = {}) => {
        return requestJson(
            endpoint,
            {
                method: 'POST',
                body: JSON.stringify(data),
            },
            options.auth !== false,
        );
    },
    put: async (endpoint, data, options = {}) => {
        return requestJson(
            endpoint,
            {
                method: 'PUT',
                body: JSON.stringify(data),
            },
            options.auth !== false,
        );
    },
    delete: async (endpoint, options = {}) => {
        return requestJson(
            endpoint,
            {
                method: 'DELETE',
            },
            options.auth !== false,
        );
    }
};
