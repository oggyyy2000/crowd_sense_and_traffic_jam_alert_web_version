import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

import Webcam from "react-webcam";

import { resetHasShownLostConnectionToServerToast } from "../../utils/customAxios";
import * as SupervisionStreamingService from "../../APIServices/SupervisionStreamingService.api";
import {
  postRequestSupervisionStreamingServiceDataType,
  postResponseSupervisionStreamingServiceDataType,
} from "../../types/APIServices/SupervisionStreamingService.type";
import {
  GISDataType,
  DefectType,
  CountObjectType,
} from "../../types/global/WSData.type";

import { WSContext } from "../../utils/context/Contexts";
import { GlobalStateContext } from "../../utils/context/Contexts";

import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  TextField,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PinDropIcon from "@mui/icons-material/PinDrop";

import Map from "../../components/Map/Map";
import HotKeyManual from "../../components/HotKeyManual/HotKeyManual";

type PolylineMap = {
  lat: number;
  lng: number;
};

type MediaDeviceInfo = {
  kind: string;
};

const Flight = () => {
  // setup before fly variable
  const [openSetUpBeforeFly, setOpenSetUpBeforeFly] = useState(true);
  const dt = new Date();
  const currentDate = `${dt.getFullYear().toString().padStart(4, "0")}-${(
    dt.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}-${dt.getDate().toString().padStart(2, "0")}`;
  const [missionDate, setMissionDate] = useState(currentDate);
  const [hadCompletedSetUpBeforeFly, setHadCompletedSetUpBeforeFly] =
    useState(false);
  // const [startFly, setStartFly] = useState(false);

  // map variable
  const [zoomMap, setZoomMap] = useState(16);
  const [centerMap, setCenterMap] = useState({
    lat: 21.002890438729345,
    lng: 105.86171273377768,
  });
  const [polylineMap, setPolylineMap] = useState<PolylineMap[]>([]);

  // info from WS
  const [currentLocation, setCurrentLocation] = useState<GISDataType | null>(
    null
  );
  // console.log("currentLocation: ", currentLocation);
  const [defectInfo, setDefectInfo] = useState<DefectType[]>([]);
  console.log("defectInfo: ", defectInfo);
  const [objCount, setObjCount] = useState<CountObjectType>({
    people: 0,
    bicycle: 0,
    car: 0,
    truck: 0,
    tricycle: 0,
    bus: 0,
    motor: 0,
  });

  // defect list variable
  const [openDefectList, setOpenDefectList] = useState(false);

  // WS variable
  const wsContext = useContext(WSContext);
  const ws = wsContext?.ws;
  const connect = wsContext?.connect;
  const disconnect = wsContext?.disconnect;
  const globalStateContext = useContext(GlobalStateContext);
  const startFly = globalStateContext?.startFly;
  const setStartFly = globalStateContext?.setStartFly;

  // lay cam tu uav
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const location = useLocation();

  useEffect(() => {
    resetHasShownLostConnectionToServerToast();
  }, [location]);

  useEffect(() => {
    if (connect) {
      connect();
    }
  }, [connect]);

  useEffect(() => {
    const handleDevices = (mediaDevices: MediaDeviceInfo[]) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));

    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }
  }, []);

  useEffect(() => {
    try {
      if (!ws || !ws.current) return;
      ws.current.onmessage = (e: MessageEvent) => {
        const data = JSON.parse(e.data);
        if (data.data_state === "supervise_complete") {
          console.log(data.data);
          toast.success("Đã hoàn thành nhiệm vụ !", {
            onClose: () => {
              if (setStartFly) {
                setStartFly(false);
              }
              if (disconnect) {
                disconnect();
              }
              window.location.hash = "/ManageFlightData";
            },
          });
        }
        console.log("data:", data);
        const gis = data.data.gis;
        const defectWS = data.data.defects;
        const objectCountWS = data.data.count_object;

        if (gis !== undefined) {
          if (setStartFly) {
            setStartFly(true);
          }
          console.log("currentLocationFromWS: ", gis);
          setCurrentLocation(gis);
          setCenterMap({
            lat: parseFloat(gis.latitude),
            lng: parseFloat(gis.longtitude),
          });
          setPolylineMap((prevPolyline) => [
            ...prevPolyline,
            {
              lat: parseFloat(gis.latitude),
              lng: parseFloat(gis.longtitude),
            },
          ]);
          setZoomMap(16);
          if (defectWS.length > 0) {
            setDefectInfo(defectWS);
          }
          if (objectCountWS !== undefined) {
            setObjCount(objectCountWS);
          }
        }
      };
    } catch (error) {
      console.log("Error from WS: ", error);
    }
  }, [ws, disconnect, setStartFly, startFly, polylineMap]);

  useEffect(() => {
    if (startFly && defectInfo.length > 0) {
      setOpenDefectList(true);
    } else {
      setOpenDefectList(false);
    }
  }, [startFly, defectInfo.length]);

  const handleOpenSetUpBeforeFly = () => {
    setOpenSetUpBeforeFly(true);
  };

  const handleCloseSetUpBeforeFly = () => {
    setHadCompletedSetUpBeforeFly(false);
    setOpenSetUpBeforeFly(false);
    setMissionDate(currentDate);
  };

  const handleSubmitSetUpBeforeFly = () => {
    setHadCompletedSetUpBeforeFly(true);
    const formData = new FormData();
    formData.append(
      "data",
      JSON.stringify({ implementation_date: missionDate })
    );
    getConfirmedDataFromWS(formData);
  };

  const sendConfirmedDataToWS = (
    data: postResponseSupervisionStreamingServiceDataType
  ) => {
    if (!ws || !ws.current) return;
    ws.current.send(JSON.stringify(data));
    if (setStartFly) {
      setStartFly(true);
    }
    handleCloseSetUpBeforeFly();
  };

  const getConfirmedDataFromWS = async (
    formData: postRequestSupervisionStreamingServiceDataType
  ) => {
    const response = await SupervisionStreamingService.postData({
      data: formData,
      options: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    });
    if (response) {
      console.log("ConfirmedDataFromWS: ", response);
      sendConfirmedDataToWS(response);
    } else {
      setHadCompletedSetUpBeforeFly(false);
    }
  };

  const setUpBeforeFly = () => {
    return (
      <>
        <Button
          variant="contained"
          color="primary"
          className="!absolute top-[125px] left-4 !min-w-20 z-1"
          onClick={handleOpenSetUpBeforeFly}
          disabled={startFly}
        >
          Bay
        </Button>

        <Dialog open={openSetUpBeforeFly}>
          <DialogTitle
            sx={{
              display: "flex",
              textAlign: "center",
              textTransform: "uppercase",
              backgroundColor: "#1976d2",
              color: "white",
            }}
          >
            <span>Thông tin giám sát</span>
            <div className="add-mission-dialog__icon">
              <FlightTakeoffIcon sx={{ color: "white" }} fontSize="large" />
            </div>
          </DialogTitle>
          <DialogContent sx={{ padding: "0px 24px" }}>
            <div className="min-h-20 w-54 flex justify-center items-center">
              <TextField
                fullWidth
                label="Ngày kiểm tra"
                type="date"
                value={missionDate}
                defaultValue={currentDate}
                slotProps={{
                  inputLabel: {
                    shrink: true,
                  },
                }}
                onChange={(e) => setMissionDate(e.target.value)}
              />
            </div>
          </DialogContent>
          <DialogActions
            sx={{
              display: "flex",
              justifyContent: "space-between",
              padding: "16px 24px",
            }}
          >
            <Button
              disabled={hadCompletedSetUpBeforeFly === true ? true : false}
              onClick={handleCloseSetUpBeforeFly}
              color="primary"
            >
              Hủy
            </Button>

            <Button
              color="primary"
              disabled={startFly === true ? true : false}
              onClick={handleSubmitSetUpBeforeFly}
            >
              {hadCompletedSetUpBeforeFly === false
                ? "Xác nhận"
                : "Đang xử lý..."}
            </Button>
          </DialogActions>
        </Dialog>
      </>
    );
  };

  const TrafficCount = () => {
    const trafficData = [
      { icon: "👤", label: "người", count: objCount && objCount.people },
      { icon: "🚲", label: "xe đạp", count: objCount && objCount.bicycle },
      { icon: "🚗", label: "ô tô", count: objCount && objCount.car },
      { icon: "🚚", label: "xe tải", count: objCount && objCount.truck },
      { icon: "🛺", label: "xe ba bánh", count: objCount && objCount.tricycle },
      { icon: "🚌", label: "xe buýt", count: objCount && objCount.bus },
      { icon: "🏍️", label: "xe máy", count: objCount && objCount.motor },
    ];

    return (
      <div className="absolute z-3 top-40 right-[17px] bg-white opacity-90 rounded-lg shadow p-4 w-40">
        <ul className="space-y-3">
          {trafficData.map((item, index) => (
            <li key={index} className="flex items-center">
              <span className="w-10 text-2xl mr-2">{item.icon}</span>{" "}
              {/* Larger icons */}
              <div>
                <p className="font-medium text-gray-800">
                  {item.label}: {item.count}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const defectList = () => {
    return (
      <>
        <div
          className={`absolute z-2 ${
            openDefectList
              ? "bottom-[calc((100%-64px-60px+210px)/3)] !left-[300px] transition-all duration-500 ease-out"
              : "bottom-[calc((100%-64px-60px+210px)/3)] left-0 transition-all duration-500 ease-in"
          }`}
        >
          <button
            className="bg-gray-300 flex justify-center w-3 rounded-lg"
            onClick={() => setOpenDefectList(!openDefectList)}
          >
            {openDefectList ? (
              <KeyboardArrowLeftIcon sx={{ color: "black" }} />
            ) : (
              <KeyboardArrowRightIcon sx={{ color: "black" }} />
            )}
          </button>
        </div>

        <div
          className={`absolute z-1 w-[300px] h-[calc(100%-64px-60px-82px)] 
            bg-white left-0 bottom-[30px] flex flex-col 
            items-center overflow-y-auto rounded-r-[15px] ${
              openDefectList
                ? "opacity-100 transition-opacity duration-500 ease-in"
                : "opacity-0"
            }`}
        >
          {defectInfo.length > 0 &&
            defectInfo
              .slice()
              .reverse()
              .map((defect, index) => {
                console.log(defect);
                return (
                  <>
                    <div
                      key={index}
                      className="!mt-5.5 w-[95%] shadow-lg font-bold bg-white 
                      text-black rounded-lg"
                    >
                      <div
                        className="bg-red-500 text-white p-0.25 uppercase 
                      text-center rounded-t-lg"
                      >
                        <h1>{defect.defect_name}</h1>
                      </div>
                      <div className="p-2.5 uppercase">
                        <table>
                          <tr>
                            <td rowSpan={2} width={"30px"}>
                              <PinDropIcon style={{ color: "#00C8F8" }} />
                            </td>
                            <td>
                              KD,VD: {parseFloat(defect.defect_gis.latitude)},{" "}
                              {parseFloat(defect.defect_gis.longtitude)}
                            </td>
                          </tr>
                          <tr>
                            <td>
                              ĐỘ CAO: {parseFloat(defect.defect_gis.altitude)}
                            </td>
                          </tr>
                        </table>
                      </div>
                    </div>
                  </>
                );
              })}
        </div>
      </>
    );
  };

  return (
    <>
      <Map
        centerMap={centerMap}
        zoomMap={zoomMap}
        startFly={startFly || false}
        currentLocation={currentLocation}
        polylineMap={polylineMap}
        defectInfo={defectInfo}
        mapCSS={"h-[195px] w-[400px] absolute z-1 bottom-0 right-0"}
      />

      {setUpBeforeFly()}

      {startFly && defectList()}

      {startFly && devices.length > 0 && (
        <Webcam
          className="absolute w-screen h-[calc(100vh-64px)] object-fill z-0"
          audio={false}
          autoPlay
        />
      )}

      {startFly && <HotKeyManual />}

      {startFly && <TrafficCount />}
    </>
  );
};

export default Flight;
