import { useState } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import 'react-pro-sidebar/dist/css/styles.css';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CorporateFareOutlinedIcon from '@mui/icons-material/CorporateFareOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";

const Item = ({ title, to, icon, selected, setSelected }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    return (
        <MenuItem active={selected === title} style={{ color: colors.grey[100]}} onClick={() => setSelected(title)} icon={icon}>
            <Typography>{title}</Typography>
            <Link to={to} />
        </MenuItem>
    );
}


const Sidebar = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [selected, setSelected] = useState("Dashboard");

    return (
      <Box sx={{
        "& .pro-sidebar-inner": {
            background: `${colors.primary[400]} !important`
        },
        "& .pro-icon-wrapper": {
            backgroundColor: "transparent !important"
        },
        "& .pro-inner-item": {
            padding: "5px 35px 5px 20px !important"
        },
        "& .pro-inner-item:hover": {
            color: "#868dfb !important"
        },
        "& .pro-menu-item.active": {
            color: "#6870fa !important"
        },
      }}>
        <ProSidebar collapsed={isCollapsed}>
            <Menu iconShape="square">
              <MenuItem onClick={() => setIsCollapsed(!isCollapsed)} icon={isCollapsed ? <MenuOutlinedIcon /> : undefined} style={{ margin: "10px 0 20px 0", color: colors.grey[100] }}>
                {!isCollapsed && (
                    <Box display="flex" justifyContent="space-between" alignItems="center" ml="15px">
                        <Typography variant="h3" color={colors.grey[100]}>
                            
                        </Typography>
                        <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                            <MenuOutlinedIcon />
                        </IconButton>
                    </Box>
                )}
              </MenuItem>

              {!isCollapsed && (
                <Box mb="25px">
                    <Box display="flex" justifyContent="center" alignItems="center">
                        <img alt="profile-user" width="100px" height="100px" src={`../../assets/wisemindslogo.png`} style={{ cursor: "pointer", borderRadius: "50%" }} />
                    </Box>

                    <Box textAlign="center">
                        <Typography variant="h2" color={colors.grey[100]} fontWeight="bold" sx={{ m: "10px 0 0 0" }}>
                            Wise Minds
                        </Typography>
                        <Typography variant="h5" color={colors.orangeAccent[400]}>
                            Belconnen
                        </Typography>
                    </Box>
                </Box>
              )}

              <Box paddingLeft={isCollapsed ? undefined : "10%"}>
                <Item title="Dashboard" to="/" icon={<HomeOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Tutoring" to="/tutoring" icon={<CalendarMonthOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Administration" to="/administration" icon={<PeopleAltOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Teaching" to="/teaching" icon={<MenuBookOutlinedIcon />} selected={selected} setSelected={setSelected} />
                <Item title="Belconnen" to="/belconnen" icon={<CorporateFareOutlinedIcon />} selected={selected} setSelected={setSelected} />
              </Box>
            </Menu>
        </ProSidebar>
      </Box>
    );
};

export default Sidebar;