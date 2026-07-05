import { create } from 'zustand';
import { getToken, deleteToken, saveToken } from '../../../shared/auth/tokenService';
import { decodeJwt } from '../../../shared/auth/jwtDecoder';
import { postRequest, type ApiError } from '../../../shared/api/apiClient';

interface LoginResponse {
  token?: string;
  Token?: string;
}

interface AuthState {
  token: string | null;
  user: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  initializing: boolean;
  initializeSession: () => Promise<void>;
  login: (identifier: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useWebAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,
  initializing: true,

  initializeSession: async () => {
    try {
      const cachedToken = await getToken();
      if (cachedToken) {
        const decoded = decodeJwt(cachedToken);
        if (decoded) {
          set({ token: cachedToken, user: decoded });
        } else {
          await deleteToken();
          set({ token: null, user: null });
        }
      }
    } catch {
      await deleteToken();
      set({ token: null, user: null });
    } finally {
      set({ initializing: false });
    }
  },

  login: async (identifier: string, pin: string) => {
    set({ loading: true, error: null });
    try {
      const response = await postRequest<{ Identifier: string; Password: string }, LoginResponse>(
        '/api/authentication/login',
        {
          Identifier: identifier,
          Password: pin,
        }
      );
      const tokenVal = response?.token || response?.Token;
      if (!tokenVal) {
        throw new Error('Authentication response did not contain a valid session token.');
      }
      await saveToken(tokenVal);
      const decoded = decodeJwt(tokenVal);
      set({ token: tokenVal, user: decoded, loading: false });
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      let errorMessage = 'Error al iniciar sesión. Verifique sus credenciales.';
      if (apiErr.errors) {
        const firstErrorKey = Object.keys(apiErr.errors)[0];
        const messages = apiErr.errors[firstErrorKey];
        errorMessage = messages && messages.length > 0 ? messages[0] : apiErr.message;
      } else if (apiErr.message) {
        errorMessage = apiErr.message;
      }
      set({ error: errorMessage, loading: false });
      throw err;
    }
  },

  logout: async () => {
    await deleteToken();
    set({ token: null, user: null, error: null });
  },
}));
