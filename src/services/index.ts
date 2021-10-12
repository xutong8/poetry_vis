import axios, { AxiosRequestConfig } from 'axios';

const BASE_URL = 'http://10.76.0.165:9031/';

const TIME_OUT = 5000;

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: TIME_OUT
});

const httpRequest = {
  get(url: string, config?: AxiosRequestConfig) {
    return new Promise<any>((resolve, reject) => {
      instance
        .get(url, config ?? {})
        .then((res) => resolve(res))
        .catch((err) => {
          reject(err);
        });
    });
  },
  post(url: string, data?: any, config?: AxiosRequestConfig) {
    return new Promise<any>((resolve, reject) => {
      instance
        .post(url, data, config ?? {})
        .then((res) => resolve(res))
        .catch((err) => {
          reject(err);
        });
    });
  }
};

export { httpRequest };
