const TOKEN_KEY = 'auth_token';

export const saveToken = async (token: string): Promise<void> => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return localStorage.getItem(TOKEN_KEY);
};

export const deleteToken = async (): Promise<void> => {
  localStorage.removeItem(TOKEN_KEY);
};
