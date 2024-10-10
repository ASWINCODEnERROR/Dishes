import axios from "axios";
import { BaseUrl } from "./BaseUrls";

export const ApiCall = async (method, endPoint, data = {}, params = {}, is_formdata = false) => {
  const headers = {
    "Content-Type": is_formdata ? "multipart/form-data" : "application/json",
  };

  const url = `${BaseUrl}${endPoint}`;

  try {
    const res = await axios({
      method,
      url,
      params,
      data,
      headers,
    });
    return { status: true, data: res.data };
  } catch (error) {
    console.log(error);
    if (!error.response) {
      return {
        status: false,
        message: "Network Error or File is too large",
      };
    }
    return {
      status: false,
      message: error.response.data?.message || "Something went wrong",
    };
  }
};

