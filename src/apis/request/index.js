import axios from 'axios';
import { useUserIntercetorsConfig } from './tools';

const userRequestInterceptorsConfig = useUserIntercetorsConfig({
  request: {
    enable: true,
    validToken: true,
  },
  response: {
    enable: true,
    autoDeconstructionData: true,
  },
});

export const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_PATH,
  timeout: 10000,
  headers: {
    common: {
      'Content-Type': 'application/json',
      token: '',
    },
  },
  userRequestInterceptorsConfig,
});
