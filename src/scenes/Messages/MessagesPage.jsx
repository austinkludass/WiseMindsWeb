import { Box, useTheme, Paper } from "@mui/material";
import { tokens } from "../../theme";
import Noticeboard from "../../components/Dashboard/Noticeboard";

const MessagesPage = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box>
      <Paper
        sx={{
          height: "calc(100vh - 70px)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Noticeboard />
      </Paper>
    </Box>
  );
};

export default MessagesPage;
