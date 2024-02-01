import axios from 'axios';

export const request = axios.create({
  baseURL: import.meta.env.BASE_URL,
});
