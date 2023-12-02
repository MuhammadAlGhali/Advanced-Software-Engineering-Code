import axios from "axios";

export default (function API() {
  axios.defaults.baseURL = "https://6c6d-141-215-221-252.ngrok.io/api";
  axios.defaults.withCredentials = true;
  return axios;
})();
