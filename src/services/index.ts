import axios, { AxiosRequestConfig } from 'axios';

const TIME_OUT = 5000;

// 普通后端在9031端口
const BACK_BASE_URL = 'http://10.76.0.165:9031/';

const back_instance = axios.create({
  baseURL: BACK_BASE_URL,
  timeout: TIME_OUT
});

// 模型在9033端口
const MODEL_BASE_URL = 'http://10.76.0.165:9033/';

const model_instance = axios.create({
  baseURL: MODEL_BASE_URL,
  timeout: TIME_OUT
});

const httpRequest = {
  get(url: string, config?: AxiosRequestConfig, isback: boolean = true) {
    return new Promise<any>((resolve, reject) => {
      const instance = isback ? back_instance : model_instance;
      instance
        .get(url, config ?? {})
        .then((res) => resolve(res))
        .catch((err) => {
          reject(err);
        });
    });
  },
  post(url: string, data?: any, config?: AxiosRequestConfig, isback: boolean = true) {
    return new Promise<any>((resolve, reject) => {
      const instance = isback ? back_instance : model_instance;
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
