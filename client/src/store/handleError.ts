import axios from "axios";

const handleError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response) {
    throw new Error(error.response.data.message);
  }
  throw new Error((error as Error).message);
};

export default handleError;
