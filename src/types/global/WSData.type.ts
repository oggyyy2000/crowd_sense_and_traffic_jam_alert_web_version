export interface GISDataType {
  latitude: string;
  longtitude: string;
  altitude: string;
}

export interface DefectType {
  defect_id: string;
  defect_name: string;
  defect_gis: GISDataType;
  defect_image: string[];
}

export interface CountObjectType {
  people: number;
  bicycle: number;
  car: number;
  truck: number;
  tricycle: number;
  bus: number;
  motor: number;
}

export interface DefectDataResponseType {
  gis: GISDataType;
  defects: DefectType[];
  count_object: CountObjectType;
}
