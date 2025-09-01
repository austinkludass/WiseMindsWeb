import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";

function EventCard({ event, onOpen }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const handleMouseDown = (e) => {
    if (e.button === 2) {
      e.stopPropagation();
    }
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClick = (e) => {
    if (menuOpen) {
      e.stopPropagation();
      return;
    }
    onOpen?.(event);
  };

  const handleCloseMenu = () => setAnchorEl(null);

  return (
    <Box
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      height="100%"
      sx={{ bgcolor: event.color ?? event.color, p: 1 }}
    >
      <Typography variant="subtitle2" noWrap>
        {event.subject}
      </Typography>
      <Typography variant="subtitle2" noWrap>
        {event.tutor}
      </Typography>
      {event.students?.map((student) => (
        <Typography key={student} variant="caption" display="block" noWrap>
          {student}
        </Typography>
      ))}

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            onOpen?.(event);
            handleCloseMenu();
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("Delete", event);
            handleCloseMenu();
          }}
        >
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default EventCard;
