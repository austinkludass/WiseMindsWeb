import { useState } from "react";
import { Box, useTheme } from "@mui/material";
import Header from "../../components/Global/Header";
import PermissionsTab from "../../components/Settings/PermissionsTab";
import SettingsSidebar from "../../components/Settings/SettingsSidebar";
import MobileSettingsTabs from "../../components/Settings/MobileSettingsTabs";

const Settings = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState("permissions");

  const renderTab = () => {
    switch (selectedTab) {
      case "permissions":
        return <PermissionsTab />;
      case "general":
        return <Box></Box>;
      case "notifications":
        return <Box></Box>;
      case "profile":
        return <Box></Box>;
      default:
        return null;
    }
  };

  return (
    <Box display="flex" m="20px" flexDirection="column">
      <Header title="SETTINGS" subtitle="Wise Minds Admin Settings" />

      <Box display="flex" mt={3} gap={2}>
        <SettingsSidebar selected={selectedTab} onSelect={setSelectedTab} />

        <Box flex={1}>
          <MobileSettingsTabs
            selected={selectedTab}
            onSelect={setSelectedTab}
          />

          {renderTab()}
        </Box>
      </Box>
    </Box>
  );
};

export default Settings;
