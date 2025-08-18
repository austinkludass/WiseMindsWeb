import { useState } from "react";
import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import "react-pro-sidebar/dist/css/styles.css";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link } from "react-router-dom";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CorporateFareOutlinedIcon from "@mui/icons-material/CorporateFareOutlined";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import OwlFacts from "../../components/Global/OwlFacts";
import { SettingsOutlined } from "@mui/icons-material";

const Item = ({ title, to, icon, selected, setSelected }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  return (
    <MenuItem
      active={selected === title}
      style={{ color: colors.grey[100] }}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: `${colors.orangeAccent[400]} !important`,
        },
        "& .pro-menu-item.active": {
          color: `${colors.orangeAccent[400]} !important`,
        },
        "& .pro-inner-item:focus": {
          color: `${colors.textColor[400]} !important`,
        },
        "& .pro-arrow": {
          display: "none !important",
        },
      }}
    >
      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{ margin: "10px 0 20px 0", color: colors.grey[100] }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h3" color={colors.grey[100]}></Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {!isCollapsed && (
            <>
              <Box mb="25px">
                <Box display="flex" justifyContent="center" alignItems="center">
                  <OwlFacts />
                </Box>

                <Box textAlign="center">
                  <Typography
                    variant="h2"
                    color={colors.grey[100]}
                    fontWeight="bold"
                    sx={{ m: "10px 0 0 0" }}
                  >
                    Wise Minds
                  </Typography>
                  <Typography variant="h5" color={colors.orangeAccent[400]}>
                    Admin
                  </Typography>
                </Box>
              </Box>
              <Box paddingLeft={"10%"}>
                <Item
                  title="Dashboard"
                  to="/"
                  icon={<HomeOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
                <SubMenu
                  title="Tutoring"
                  icon={<CalendarMonthOutlinedIcon />}
                  rootstyles={{ "pro-arrow": { display: "none" } }}
                  style={{ color: colors.grey[100] }}
                >
                  <Item
                    title="Calendar"
                    to="/calendar"
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Lessons"
                    to="/lessons"
                    selected={selected}
                    setSelected={setSelected}
                  />
                </SubMenu>
                <SubMenu
                  title="Administration"
                  icon={<PeopleAltOutlinedIcon />}
                  style={{ color: colors.grey[100] }}
                >
                  <Item
                    title="Tutors"
                    to="/tutors"
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Tutor Absences"
                    to="/tutorabsences"
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Students"
                    to="/students"
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Student Absences"
                    to="/studentabsences"
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Invoices"
                    to="/invoices"
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Payroll"
                    to="/payroll"
                    selected={selected}
                    setSelected={setSelected}
                  />
                </SubMenu>
                <SubMenu
                  title="Teaching"
                  icon={<MenuBookOutlinedIcon />}
                  style={{ color: colors.grey[100] }}
                >
                  <Item
                    title="Subjects"
                    to="/subjects"
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Feedback"
                    to="/feedback"
                    selected={selected}
                    setSelected={setSelected}
                  />
                  <Item
                    title="Wise Courses"
                    to="/wisecourses"
                    selected={selected}
                    setSelected={setSelected}
                  />
                </SubMenu>
                <SubMenu
                  title="Belconnen"
                  icon={<CorporateFareOutlinedIcon />}
                  style={{ color: colors.grey[100] }}
                >
                  <Item
                    title="Tutoring Bays"
                    to="/tutoringbays"
                    selected={selected}
                    setSelected={setSelected}
                  />
                </SubMenu>
                <Item
                  title="Settings"
                  to="/settings"
                  icon={<SettingsOutlined />}
                  selected={selected}
                  setSelected={setSelected}
                />
              </Box>
            </>
          )}
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
