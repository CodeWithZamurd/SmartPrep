import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const baseURL =
  (Constants.expoConfig && Constants.expoConfig.extra && Constants.expoConfig.extra.apiBaseUrl) ||
  'http://10.0.2.2:4000';

export const api = axios.create({ baseURL, timeout: 60000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function setToken(token) {
  if (token) await SecureStore.setItemAsync('token', token);
  else await SecureStore.deleteItemAsync('token');
}

export async function getToken() {
  return SecureStore.getItemAsync('token');
}
