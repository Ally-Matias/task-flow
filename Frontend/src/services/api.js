import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://192.168.0.6:5000',
  headers: { 'Content-Type': 'application/json' },
});