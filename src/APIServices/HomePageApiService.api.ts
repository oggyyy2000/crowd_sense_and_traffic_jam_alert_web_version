import customAxios from "../utils/customAxios";
import { HomePageApiResponseType } from "../types/APIServices/HomePageApiService.type";

export const getAllData = async () => {
  try {
    const response = await customAxios.get<HomePageApiResponseType[]>(
      "homepageapiview/"
    );
    return response.data;
  } catch (error) {
    console.log("getHomePageApiViewError: ", error);
  }
};
