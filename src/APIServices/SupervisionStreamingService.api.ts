import customAxios from "../utils/customAxios";
import {
  postRequestSupervisionStreamingServiceDataType,
  postResponseSupervisionStreamingServiceDataType,
} from "../types/APIServices/SupervisionStreamingService.type";
import { RequestFormDataOptionsType } from "../types/global/Global.type";

export const postData = async ({
  data,
  options,
}: {
  data: postRequestSupervisionStreamingServiceDataType;
  options: RequestFormDataOptionsType;
}) => {
  try {
    const response =
      await customAxios.post<postResponseSupervisionStreamingServiceDataType>(
        "supervisionstreaming/",
        data,
        options
      );
    return response.data;
  } catch (error) {
    console.error("ConfirmedDataFromWSError: ", error);
  }
};
