import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { resetHasShownLostConnectionToServerToast } from "../../utils/customAxios";
import * as HomePageApiService from "../../APIServices/HomePageApiService.api";
import * as SupervisionSchedulesService from "../../APIServices/SupervisionSchedulesService.api";
import * as SupervisionDetailsService from "../../APIServices/SupervisionDetailsService.api";
import { HomePageApiResponseType } from "../../types/APIServices/HomePageApiService.type";
import { SupervisionSchedulesResponseType } from "../../types/APIServices/SupervisionSchedulesService.type";
import { SupervisionDetailsResponseType } from "../../types/APIServices/SupervisionDetailsService.type";

import {
  Box,
  FormControl,
  ImageList,
  ImageListItem,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Button,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import FolderIcon from "../../assets/images/open_folder.png";
import MissionIcon from "../../assets/images/mission_drone_icon.svg";
import CropFreeIcon from "@mui/icons-material/CropFree";

import ImageZoom from "../../components/Zooming/ImageZoom";

const ManageFlightData = () => {
  const [listScheduleByDay, setListScheduleByDay] = useState<
    HomePageApiResponseType[]
  >([]);
  const [scheduleId, setScheduleId] = useState<null | number>(null);
  const [listScheduleByHour, setListScheduleByHour] = useState<
    SupervisionSchedulesResponseType[]
  >([]);
  const [missionId, setMissionId] = useState<null | number>(null);
  const [listImageByMission, setListImageByMission] = useState<
    SupervisionDetailsResponseType[]
  >([]);
  const [imageType, setImageType] = useState("all");

  // pagination
  const [page, setPage] = useState(1); // Current page
  const imagesPerPage = 12; // Number of images per page

  // Calculate total number of pages
  const totalPages =
    listImageByMission && listImageByMission.length > 0
      ? Math.ceil(listImageByMission.length / imagesPerPage)
      : 0;

  const [openZoomingImg, setOpenZoomingImg] = useState("");

  const location = useLocation();

  // --------- Ham de xu ly chuyen trang pagination --------
  const handlePageChange = (
    _: React.ChangeEvent<unknown>,
    newPage: number
  ): void => {
    setPage(newPage);
  };

  const handleClickMission = (ScheduleId: number) => {
    setScheduleId(ScheduleId === scheduleId ? null : ScheduleId);
  };

  const handleClickMissionDetail = (MissionId: number) => {
    setMissionId(MissionId);
  };

  useEffect(() => {
    resetHasShownLostConnectionToServerToast();
  }, [location]);

  useEffect(() => {
    const getListMissionByDay = async () => {
      const response = await HomePageApiService.getAllData();
      if (response) {
        setListScheduleByDay(response);
        setScheduleId(response[0].schedule_id);
      }
    };
    getListMissionByDay();
  }, []);

  useEffect(() => {
    const getListMissionByHour = async () => {
      const response = await SupervisionSchedulesService.getAllData(scheduleId);
      if (response) {
        setListScheduleByHour(response);
        setMissionId(response[0].mission_id);
      }
    };
    if (scheduleId) {
      getListMissionByHour();
    }
  }, [scheduleId]);

  useEffect(() => {
    const getListImageByMission = async () => {
      const response = await SupervisionDetailsService.getData({
        supervisionDetailsEndpoint: `supervisiondetails/?mission_id=${missionId}&img_label=${imageType}`,
      });
      if (response) {
        setListImageByMission(response);
        setPage(1);
      }
    };
    if (missionId) {
      getListImageByMission();
    }
  }, [missionId, imageType]);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2}>
        <Grid
          size={2.5}
          className="w-[90%] h-[calc(100vh-65px)] flex justify-center items-center"
        >
          <div
            className="w-[85%] h-[80%] bg-gray-200 !mx-auto overflow-y-auto 
          rounded-lg"
          >
            <div
              className="bg-green-500 flex justify-center items-center w-[80%] h-12 
            p-1 rounded-lg !mx-auto !my-4 text-xl text-white font-bold"
            >
              <span>Ngày kiểm tra</span>
            </div>
            {listScheduleByDay &&
              listScheduleByDay.length > 0 &&
              listScheduleByDay.map((mission, index) => (
                <div
                  key={index}
                  className="bg-white w-[90%] min-h-fit rounded-lg !mx-auto !my-4 !py-2"
                >
                  <div
                    className="w-full min-h-14 flex justify-evenly items-center"
                    onClick={() => handleClickMission(mission.schedule_id)}
                  >
                    <div className="bg-green-300 w-10 h-10 flex justify-evenly items-center rounded-lg">
                      <img
                        src={MissionIcon}
                        srcSet={MissionIcon}
                        alt="mission icon"
                      />
                    </div>
                    <span className="text-2xl font-bold">
                      {mission.implementation_date}
                    </span>
                    {mission.schedule_id === scheduleId ? (
                      <ArrowDropDownIcon />
                    ) : (
                      <ArrowDropUpIcon />
                    )}
                  </div>
                  {listScheduleByHour &&
                    listScheduleByHour.length > 0 &&
                    mission.schedule_id === scheduleId &&
                    listScheduleByHour.map((mission, index) => (
                      <div
                        key={index}
                        className={`w-[70%] h-11 flex items-center justify-center bg-gray-300 
                        !my-2.5 !mx-auto rounded-lg ${
                          mission.mission_id === missionId
                            ? "border-2 border-red-300"
                            : ""
                        }`}
                        onClick={() => {
                          handleClickMissionDetail(mission.mission_id);
                        }}
                      >
                        <img
                          className="w-11 h-10"
                          src={FolderIcon}
                          srcSet={FolderIcon}
                          alt="mission icon"
                        />
                        <span>{mission.mission_name}</span>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </Grid>
        <Grid size={9.5}>
          {listImageByMission && listImageByMission.length > 0 ? (
            <>
              <div className="h-12 !my-1">
                <FormControl
                  sx={{ position: "absolute", right: 10, width: "200px" }}
                  variant="outlined"
                  size="small"
                >
                  <Select
                    value={imageType}
                    onChange={(event) => setImageType(event.target.value)}
                    defaultValue={""}
                  >
                    <MenuItem value={"all"}>Tất cả ảnh</MenuItem>
                    <MenuItem value={"tutap"}>Tụ tập</MenuItem>
                    <MenuItem value={"untac"}>Ùn tắc</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <ImageList
                cols={3}
                gap={20}
                sx={{
                  width: "100%",
                  height: "calc(100vh - 165px)",
                  overflowY: "auto",
                }}
              >
                {listImageByMission
                  .slice((page - 1) * imagesPerPage, page * imagesPerPage) // --------- xu ly pagination --------
                  .map((item, index) => (
                    // chinh lai height neu can
                    <ImageListItem key={index} className="!h-[319px]">
                      <TextField
                        label="Tình trạng"
                        value={item.image_title}
                        multiline
                        maxRows={1}
                        style={{
                          width: "40%",
                          marginTop: "7px",
                        }}
                        slotProps={{
                          input: {
                            style: {
                              height: "35px",
                            },
                          },
                        }}
                        disabled
                      />

                      <Button
                        className="!absolute top-[42px] right-0 z-3 !min-w-10 !w-10 
                        !h-10 !bg-white !border-none rounded-lg"
                        variant="outlined"
                        onClick={() =>
                          setOpenZoomingImg(
                            import.meta.env.VITE_API_URL + item.image_path
                          )
                        }
                      >
                        <CropFreeIcon color="action" />
                      </Button>
                      <ImageZoom
                        info={import.meta.env.VITE_API_URL + item.image_path}
                        openZoomingImg={openZoomingImg}
                        setOpenZoomingImg={setOpenZoomingImg}
                      />

                      <img
                        className="w-full h-full rounded-lg"
                        src={import.meta.env.VITE_API_URL + item.image_path}
                        srcSet={import.meta.env.VITE_API_URL + item.image_path}
                        alt={item.image_name}
                        loading="lazy"
                      />
                    </ImageListItem>
                  ))}
              </ImageList>

              <Pagination
                variant="outlined"
                shape="rounded"
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                sx={{
                  height: "30px",
                  display: "flex",
                  justifyContent: "center",
                  my: 1,
                }}
              />
            </>
          ) : (
            <div className="w-full h-full flex justify-center items-center">
              <p className="text-3xl">Không có dữ liệu !</p>
            </div>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ManageFlightData;
