import { Box, useTheme, useMediaQuery } from "@mui/material";
import Header from "../../components/Global/Header";
import { tokens } from "../../theme";
import Noticeboard from "../../components/Dashboard/Noticeboard";
import Summaryboard from "../../components/Dashboard/Summaryboard";
import UpcomingLessons from "../../components/Dashboard/UpcomingLessons";
import Notifications from "../../components/Dashboard/Notifications";

const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to Wise Minds Admin" />
      </Box>

      <Box
        display="grid"
        gridTemplateColumns={isMobile ? "1fr" : "repeat(12, 1fr)"}
        gridTemplateRows={isMobile ? "repeat(5, 300px) 600px repeat(3, 300px)" : "200px 400px 200px"}
        gap="20px"
      >
        {/* Row 1 */}
        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Summaryboard />
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Summaryboard />
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Summaryboard />
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 3"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Summaryboard />
        </Box>

        {/* Row 2 */}
        <Box
          gridColumn={isMobile ? "span 1" : "span 6"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <UpcomingLessons />
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 6"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Noticeboard />
        </Box>

        {/* Row 3 */}
        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Notifications />
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Summaryboard />
        </Box>

        <Box
          gridColumn={isMobile ? "span 1" : "span 4"}
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
          overflow="hidden"
        >
          <Summaryboard />
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
