import customAxios from "../utils/customAxios";
import { CheckThreadCamHdmiResponseType } from "../types/APIServices/CheckThreadCamHdmiService.type";

export const getAllData = async () => {
  try {
    const response = await customAxios.get<CheckThreadCamHdmiResponseType>(
      "checkthreadcamhdmi/"
    );
    return response.data;
  } catch (error) {
    console.log("getCheckdeviceError: ", error);
  }
};
