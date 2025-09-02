import { Box, Menu, MenuItem, Tooltip, Typography } from "@mui/material";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import BookIcon from "@mui/icons-material/Book";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import React, { useState, useEffect, useRef } from "react";

const EventCard = React.memo(({ event, onOpen }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [isCompact, setIsCompact] = useState(false);
  const cardRef = useRef(null);

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width;
      setIsCompact(width < 60);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
      ref={cardRef}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenu}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      height="100%"
      sx={{ bgcolor: event.color ?? event.color, pl: 0.5, pt: 1 }}
    >
      {!isCompact ? (
        <>
          <Typography variant="subtitle2" noWrap>
            {event.subject}
          </Typography>
          <Typography variant="caption" noWrap>
            {event.tutor}
          </Typography>
          {event.students?.map((student) => (
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
          <Tooltip title={event.subject}>
            <BookIcon fontSize="small" />
          </Tooltip>
          <Tooltip title={event.tutor}>
            <SchoolOutlinedIcon fontSize="small" />
          </Tooltip>
          <Tooltip title={event.students?.join(", ")}>
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
});

export default EventCard;
