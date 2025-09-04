import { Box, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BookIcon from "@mui/icons-material/Book";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import React, { useState, useEffect, useRef } from "react";

const EventCard = React.memo(({ event }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCompact, setIsCompact] = useState(false);
  const [reportAnchor, setReportAnchor] = useState(null);
  const [cancelAnchor, setCancelAnchor] = useState(null);
  const cardRef = useRef(null);

  const menuOpen = Boolean(anchorEl);
  const reportMenuOpen = Boolean(reportAnchor);
  const cancelMenuOpen = Boolean(cancelAnchor);

  // useEffect(() => {
  //   const el = cardRef.current;
  //   if (!el) return;

  //   const observer = new ResizeObserver(([entry]) => {
  //     const width = entry.contentRect.width;
  //     setIsCompact(width < 60);
  //   });

  //   observer.observe(el);
  //   return () => observer.disconnect();
  // }, []);

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
      {!isCompact ? (
        <>
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
        </>
      ) : (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="flex-start"
          gap={0.5}
        >
          <Tooltip title={event.subjectGroupName}>
            <BookIcon fontSize="small" />
          </Tooltip>
          <Tooltip title={event.tutorName}>
            <SchoolOutlinedIcon fontSize="small" />
          </Tooltip>
          <Tooltip title={event.studentNames?.join(", ")}>
            <GroupsOutlinedIcon fontSize="small" />
          </Tooltip>
        </Box>
      )}

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleCloseMenu}
        onClick={(e) => e.stopPropagation()}
      >
        <MenuItem
          onClick={() => {
            console.log("View", event);
            handleCloseMenu();
          }}
        >
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
            console.log("Edit", event);
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
          {event.studentNames?.map((student) => (
            <MenuItem
              key={student}
              onClick={() => {
                console.log("Report:", student, event);
                handleCloseMenu();
              }}
            >
              {student}
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
