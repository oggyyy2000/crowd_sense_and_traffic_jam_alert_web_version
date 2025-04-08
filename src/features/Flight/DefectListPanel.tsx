import { toast } from "react-toastify";
import { DefectType } from "../../types/global/WSData.type";

import { Button } from "@mui/material";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import PinDropIcon from "@mui/icons-material/PinDrop";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Icon from "@mdi/react";
import { mdiBellAlert } from "@mdi/js";
import { mdiNewBox } from "@mdi/js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot } from "@fortawesome/free-solid-svg-icons";

import ImageZoom from "../../components/Zooming/ImageZoom";

interface DefectListPanelProps {
  openDefectList: boolean;
  setOpenDefectList: React.Dispatch<React.SetStateAction<boolean>>;
  defectInfo: DefectType[];
  openZoomingImg: string;
  setOpenZoomingImg: React.Dispatch<React.SetStateAction<string>>;
}

const DefectListPanel = ({
  openDefectList,
  setOpenDefectList,
  defectInfo,
  openZoomingImg,
  setOpenZoomingImg,
}: DefectListPanelProps) => {
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
              items-center overflow-y-auto rounded-r-[15px] !py-2 ${
                openDefectList
                  ? "opacity-100 transition-opacity duration-500 ease-in"
                  : "opacity-0"
              }`}
      >
        <div
          className="bg-red-500 text-white p-0.25 uppercase 
              text-center rounded-lg w-[95%] shadow-lg font-bold"
        >
          <h1>BẤT THƯỜNG PHÁT HIỆN</h1>
        </div>
        {defectInfo.length > 0 &&
          defectInfo
            .slice()
            .reverse()
            .map((defect, index) => {
              return (
                <div
                  key={index}
                  className={`!mt-5.5 w-[95%] shadow-lg font-bold bg-white 
                        text-black rounded-lg border border-gray-400 ${
                          index === 0 ? "blink-red-border" : ""
                        }`}
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
                        {index === 0 && (
                          <td className="flex justify-center items-center">
                            <Icon path={mdiNewBox} size={1.5} color={"red"} />
                          </td>
                        )}
                      </tr>
                      <tr>
                        <td width={"30px"}>
                          <PinDropIcon style={{ color: "#00C8F8" }} />
                        </td>
                        <td>
                          TỌA ĐỘ: {parseFloat(defect.defect_gis.latitude)},{" "}
                          {parseFloat(defect.defect_gis.longtitude)}
                        </td>
                        <td>
                          <Button
                            title="Copy tọa độ xảy ra lỗi"
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${parseFloat(
                                  defect.defect_gis.latitude
                                )}, ${parseFloat(defect.defect_gis.longtitude)}`
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
                        <td>ĐỊA CHỈ CHI TIẾT: {defect.defect_location}</td>
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
                          import.meta.env.VITE_API_URL + defect.defect_image[0]
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

export default DefectListPanel;
