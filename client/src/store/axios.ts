import axi from "axios";

const axios = axi.create({
  baseURL:
    // "https://relievingly-noncongratulatory-micheline.ngrok-free.dev/api/v1",
    "http://localhost:5000/api/v1",
  withCredentials: true,
});

export default axios;
