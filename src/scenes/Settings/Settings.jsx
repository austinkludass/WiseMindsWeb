import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../theme";
import Header from "../../components/Global/Header";

const Settings = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box display="flex" m="20px">
      <Header title="SETTINGS" subtitle="Wise Minds Admin Settings" />
    </Box>
  );
};

export default Settings;
