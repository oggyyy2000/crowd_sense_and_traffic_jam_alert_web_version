import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { GlobalStateContext } from "../../utils/context/Contexts";

import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Dialog,
  DialogTitle,
  Button,
  DialogContent,
  Input,
  DialogActions,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SettingsIcon from "@mui/icons-material/Settings";
import CloseIcon from "@mui/icons-material/Close";
import Logo_white from "../../assets/images/drone_logo_white.svg";

import * as SettingWorkstationService from "../../APIServices/SettingWorkstation.api";
import { toast } from "react-toastify";

const pages = [
  {
    index: 0,
    ten_navbar: "Bay",
    url: "/Flight",
  },
  {
    index: 1,
    ten_navbar: "Quản lý dữ liệu",
    url: "/ManageFlightData",
  },
];

const Navbar = () => {
  const [anchorElNav, setAnchorElNav] = useState<null | HTMLElement>(null);

  // setting variable
  const [openUserAccountSetting, setOpenUserAccountSetting] = useState(false);
  const [peopleWarning, setPeopleWarning] = useState("");
  const [trafficWarning, setTrafficWarning] = useState("");

  const globalStateContext = useContext(GlobalStateContext);
  const startFly = globalStateContext?.startFly;

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleUpdateSetting = async () => {
    const formData = new FormData();
    formData.append("people_warning", peopleWarning);
    formData.append("traffic_warning", trafficWarning);
    const response = await SettingWorkstationService.postData({
      data: formData,
      options: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    });
    if (response) {
      toast.success(String(response));
    }
  };

  useEffect(() => {
    if (openUserAccountSetting) {
      const getDefaultSetting = async () => {
        const response = await SettingWorkstationService.getAllData();
        if (response) {
          console.log("response: ", response);
          setPeopleWarning(response.people_warning);
          setTrafficWarning(response.traffic_warning);
        }
      };
      getDefaultSetting();
    }
  }, [openUserAccountSetting]);
  return (
    <>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* responsive nav */}
            <img
              className="w-12 h-12 max-sm:hidden sm:hidden md:flex md:mr-1"
              src={Logo_white}
              alt="logo"
            />
            <Typography
              variant="h6"
              noWrap
              component="a"
              sx={{
                ml: 2,
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              SMWORKSTATION
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>

              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "left",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "left",
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: "block", md: "none" },
                }}
              >
                {pages.map((page) => (
                  <Link
                    className={`flex !p-[10px] no-underline text-black w-full 
                  h-full cursor-pointer select-none text-center text-[0.975rem] 
                  leading-[1.75] rounded-[4px] transition-all 
                  duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] 
                  hover:no-underline hover:bg-[rgba(0,0,0,0.1)] ${
                    startFly
                      ? page.ten_navbar !== "Bay"
                        ? "pointer-events-none opacity-20"
                        : "pointer-events-none"
                      : ""
                  }`}
                    onClick={handleCloseNavMenu}
                    key={page.index}
                    to={page.url}
                  >
                    {page.ten_navbar}
                  </Link>
                ))}
              </Menu>
            </Box>
            {/* main nav */}
            <img
              className="w-12 h-12 sm:flex sm:mr-1 md:hidden"
              src={Logo_white}
              alt="logo"
            />
            <Typography
              variant="h5"
              noWrap
              component="a"
              sx={{
                ml: 2,
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              SMWORKSTATION
            </Typography>

            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              {pages.map((page) => (
                <Link
                  className={`relative box-border bg-transparent outline-none 
                        border-none m-0 cursor-pointer select-none no-underline 
                        text-center font-['Roboto'] font-medium text-[0.875rem] 
                        leading-[1.75] uppercase min-w-[64px] !px-[8px] !py-[6px] 
                        rounded-[4px] transition-all duration-[250ms] [transition-timing-function:cubic-bezier(0.4,0,0.2,1)] 
                        !ml-[32px] text-white block hover:no-underline 
                        hover:bg-[rgba(255,255,255,0.1)] active:no-underline 
                        active:bg-[rgba(255,255,255,0.1)] ${
                          startFly
                            ? page.ten_navbar !== "Bay"
                              ? "pointer-events-none opacity-20"
                              : "pointer-events-none"
                            : ""
                        }`}
                  key={page.index}
                  to={page.url}
                >
                  {page.ten_navbar}
                </Link>
              ))}
            </Box>

            <Box>
              <IconButton
                onClick={() => setOpenUserAccountSetting(true)}
                sx={{ p: 1 }}
                title="Cài đặt"
              >
                <SettingsIcon fontSize="large" style={{ color: "white" }} />
              </IconButton>
              <Dialog open={openUserAccountSetting} fullWidth maxWidth={"xs"}>
                <DialogTitle
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    backgroundColor: "#1976d2",
                    color: "white",
                    textTransform: "uppercase",
                  }}
                >
                  Cài đặt
                  <Button
                    color="error"
                    variant="contained"
                    sx={{
                      position: "absolute",
                      right: "5px",
                      top: "5px",
                      height: "25px",
                      padding: "0 13px",
                      minWidth: "10px !important",
                      width: "20px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyItems: "center",
                    }}
                    onClick={() => setOpenUserAccountSetting(false)}
                  >
                    <CloseIcon fontSize="small" />
                  </Button>
                </DialogTitle>
                <DialogContent>
                  <div>
                    <div style={{ textAlign: "center" }}>
                      <span>Số người cảnh báo đám đông</span>
                      <Input
                        value={peopleWarning}
                        size="small"
                        onChange={(e) => setPeopleWarning(e.target.value)}
                        inputProps={{
                          step: 1,
                          min: 0,
                          max: 1000,
                          type: "number",
                          "aria-labelledby": "input-slider",
                          name: "peopleWarning", // Add a unique name for identification
                        }}
                        style={{ width: "40px", marginLeft: "10px" }}
                      />
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <span>Số xe để cảnh báo có ùn tắc</span>
                      <Input
                        value={trafficWarning}
                        size="small"
                        onChange={(e) => setTrafficWarning(e.target.value)}
                        inputProps={{
                          step: 1,
                          min: 0,
                          max: 1000,
                          type: "number",
                          "aria-labelledby": "input-slider",
                          name: "trafficWarning", // Add a unique name for identification
                        }}
                        style={{ width: "40px", marginLeft: "10px" }}
                      />
                    </div>
                  </div>
                </DialogContent>
                <DialogActions style={{ justifyContent: "center" }}>
                  <Button
                    onClick={handleUpdateSetting}
                    color="primary"
                    variant="contained"
                    disabled={startFly ? true : false}
                  >
                    Cập nhật cài đặt
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </>
  );
};

export default Navbar;
