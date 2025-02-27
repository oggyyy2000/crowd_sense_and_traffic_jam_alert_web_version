import EventBusyIcon from "@mui/icons-material/EventBusy";

const HotKeyManual = () => {
  return (
    <>
      <div
        className="absolute z-3 top-[74px] right-[17px] bg-white 
      opacity-90 rounded-lg w-62 h-12 shadow-[0_2px_5px_rgba(0,0,0,0.15)] 
      flex justify-between items-center !p-2.5 border-[rgba(0,0,0,0.2)]"
      >
        <span className="font-medium grow-1">
          Nhấn phím <span style={{ color: "red" }}>ESC</span> để kết thúc
        </span>
        <span className="mr-2.5">
          <EventBusyIcon />
        </span>
      </div>
    </>
  );
};

export default HotKeyManual;
