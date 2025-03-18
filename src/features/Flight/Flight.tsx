import { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

// import Webcam from "react-webcam";

import { resetHasShownLostConnectionToServerToast } from "../../utils/customAxios";
import * as SupervisionStreamingService from "../../APIServices/SupervisionStreamingService.api";
import * as CheckdeviceService from "../../APIServices/CheckdeviceService.api";
import * as CheckThreadCamHdmiService from "../../APIServices/CheckThreadCamHdmiService.api";

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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PinDropIcon from "@mui/icons-material/PinDrop";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Icon from "@mdi/react";
import { mdiBellAlert } from "@mdi/js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";

import Map from "../../components/Map/Map";
import axios from "axios";
import ImageZoom from "../../components/Zooming/ImageZoom";

// type PolylineMap = {
//   lat: number;
//   lng: number;
// };

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
  const [flightMethod, setFlightMethod] = useState("");
  console.log("flightMethod: ", flightMethod);
  const [videoStreamUrl, setVideoStreamUrl] = useState("");
  const [hadCompletedSetUpBeforeFly, setHadCompletedSetUpBeforeFly] =
    useState(false);
  // const [startFly, setStartFly] = useState(false);

  // map variable
  const [zoomMap, setZoomMap] = useState(16);
  const [centerMap, setCenterMap] = useState({
    lat: 21.002890438729345,
    lng: 105.86171273377768,
  });
  // const [polylineMap, setPolylineMap] = useState<PolylineMap[]>([]);

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

  // zoom anh defect
  const [openZoomingImg, setOpenZoomingImg] = useState("");

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
        console.log("endSocketData: ", data);
        if (data.data_state === "supervise_complete") {
          toast.success("Đã hoàn thành nhiệm vụ !", {
            onClose: () => {
              if (setStartFly) {
                setStartFly(false);
              }
              if (disconnect) {
                disconnect();
              }
              setFlightMethod("");
              setDefectInfo([]);
              setObjCount({
                people: 0,
                bicycle: 0,
                car: 0,
                truck: 0,
                tricycle: 0,
                bus: 0,
                motor: 0,
              });
              // setPolylineMap([]);
              setCurrentLocation(null);
              setCenterMap({
                lat: 21.002890438729345,
                lng: 105.86171273377768,
              });
              window.location.hash = "/ManageFlightData";
            },
          });
        }
        console.log("data:", data);
        const gis = data.metadata.detections.gis;
        const defectWS = data.metadata.detections.defects;
        const objectCountWS = data.metadata.detections.count_object;

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
          // setPolylineMap((prevPolyline) => [
          //   ...prevPolyline,
          //   {
          //     lat: parseFloat(gis.latitude),
          //     lng: parseFloat(gis.longtitude),
          //   },
          // ]);
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
  }, [ws, disconnect, setStartFly, startFly]);

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

  const handleSubmitSetUpBeforeFly = async () => {
    setHadCompletedSetUpBeforeFly(true);
    // const responseCheckDevice = await CheckdeviceService.getAllData();

    // if (responseCheckDevice) {
    // toast.success(String(responseCheckDevice));
    const responseCheckThreadCamHdmi =
      await CheckThreadCamHdmiService.getAllData();
    if (responseCheckThreadCamHdmi) {
      toast.success(String(responseCheckThreadCamHdmi));
      const formData = new FormData();
      formData.append(
        "data",
        JSON.stringify({ implementation_date: missionDate })
      );
      getConfirmedDataFromWS(formData);
    } else {
      setHadCompletedSetUpBeforeFly(false);
    }
    // } else {
    // setHadCompletedSetUpBeforeFly(false);
    // }
  };

  const sendConfirmedDataToWS = (
    data: postResponseSupervisionStreamingServiceDataType
  ) => {
    const modifyDataSentToWS = {
      ...data,
      action: "resume",
    };
    console.log("modifyDataSentToWS: ", modifyDataSentToWS);

    if (!ws || !ws.current) return;
    ws.current.send(JSON.stringify(modifyDataSentToWS));
    if (setStartFly) {
      setStartFly(true);
    }

    // TODO
    try {
      const response = axios.get("http://localhost:8000/video-stream/", {
        responseType: "stream",
      });
      console.log("response: ", response);
    } catch (error) {
      console.log("Error calling video stream API: ", error);
    }
    setVideoStreamUrl("http://localhost:8000/video-stream/");

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
            <div className="min-h-20 w-54 flex justify-center items-center">
              <FormControl fullWidth>
                <InputLabel>Phương thức kiểm tra</InputLabel>
                <Select
                  value={flightMethod}
                  label="Phương thức kiểm tra"
                  onChange={(e) => setFlightMethod(e.target.value)}
                  defaultValue={""}
                >
                  <MenuItem value="damchay">Phát hiện đám cháy</MenuItem>
                  <MenuItem value="untac">Phát hiện ùn tắc giao thông</MenuItem>
                  <MenuItem value="damdongbatthuong">
                    Phát hiện đám đông bất thường
                  </MenuItem>
                </Select>
              </FormControl>
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
              disabled={startFly === true || !flightMethod ? true : false}
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

  const ObjectCount = () => {
    const trafficData = [
      { icon: "👤", label: "người", count: objCount && objCount.people },
      { icon: "🚲", label: "xe đạp", count: objCount && objCount.bicycle },
      { icon: "🚗", label: "ô tô", count: objCount && objCount.car },
      { icon: "🚚", label: "xe tải", count: objCount && objCount.truck },
      { icon: "🛺", label: "xe ba bánh", count: objCount && objCount.tricycle },
      { icon: "🚌", label: "xe buýt", count: objCount && objCount.bus },
      { icon: "🏍️", label: "xe máy", count: objCount && objCount.motor },
    ];

    const crowdSenseData = {
      icon: "👤",
      label: "người",
      count: objCount && objCount.people,
    };

    if (flightMethod === "untac") {
      return (
        <div
          className="absolute z-3 top-40 right-[17px] bg-white border-2 
        border-red-400 opacity-90 rounded-lg shadow !p-4 w-55 flex flex-wrap justify-center"
        >
          {/* UN TAC */}
          {/* <p className="text-lg text-gray-800 text-center">
            Tình trạng giao thông:{" "}
            <span className="font-bold text-gray-800">Ùn tắc</span>
          </p>
          <div className="w-full h-2 bg-red-500 !my-1"></div> */}
          {/* LUU THONG CHAM */}
          <p className="text-lg text-gray-800 text-center">
            Tình trạng giao thông:{" "}
            <span className="font-bold text-gray-800">Lưu thông chậm</span>
          </p>
          <div className="w-full h-2 bg-yellow-500 !my-1"></div>
          {/* THONG THOANG */}
          {/* <p className="text-lg text-gray-800 text-center">
            Tình trạng giao thông:{" "}
            <span className="font-bold text-gray-800">Thông thoáng</span>
          </p>
          <div className="w-full h-2 bg-green-500 !my-1"></div> */}
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
    } else if (flightMethod === "damdongbatthuong") {
      return (
        <div className="absolute z-3 top-40 right-[17px] bg-white border-2 border-red-400 opacity-90 rounded-lg shadow !p-4 w-45">
          <ul className="space-y-3">
            <li className="flex items-center">
              <span className="w-10 text-2xl mr-2">{crowdSenseData.icon}</span>{" "}
              {/* Larger icons */}
              <div>
                <p className="font-medium text-gray-800">
                  {crowdSenseData.label}: {crowdSenseData.count}
                </p>
              </div>
            </li>
          </ul>
        </div>
      );
    } else if (flightMethod === "damchay") {
      return null;
    } else {
      return null;
    }
  };

  // TODO
  const convertCoordinates = async (
    defectLatitude: number,
    defectLongtitude: number
  ) => {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?lat=${defectLatitude}&lon=${defectLongtitude}&format=json`
    );
    console.log("convertCoordinates: ", response);
    console.log("convertCoordinatesName: ", response.data.display_name);
    console.log("convertCoordinatesAddress: ", response.data.address);
    return response.data.display_name;
  };

  const defectList = () => {
    return (
      <>
        <div
          className={`absolute z-2 ${
            openDefectList
              ? "bottom-[calc((100%-64px-60px+210px)/3)] !left-[350px] transition-all duration-500 ease-out"
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
          className={`absolute z-1 w-[350px] h-[calc(100%-64px-60px-82px)] 
            bg-white left-0 bottom-[30px] flex flex-col 
            items-center overflow-y-auto rounded-r-[15px] ${
              openDefectList
                ? "opacity-100 transition-opacity duration-500 ease-in"
                : "opacity-0"
            }`}
        >
          <div
            className="bg-red-500 text-white p-0.25 uppercase 
                      text-center rounded-lg !mt-5.5 w-[95%] shadow-lg font-bold"
          >
            <h1>BẤT THƯỜNG PHÁT HIỆN</h1>
          </div>
          {defectInfo.length > 0 &&
            defectInfo
              .slice()
              .reverse()
              .map((defect, index) => {
                console.log(defect);
                // const convertCoordinatesToExactLocation = convertCoordinates(
                //   parseFloat(defect.defect_gis.latitude),
                //   parseFloat(defect.defect_gis.longtitude)
                // );
                return (
                  <div
                    key={index}
                    className="!mt-5.5 w-[95%] shadow-lg font-bold bg-white 
                      text-black rounded-lg"
                  >
                    <div className="!p-2.5 uppercase">
                      <table>
                        <tr>
                          <td width={"30px"}>
                            <Icon path={mdiBellAlert} color={"red"} size={1} />
                          </td>
                          <td>
                            <p>{defect.defect_name}</p>
                          </td>
                        </tr>
                        <tr>
                          <td width={"30px"}>
                            <PinDropIcon style={{ color: "#00C8F8" }} />
                          </td>
                          <td>
                            KD,VD: {parseFloat(defect.defect_gis.latitude)},{" "}
                            {parseFloat(defect.defect_gis.longtitude)}
                          </td>
                          <td>
                            <Button
                              onClick={() => {
                                navigator.clipboard.writeText(
                                  `${parseFloat(
                                    defect.defect_gis.latitude
                                  )}, ${parseFloat(
                                    defect.defect_gis.longtitude
                                  )}`
                                );
                                toast.success("Đã copy tọa độ");
                              }}
                            >
                              <ContentCopyIcon />
                            </Button>
                          </td>
                        </tr>
                        <tr>
                          <td width={"30px"}>
                            <FontAwesomeIcon
                              icon={faMapLocationDot}
                              color="blue"
                            />
                          </td>
                          <td>ĐỊA CHỈ CHI TIẾT: Hà Đông</td>
                        </tr>
                      </table>
                    </div>
                    <div className="text-center !p-2">
                      <Button
                        className=""
                        variant="outlined"
                        color="success"
                        onClick={() =>
                          setOpenZoomingImg(
                            import.meta.env.VITE_API_URL +
                              defect.defect_image[0]
                          )
                        }
                      >
                        Xem ảnh
                      </Button>
                      <ImageZoom
                        info={
                          import.meta.env.VITE_API_URL + defect.defect_image[0]
                        }
                        openZoomingImg={openZoomingImg}
                        setOpenZoomingImg={setOpenZoomingImg}
                      />
                    </div>
                  </div>
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
        // polylineMap={polylineMap}
        defectInfo={defectInfo}
        mapCSS={"h-[195px] w-[400px] absolute z-1 bottom-0 right-0"}
        // mapCSS={"hidden"} // hien tai dang de an an do khi bay do gps dang kp real gps
      />

      {setUpBeforeFly()}

      {startFly && defectList()}

      {startFly && devices.length > 0 && videoStreamUrl && (
        <img
          src={videoStreamUrl}
          alt="Video detect stream"
          className="w-full h-full"
        />
      )}

      {startFly && (
        <Button
          variant="contained"
          color="warning"
          sx={{ position: "absolute", top: "70px", left: "15px" }}
          onClick={() => {
            const modifyDataSentToWS = {
              action: "off",
            };

            setVideoStreamUrl("");
            if (!ws || !ws.current) return;
            ws.current.send(JSON.stringify(modifyDataSentToWS));
          }}
        >
          Dừng nhiệm vụ
        </Button>
      )}

      {startFly && <ObjectCount />}
    </>
  );
};

export default Flight;
