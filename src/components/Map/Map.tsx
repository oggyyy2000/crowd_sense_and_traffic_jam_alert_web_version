import { useState, useEffect } from "react";
import { GISDataType, DefectType } from "../../types/global/WSData.type";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  Popup,
  Tooltip,
} from "react-leaflet";
import L from "leaflet";

import DroneIcon from "../../assets/images/drone2.png";
import ErrorIcon from "../../assets/images/error-icon.png";
// import blueDotIcon from "../../assets/images/blue_dot.png";
import CropFreeIcon from "@mui/icons-material/CropFree";

interface MapProps {
  centerMap: {
    lat: number;
    lng: number;
  };
  zoomMap: number;
  startFly: boolean;
  currentLocation?: GISDataType | null;
  // polylineMap: {
  //   lat: number;
  //   lng: number;
  // }[];
  defectInfo: DefectType[];
  flightMethod: string;
  mapCSS: string;
}

interface SetCenterMapOnClickProps {
  coords: [number, number] | null;
  triggerUpdate: string;
}

const Map = ({
  centerMap,
  zoomMap,
  startFly,
  currentLocation,
  // polylineMap,
  defectInfo,
  flightMethod,
  mapCSS,
}: MapProps) => {
  const [typeMap, setTypeMap] = useState("roadmap");
  const [buttonText, setButtonText] = useState("Bản đồ");

  console.log("currentLocation: ", currentLocation);
  const customIcon = new L.Icon({
    iconUrl: DroneIcon,
    iconSize: [30, 30],
  });

  const [fullZoomMapCSS, setFullZoomMapCSS] = useState("");

  const handleChangeMapType = () => {
    setButtonText((prevButtonText) =>
      prevButtonText === "Vệ tinh" ? "Bản đồ" : "Vệ tinh"
    );
    setTypeMap((prevTypeMap) =>
      prevTypeMap === "satellite" ? "roadmap" : "satellite"
    );
  };

  const SetCenterMapOnClick = ({
    coords,
    triggerUpdate,
  }: SetCenterMapOnClickProps) => {
    const map = useMap();
    useEffect(() => {
      if (coords) {
        map.invalidateSize();
        map.setView(coords, map.getZoom());
      }
    }, [coords, triggerUpdate, map]); // Thêm triggerUpdate vào dependencies

    return null;
  };

  // const renderPolyline = () => {
  //   const customIcon = new L.Icon({
  //     iconUrl: blueDotIcon,
  //     iconSize: [5, 5],
  //   });

  //   return (
  //     <>
  //       {polylineMap.map((gis1, index) => {
  //         if (gis1.lat && gis1.lng) {
  //           return (
  //             <>
  //               <Marker key={index} position={gis1} icon={customIcon}></Marker>
  //             </>
  //           );
  //         }
  //       })}
  //     </>
  //   );
  // };

  const renderMarkerError = (defectInfo: DefectType[]) => {
    const customIcon = new L.Icon({
      iconUrl: ErrorIcon,
      iconSize: [27, 27],
    });

    if (defectInfo.length > 0) {
      return (
        <>
          {defectInfo.map((gis1, index) => {
            return (
              <>
                <Marker
                  key={index}
                  position={{
                    lat: parseFloat(gis1.defect_gis.latitude),
                    lng: parseFloat(gis1.defect_gis.longtitude),
                  }}
                  eventHandlers={{
                    mouseover: (event) => event.target.openTooltip(),
                    click: (event) => event.target.openPopup(),
                  }}
                  icon={customIcon}
                  // animation={1}
                >
                  <Popup
                    position={{
                      lat: parseFloat(gis1.defect_gis.latitude),
                      lng: parseFloat(gis1.defect_gis.longtitude),
                    }}
                  >
                    <div className="map__popup">
                      <p>Tên lỗi: {gis1.defect_name}</p>
                      <p>
                        Tọa độ: {parseFloat(gis1.defect_gis.latitude)} ,{" "}
                        {parseFloat(gis1.defect_gis.longtitude)}
                      </p>
                    </div>
                  </Popup>
                  <Tooltip>
                    <div className="map__tooltip">
                      <p>Tên lỗi: {gis1.defect_name}</p>
                      <p>
                        Tọa độ: {parseFloat(gis1.defect_gis.latitude)} ,{" "}
                        {parseFloat(gis1.defect_gis.longtitude)}
                      </p>
                    </div>
                  </Tooltip>
                </Marker>
              </>
            );
          })}
        </>
      );
    }
  };

  return (
    <div
      className={`${
        !startFly ? "h-[calc(100vh-65px)] w-screen relative z-0" : mapCSS
      } ${fullZoomMapCSS}`}
    >
      <button
        className="absolute z-1 text-center normal-case 
        shadow-[rgba(0,0,0,0.3)_0px_1px_4px_-1px] border-0 w-[80px] 
        h-[40px] p-[10px] left-[16px] top-[10px] shadow-[0_2px_5px_rgba(0,0,0,0.15)] 
        border-none bg-white rounded-[7px]"
        value={"Vệ tinh"}
        onClick={handleChangeMapType}
      >
        {buttonText}
      </button>

      {startFly && (
        <>
          <button
            className="absolute z-1 text-center normal-case 
        shadow-[rgba(0,0,0,0.3)_0px_1px_4px_-1px] border-0 w-[40px] 
        h-[40px] p-[10px] right-[16px] top-[10px] shadow-[0_2px_5px_rgba(0,0,0,0.15)] 
        border-none bg-white rounded-[7px]"
            onClick={() => {
              setFullZoomMapCSS((prev) =>
                prev === "h-[480px] w-[640px]" ? "" : "h-[480px] w-[640px]"
              );
            }}
          >
            <CropFreeIcon color="action" />
          </button>
        </>
      )}

      <MapContainer
        center={[centerMap.lat, centerMap.lng]}
        zoomControl={false}
        zoom={zoomMap}
        maxZoom={17}
        className="absolute h-full w-full z-0"
      >
        <TileLayer
          url={
            typeMap === "roadmap"
                ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                : "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          }
        />

        {/* render marker may bay bay theo lo trinh */}
        {currentLocation &&
          currentLocation.latitude &&
          currentLocation.longtitude && (
            <Marker
              key={1}
              position={{
                lat: parseFloat(currentLocation.latitude),
                lng: parseFloat(currentLocation.longtitude),
              }}
              icon={customIcon}
            ></Marker>
          )}

        {/* render loi */}
        {flightMethod !== "tracking" && renderMarkerError(defectInfo)}

        {/* set center map theo may bay */}
        {currentLocation &&
          currentLocation.latitude &&
          currentLocation.longtitude && (
            <SetCenterMapOnClick
              coords={[
                parseFloat(currentLocation.latitude),
                parseFloat(currentLocation.longtitude),
              ]}
              triggerUpdate={fullZoomMapCSS} // Sử dụng fullZoomMapCSS làm trigger
            />
          )}

        {/* render duong di may bay  */}
        {/* {polylineMap && polylineMap.length > 0 && renderPolyline()} */}
      </MapContainer>
    </div>
  );
};

export default Map;
