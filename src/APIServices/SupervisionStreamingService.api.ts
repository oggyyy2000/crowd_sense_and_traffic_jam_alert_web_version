import customAxios from "../utils/customAxios";
import {
  RequestOptionsType,
  postRequestSupervisionStreamingServiceDataType,
  postResponseSupervisionStreamingServiceDataType,
} from "../types/APIServices/SupervisionStreamingService.type";

export const postData = async ({
  data,
  options,
}: {
  data: postRequestSupervisionStreamingServiceDataType;
  options: RequestOptionsType;
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
