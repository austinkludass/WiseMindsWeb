import { Box, Tabs, Tab } from "@mui/material";

const MobileSettingsTabs = ({ selected, onSelect }) => {
  const tabIndex = [
    "permissions",
    "general",
    "notifications",
    "profile",
  ].indexOf(selected);

  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        mb: 2,
      }}
    >
      <Tabs
        value={tabIndex}
        onChange={(e, newIndex) => {
          const mapping = [
            "permissions",
            "general",
            "notifications",
            "profile",
          ];
          onSelect(mapping[newIndex]);
        }}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
      >
        <Tab label="Permissions" />
        <Tab label="General" />
        <Tab label="Notifications" />
        <Tab label="Profile" />
      </Tabs>
    </Box>
  );
};

export default MobileSettingsTabs;
