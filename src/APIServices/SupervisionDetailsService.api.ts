import customAxios from "../utils/customAxios";
import { SupervisionDetailsResponseType } from "../types/APIServices/SupervisionDetailsService.type";

export const getData = async ({
  supervisionDetailsEndpoint,
}: {
  supervisionDetailsEndpoint: string;
}) => {
  try {
    const response = await customAxios.get<SupervisionDetailsResponseType[]>(
      supervisionDetailsEndpoint
    );
    return response.data;
  } catch (error) {
    console.log("getSupervisionDetailsError: ", error);
  }
};
