import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";

const UpcomingLessons = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box
      width="100%"
      height="100%"
      p="20px"
      bgcolor={colors.primary[400]}
      borderRadius="8px"
      overflow="auto"
    >
      <Typography variant="h3" mb="16px" color={colors.orangeAccent[400]}>
        Upcoming Lessons
      </Typography>
    </Box>
  );
};

export default UpcomingLessons;
