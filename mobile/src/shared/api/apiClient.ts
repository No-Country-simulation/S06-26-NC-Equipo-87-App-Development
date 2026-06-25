import { Platform } from 'react-native';
import { getToken } from '../auth/tokenService';

const getBaseUrl = (): string => {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (!url || url === 'undefined') {
    return Platform.OS === 'android' ? 'http://10.0.2.2:8080' : 'http://localhost:8080';
  }
  return url;
};

export const API_BASE_URL = getBaseUrl();

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

export const postRequest = async <T, R>(path: string, body: T): Promise<R> => {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  const authToken = await getToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      const json = await response.json();
      errorData = {
        message: json.detail || json.title || 'An error occurred during request execution.',
        errors: json.errors,
      };
    } catch {
      errorData = { message: `Request failed with status ${response.status}` };
    }
    throw errorData;
  }

  return await response.json() as R;
};

export const getRequest = async <R>(path: string): Promise<R> => {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  const authToken = await getToken();
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    let errorData: ApiError;
    try {
      const json = await response.json();
      errorData = {
        message: json.detail || json.title || 'An error occurred during request execution.',
        errors: json.errors,
      };
    } catch {
      errorData = { message: `Request failed with status ${response.status}` };
    }
    throw errorData;
  }

  return await response.json() as R;
};
