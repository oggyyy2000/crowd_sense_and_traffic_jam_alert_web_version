export type postRequestSupervisionStreamingServiceDataType = FormData;

export type postResponseSupervisionStreamingServiceDataType = {
  schedule_id: number;
  implementation_date: string;
  supervision_results: string;
  results_save_path: string;
  mission_id: number;
};
