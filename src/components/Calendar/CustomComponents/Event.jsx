import { Box, Menu, MenuItem, Typography } from "@mui/material";
import { useState } from "react";

function EventCard({ event }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const handleContextMenu = (e) => {
    e.preventDefault();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => setAnchorEl(null);

  return (
    <Box
      onContextMenu={handleContextMenu}
      height="100%"
      sx={{ bgcolor: event.color ?? event.color, padding: "8px" }}
    >
      <Typography variant="subtitle2" noWrap>
        {event.subject}
      </Typography>
      <Typography variant="subtitle2" noWrap>
        {event.tutor}
      </Typography>
      {event.students &&
        event.students.map((student) => (
          <Typography key={student} variant="caption" display="block" noWrap>
            {student}
          </Typography>
        ))}

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            console.log("View", event);
            handleClose();
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("Delete", event);
            handleClose();
          }}
        >
          Delete
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("Move", event);
            handleClose();
          }}
        >
          Move
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default EventCard;
