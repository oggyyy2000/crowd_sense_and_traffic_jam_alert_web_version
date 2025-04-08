import customAxios from "../utils/customAxios";
import {
  getSettingWorkstationResponseType,
  postSettingWorkstationRequestDataType,
  postSettingWorkstationResponseType,
} from "../types/APIServices/SettingWorkstation.type";
import { RequestFormDataOptionsType } from "../types/global/Global.type";

export const getAllData = async () => {
  try {
    const response = await customAxios.get<getSettingWorkstationResponseType>(
      "settingworkstation/"
    );
    return response.data;
  } catch (error) {
    console.log("getSettingWorkstationError: ", error);
  }
};

export const postData = async ({
  data,
  options,
}: {
  data: postSettingWorkstationRequestDataType;
  options: RequestFormDataOptionsType;
}) => {
  try {
    const response = await customAxios.post<postSettingWorkstationResponseType>(
      "settingworkstation/",
      data,
      options
    );
    return response.data;
  } catch (error) {
    console.log("postSettingWorkstationError: ", error);
  }
};
