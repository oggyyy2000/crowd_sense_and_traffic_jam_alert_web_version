import { CountObjectType } from "../../types/global/WSData.type";

interface ObjectCountPanelProps {
  objCount: CountObjectType;
  flightMethod: string;
  trafficDensity: string;
}
const ObjectCountPanel = ({
  objCount,
  flightMethod,
  trafficDensity,
}: ObjectCountPanelProps) => {
  const trafficData = [
    {
      icon: "👤",
      label: "người",
      count: objCount && objCount.people >= 0 ? objCount.people : 0,
    },
    {
      icon: "🚲",
      label: "xe đạp",
      count: objCount && objCount.bicycle >= 0 ? objCount.bicycle : 0,
    },
    {
      icon: "🚗",
      label: "ô tô",
      count: objCount && objCount.car >= 0 ? objCount.car : 0,
    },
    {
      icon: "🚚",
      label: "xe tải",
      count: objCount && objCount.truck >= 0 ? objCount.truck : 0,
    },
    {
      icon: "🛺",
      label: "xe ba bánh",
      count: objCount && objCount.tricycle >= 0 ? objCount.tricycle : 0,
    },
    {
      icon: "🚌",
      label: "xe buýt",
      count: objCount && objCount.bus >= 0 ? objCount.bus : 0,
    },
    {
      icon: "🏍️",
      label: "xe máy",
      count: objCount && objCount.motor >= 0 ? objCount.motor : 0,
    },
  ];

  const crowdSenseData = {
    icon: "👤",
    label: "người",
    count: objCount && objCount.people,
  };

  if (flightMethod === "traffic") {
    return (
      <div
        className="absolute z-3 top-40 right-[17px] bg-white border-2 
          border-red-400 opacity-90 rounded-lg shadow !p-4 w-55 flex flex-wrap justify-center"
      >
        {/* UN TAC */}
        {trafficDensity === "congested" && (
          <>
            <p className="text-lg text-gray-800 text-center">
              Tình trạng giao thông:{" "}
              <span className="font-bold text-gray-800">Ùn tắc</span>
            </p>
            <div className="w-full h-2 bg-red-500 !my-1"></div>
          </>
        )}
        {/* LUU THONG CHAM */}
        {trafficDensity === "normal" && (
          <>
            <p className="text-lg text-gray-800 text-center">
              Tình trạng giao thông:{" "}
              <span className="font-bold text-gray-800">Lưu thông chậm</span>
            </p>
            <div className="w-full h-2 bg-yellow-500 !my-1"></div>
          </>
        )}
        {/* THONG THOANG */}
        {trafficDensity === "clear" && (
          <>
            <p className="text-lg text-gray-800 text-center">
              Tình trạng giao thông:{" "}
              <span className="font-bold text-gray-800">Thông thoáng</span>
            </p>
            <div className="w-full h-2 bg-green-500 !my-1"></div>
          </>
        )}
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
  } else if (flightMethod === "people") {
    return (
      <div className="absolute z-3 top-40 right-[17px] bg-white border-2 border-red-400 opacity-90 rounded-lg shadow !p-4 w-45">
        <ul className="space-y-3">
          <li className="flex items-center">
            <span className="w-10 text-2xl mr-2">{crowdSenseData.icon}</span>{" "}
            {/* Larger icons */}
            <div>
              <p className="font-medium text-gray-800">
                {crowdSenseData.label}:{" "}
                {crowdSenseData.count >= 0 ? crowdSenseData.count : 0}
              </p>
            </div>
          </li>
        </ul>
      </div>
    );
  } else if (flightMethod === "fire_smoke" || flightMethod === "tracking") {
    return null;
  } else {
    return null;
  }
};

export default ObjectCountPanel;
