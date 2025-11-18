import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
} from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import PersonIcon from "@mui/icons-material/Person";

const tabs = [
  { key: "permissions", label: "Permissions", icon: <SecurityIcon /> },
  { key: "general", label: "General", icon: <SettingsIcon /> },
  { key: "notifications", label: "Notifications", icon: <NotificationsIcon /> },
  { key: "profile", label: "Profile", icon: <PersonIcon /> },
];

const SettingsSidebar = ({ selected, onSelect }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: "220px",
        borderRight: `1px solid ${theme.palette.divider}`,
        flexShrink: 0,
        display: { xs: "none", md: "block" },
      }}
    >
      <List>
        {tabs.map((tab) => (
          <ListItemButton
            key={tab.key}
            selected={selected === tab.key}
            onClick={() => onSelect(tab.key)}
            sx={{
              borderRadius: "8px",
              mx: 1,
              my: 0.5,
            }}
          >
            <ListItemIcon>{tab.icon}</ListItemIcon>
            <ListItemText primary={tab.label} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );
};

export default SettingsSidebar;
