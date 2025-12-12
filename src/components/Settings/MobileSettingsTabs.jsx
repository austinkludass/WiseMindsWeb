import { Box, Tabs, Tab } from "@mui/material";

const tabs = [
  "permissions",
  "integrations",
  "general",
  "notifications",
  "profile",
];

const MobileSettingsTabs = ({ selected, onSelect }) => {
  const tabIndex = tabs.indexOf(selected);

  return (
    <Box
      sx={{
        display: { xs: "block", md: "none" },
        mb: 2,
      }}
    >
      <Tabs
        value={tabIndex >= 0 ? tabIndex : 0}
        onChange={(e, newIndex) => {
          onSelect(tabs[newIndex]);
        }}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
      >
        <Tab label="Permissions" />
        <Tab label="Integrations" />
        <Tab label="General" />
        <Tab label="Notifications" />
        <Tab label="Profile" />
      </Tabs>
    </Box>
  );
};

export default MobileSettingsTabs;
