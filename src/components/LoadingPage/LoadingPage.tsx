import { useEffect, useState, useRef } from "react";
import { Box } from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

const Loading = () => {
  const [progress, setProgress] = useState(0);
  const [buffer, setBuffer] = useState(10);

  const progressRef = useRef(() => {});
  useEffect(() => {
    progressRef.current = () => {
      if (progress > 100) {
        setProgress(0);
        setBuffer(10);
      } else {
        const diff = Math.random() * 20;
        const diff2 = Math.random() * 20;
        setProgress(progress + diff);
        setBuffer(progress + diff + diff2);
      }
    };
  });

  useEffect(() => {
    const timer = setInterval(() => {
      progressRef.current();
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Box
      style={{
        position: "absolute",
        top: -64,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: "9999",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
      }}
    >
      <Box sx={{ width: "60%" }}>
        <LinearProgress
          variant="buffer"
          value={progress}
          valueBuffer={buffer}
          sx={{ height: "8px" }}
        />
      </Box>
    </Box>
  );
};

export default Loading;
