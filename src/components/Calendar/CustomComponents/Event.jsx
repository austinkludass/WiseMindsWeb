import { Box, Menu, MenuItem, Typography } from "@mui/material";
import React, { useState, useRef } from "react";

const EventCard = React.memo(({ event, onView, onEdit, onReport }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [reportAnchor, setReportAnchor] = useState(null);
  const [cancelAnchor, setCancelAnchor] = useState(null);
  const cardRef = useRef(null);

  const menuOpen = Boolean(anchorEl);
  const reportMenuOpen = Boolean(reportAnchor);
  const cancelMenuOpen = Boolean(cancelAnchor);

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
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setReportAnchor(null);
    setCancelAnchor(null);
  };

  return (
    <Box
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      height="100%"
      sx={{ bgcolor: event.tutorColor ?? event.tutorColor, pl: 0.5, pt: 1 }}
    >
      <Typography variant="subtitle2" noWrap>
        {event.subjectGroupName}
      </Typography>
      <Typography variant="caption" noWrap>
        {event.tutorName}
      </Typography>
      {event.studentNames?.map((student) => (
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
            onView?.(event);
            handleCloseMenu();
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            onEdit?.(event);
            handleCloseMenu();
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("Delete", event);
            handleCloseMenu();
          }}
        >
          Delete
        </MenuItem>

        <MenuItem onClick={(e) => setReportAnchor(e.currentTarget)}>
          Report
        </MenuItem>
        <Menu
          anchorEl={reportAnchor}
          open={reportMenuOpen}
          onClose={() => setReportAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          {event.reports?.map((report) => (
            <MenuItem
              key={report.studentId}
              onClick={() => {
                onReport?.(event, report);
                handleCloseMenu();
              }}
            >
              {report.studentName}
            </MenuItem>
          ))}
        </Menu>

        <MenuItem onClick={(e) => setCancelAnchor(e.currentTarget)}>
          Cancel
        </MenuItem>
        <Menu
          anchorEl={cancelAnchor}
          open={cancelMenuOpen}
          onClose={() => setCancelAnchor(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        >
          {event.studentNames?.map((student) => (
            <MenuItem
              key={student}
              onClick={() => {
                console.log("Cancel:", student, event);
                handleCloseMenu();
              }}
            >
              {student}
            </MenuItem>
          ))}
        </Menu>
      </Menu>
    </Box>
  );
});

export default EventCard;
