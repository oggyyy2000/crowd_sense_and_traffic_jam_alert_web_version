import Flight from "../features/Flight/Flight";
import ManageFlightData from "../features/ManageFlightData/ManageFlightData";

import ErrorPage from "../components/ErrorPage/ErrorPage";
import Redirect404 from "../components/ErrorPage/Redirect404";

const publicRoutes = [
  { path: "/", component: Flight },
  // failed => navigate to error tabs
  { path: "/404", component: ErrorPage },
  { path: "*", component: Redirect404 },
];

const privateRoutes = [
  {
    path: "/Flight",
    component: Flight,
  },
  {
    path: "/ManageFlightData",
    component: ManageFlightData,
  },
];

export { publicRoutes, privateRoutes };
