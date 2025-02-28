import customAxios from "../utils/customAxios";
import { CheckdeviceResponseType } from "../types/APIServices/CheckdeviceService.type";

export const getAllData = async () => {
  try {
    const response = await customAxios.get<CheckdeviceResponseType>(
      "checkdevice/"
    );
    return response.data;
  } catch (error) {
    console.log("getCheckdeviceError: ", error);
  }
};
