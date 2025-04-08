import customAxios from "../utils/customAxios";
import { getMonitoringOptionResponseType } from "../types/APIServices/MonitoringOption.type";

export const getAllData = async () => {
  try {
    const response = await customAxios.get<getMonitoringOptionResponseType[]>(
      "monitoringoption/"
    );
    return response.data;
  } catch (error) {
    console.log("getMonitoringOptionError: ", error);
  }
};
