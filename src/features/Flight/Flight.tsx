import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useLocation } from "react-router-dom";

import { resetHasShownLostConnectionToServerToast } from "../../utils/customAxios";
import * as SupervisionStreamingService from "../../APIServices/SupervisionStreamingService.api";
import * as CheckdeviceService from "../../APIServices/CheckdeviceService.api";
import * as CheckThreadCamHdmiService from "../../APIServices/CheckThreadCamHdmiService.api";
import * as MonitoringOptionService from "../../APIServices/MonitoringOption.api";

import { getMonitoringOptionResponseType } from "../../types/APIServices/MonitoringOption.type";
import { postRequestSupervisionStreamingServiceDataType } from "../../types/APIServices/SupervisionStreamingService.type";
import {
  GISDataType,
  DefectType,
  CountObjectType,
} from "../../types/global/WSData.type";

import useWebSocket, { ReadyState } from "react-use-websocket";
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
import CropFreeIcon from "@mui/icons-material/CropFree";

import Map from "../../components/Map/Map";
import Loading from "../../components/LoadingPage/LoadingPage";
import ObjectCountPanel from "./ObjectCountPanel";
import DefectListPanel from "./DefectListPanel";

// type PolylineMap = {
//   lat: number;
//   lng: number;
// };

type rectTrackingBoxType = {
  x: number;
  y: number;
  width: number;
  height: number;
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
  const [monitoringOptions, setMonitoringOptions] = useState<
    getMonitoringOptionResponseType[]
  >([]);
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
  const [trafficDensity, setTrafficDensity] = useState("");

  // defect list variable
  const [openDefectList, setOpenDefectList] = useState(false);

  // WS variable
  const { sendMessage, lastMessage, readyState } = useWebSocket(
    import.meta.env.VITE_WS_URL,
    {
      shouldReconnect: () => {
        return true;
      }, // autoreconnect
    }
  );
  const globalStateContext = useContext(GlobalStateContext);
  const startFly = globalStateContext?.startFly;
  const setStartFly = globalStateContext?.setStartFly;
  const [hasCalledVideoStreamApi, setHasCalledVideoStreamApi] = useState(false);

  // lay cam tu uav
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const location = useLocation();

  // zoom anh defect
  const [openZoomingImg, setOpenZoomingImg] = useState("");

  // show video stream only
  const [showVideoStreamOnly, setShowVideoStreamOnly] = useState(false);

  // draw tracking box
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [rect, setRect] = useState<rectTrackingBoxType | null>(null);
  const [hasMouseMoved, setHasMouseMoved] = useState(false); // Theo dõi xem chuột đã di chuyển chưa

  useEffect(() => {
    resetHasShownLostConnectionToServerToast();
  }, [location]);

  useEffect(() => {
    if (readyState) {
      switch (readyState) {
        case ReadyState.UNINSTANTIATED:
          console.log("WebSocket chưa được khởi tạo.");
          break;
        case ReadyState.OPEN:
          console.log("WebSocket đã được kết nối.");
          break;
        case ReadyState.CLOSING:
          console.log("Đang đóng kết nối WebSocket...");
          break;
        case ReadyState.CLOSED:
          console.log("Đã đóng kết nối WebSocket.");
          break;
        default:
          break;
      }
    }
  }, [readyState]);

  useEffect(() => {
    const handleDevices = (mediaDevices: MediaDeviceInfo[]) =>
      setDevices(mediaDevices.filter(({ kind }) => kind === "videoinput"));

    if (navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }
  }, []);

  useEffect(() => {
    const getMonitoringOption = async () => {
      const response = await MonitoringOptionService.getAllData();
      if (response) {
        setMonitoringOptions(response);
      }
    };
    getMonitoringOption();
  }, []);

  useEffect(() => {
    if (!lastMessage) return; // Chưa có tin nhắn
    try {
      const data = JSON.parse(lastMessage.data);
      console.log("endSocketData: ", data);
      if (data.status === "error") {
        toast.error("Lỗi không gửi được yêu cầu !", {
          autoClose: 4000,
          onClose: () => window.location.reload(),
        });
        console.error(
          "Lỗi khi gửi thông tin nhiệm vụ bay vào websocket: ",
          data.message
        );
      }
      if (data.data_state === "supervise_complete") {
        toast.success("Đã hoàn thành nhiệm vụ !", {
          onClose: () => {
            if (setStartFly) {
              setStartFly(false);
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
            setTrafficDensity("");
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
      if (data && data.metadata && data.metadata.detections) {
        const gis = data.metadata.detections.gis;
        const defectWS = data.metadata.detections.defects;
        const objectCountWS = data.metadata.detections.count_object;
        const trafficDensityWS = data.metadata.detections.label_traffic;

        if (gis !== undefined) {
          setHadCompletedSetUpBeforeFly(false);
          if (setStartFly) {
            setStartFly(true);
          }
          if (!hasCalledVideoStreamApi) {
            try {
              console.log("Calling video stream API for the first time");
              const response = axios.get(
                "http://localhost:8000/video-stream/",
                {
                  responseType: "stream",
                }
              );
              console.log("response: ", response);
              // Đánh dấu là API đã được gọi
              setHasCalledVideoStreamApi(true);
            } catch (error) {
              console.log("Error calling video stream API: ", error);
            }
          }
          setVideoStreamUrl("http://localhost:8000/video-stream/");
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
          if (trafficDensityWS !== undefined) {
            setTrafficDensity(trafficDensityWS);
          }
        }
        // };
      }
    } catch (error) {
      console.log("Error from WS: ", error);
    }
  }, [lastMessage, setStartFly, startFly, hasCalledVideoStreamApi]);

  useEffect(() => {
    if (startFly && defectInfo.length > 0) {
      setOpenDefectList(true);
    } else {
      setOpenDefectList(false);
    }
  }, [startFly, defectInfo.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const drawRectangle = () => {
      if (!rect || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa hình cũ

      // Vẽ vùng bên trong (độ mờ 0.8)
      ctx.fillStyle = "rgba(255, 0, 0, 0.2)"; // điều chỉnh giá trị alpha
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);

      // Vẽ viền
      ctx.strokeStyle = "red";
      ctx.lineWidth = 4;
      ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    };

    drawRectangle();
  }, [rect]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Chỉ xử lý khi nhấn chuột trái (button 0)
    if (e.button !== 0) return;

    if (canvasRef && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      // if (!ws || !ws.current) return;
      sendMessage(
        JSON.stringify({
          action: "reset_tracker",
        })
      );

      setIsDrawing(true);
      setRect({ x: startX, y: startY, width: 0, height: 0 });
      setHasMouseMoved(false); // Reset trạng thái di chuyển chuột
    }
  };

  // Hàm xử lý nhấn chuột phải để reset tracker
  const handleRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Ngăn menu ngữ cảnh mặc định hiện ra

    // if (!ws || !ws.current) return;
    sendMessage(
      JSON.stringify({
        action: "reset_tracker",
      })
    );
    console.log("Reset tracker by right click");
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    // Đánh dấu là chuột đã di chuyển (để phân biệt giữa click và drag)
    setHasMouseMoved(true);
    if (canvasRef && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      setRect((prev) => {
        if (!prev) return { x: currentX, y: currentY, width: 0, height: 0 };
        return {
          ...prev,
          width: currentX - prev.x,
          height: currentY - prev.y,
        };
      });
    }
  };

  const handleMouseUp = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    setIsDrawing(false);
    // if (!ws || !ws.current) return;
    if (hasMouseMoved && rect && rect.width > 5 && rect.height > 5) {
      sendMessage(
        JSON.stringify({
          action: "update_roi",
          point: [rect.x, rect.y, rect.width, rect.height],
        })
      );
    } else {
      // Nếu không di chuyển hoặc di chuyển rất ít, xử lý như click đơn
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (rect) {
        sendMessage(
          JSON.stringify({
            action: "update_roi",
            point: [rect.x, rect.y],
          })
        );
        console.log("Sent single point:", [rect.x, rect.y]);
      }
    }

    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); // Xóa hình cũ
      setRect(null);
    }, 100);
  };

  const handleOpenSetUpBeforeFly = () => {
    setOpenSetUpBeforeFly(true);
  };

  const handleCloseSetUpBeforeFly = () => {
    setOpenSetUpBeforeFly(false);
    setMissionDate(currentDate);
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
      const modifyDataSentToWS = {
        ...response,
        action: "resume",
      };
      console.log("modifyDataSentToWS: ", modifyDataSentToWS);

      // if (!ws || !ws.current) return;
      sendMessage(JSON.stringify(modifyDataSentToWS));
      handleCloseSetUpBeforeFly();
    } else {
      setHadCompletedSetUpBeforeFly(false);
    }
  };

  const handleSubmitSetUpBeforeFly = async () => {
    setHadCompletedSetUpBeforeFly(true);
    const responseCheckDevice = await CheckdeviceService.getAllData();

    if (responseCheckDevice) {
      toast.success(String(responseCheckDevice));
      const responseCheckThreadCamHdmi =
        await CheckThreadCamHdmiService.getAllData();
      if (responseCheckThreadCamHdmi) {
        toast.success(String(responseCheckThreadCamHdmi));
        const formData = new FormData();
        formData.append(
          "data",
          JSON.stringify({
            implementation_date: missionDate,
            monitoring_options: flightMethod,
          })
        );
        getConfirmedDataFromWS(formData);
      } else {
        setHadCompletedSetUpBeforeFly(false);
      }
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
                  {monitoringOptions.map((option, index) => (
                    <MenuItem key={index} value={option.option_name}>
                      {option.option_title}
                    </MenuItem>
                  ))}
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

  return (
    <>
      {!showVideoStreamOnly && (
        <Map
          centerMap={centerMap}
          zoomMap={zoomMap}
          startFly={startFly || false}
          currentLocation={currentLocation}
          // polylineMap={polylineMap}
          defectInfo={defectInfo}
          flightMethod={flightMethod}
          mapCSS={"h-[195px] w-[400px] absolute z-1 bottom-0 right-0"}
          // mapCSS={"hidden"} // hien tai dang de an an do khi bay do gps dang kp real gps
        />
      )}

      {setUpBeforeFly()}

      {startFly && !showVideoStreamOnly && flightMethod !== "tracking" && (
        <DefectListPanel
          openDefectList={openDefectList}
          setOpenDefectList={setOpenDefectList}
          defectInfo={defectInfo}
          openZoomingImg={openZoomingImg}
          setOpenZoomingImg={setOpenZoomingImg}
        />
      )}

      {startFly && devices.length > 0 && videoStreamUrl && (
        <div className="relative w-screen h-[calc(100vh-55px)] flex justify-center items-center bg-gray-200">
          {/* Video stream */}
          <img
            src={videoStreamUrl}
            alt="Video detect stream"
            className="w-[1280px] h-[720px] absolute"
          />

          {/* Canvas để vẽ */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="absolute cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onContextMenu={handleRightClick} // Xử lý nhấn chuột phải
          />
        </div>
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
            setHasCalledVideoStreamApi(false);
            setVideoStreamUrl("");
            sendMessage(JSON.stringify(modifyDataSentToWS));
          }}
        >
          Kết thúc kiểm tra
        </Button>
      )}

      {startFly && (
        <button
          className="absolute z-1 text-center normal-case 
        shadow-[rgba(0,0,0,0.3)_0px_1px_4px_-1px] border-0 w-[40px] 
        h-[40px] p-[10px] right-[16px] top-[70px] shadow-[0_2px_5px_rgba(0,0,0,0.15)] 
        border-none bg-white rounded-[7px]"
          title="Chỉ xem luồng video"
          onClick={() => {
            setShowVideoStreamOnly((prev) => (prev === true ? false : true));
          }}
        >
          <CropFreeIcon color="action" />
        </button>
      )}

      {startFly && !showVideoStreamOnly && (
        <ObjectCountPanel
          objCount={objCount}
          flightMethod={flightMethod}
          trafficDensity={trafficDensity}
        />
      )}

      {hadCompletedSetUpBeforeFly && <Loading />}
    </>
  );
};

export default Flight;
