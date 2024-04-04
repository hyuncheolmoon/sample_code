import axios from "axios";
// import utils from "~/utils/utils";
// import cms from "~/utils/cms";

const setupAxiosInterceptors = () => {
  try {
    const onRequestSuccess = (config) => {
      return config;
    };
    const onResponseSuccess = (response) => {
      return Promise.resolve(response);
    };

    const onResponseError = (error) => {
      return Promise.reject(error);
    };

    axios.interceptors.request.use(onRequestSuccess);
    axios.interceptors.response.use(onResponseSuccess, onResponseError);
  } catch (err) {
    console.error(err);
  }
};

export default setupAxiosInterceptors;
