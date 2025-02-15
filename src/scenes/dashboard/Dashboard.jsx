import { Box, useTheme } from "@mui/material";
import Header from "../../components/Header";
import { tokens } from "../../theme";
import Noticeboard from "../../components/Noticeboard";
import Summaryboard from "../../components/Summaryboard";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to Wise Minds Admin" />
      </Box>

      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* Row 1 */}
        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="500px"
          overflow="hidden"
        >
          <Summaryboard />
        </Box>

        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        ></Box>

        <Box
          gridColumn="span 4"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          height="500px"
          overflow="hidden"
        >
          <Noticeboard />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
