import customAxios from "../utils/customAxios";
import { SupervisionSchedulesResponseType } from "../types/APIServices/SupervisionSchedulesService.type";

export const getAllData = async (scheduleId?: number | null) => {
  try {
    const response = await customAxios.get<SupervisionSchedulesResponseType[]>(
      "supervisionschedules/?schedule_id=" + scheduleId
    );
    return response.data;
  } catch (error) {
    console.log("getSupervisionSchedulesError: ", error);
  }
};
