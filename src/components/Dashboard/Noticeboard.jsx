import { useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Tooltip,
  Popover,
  Menu,
  MenuItem,
  LinearProgress,
  Chip,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import TagIcon from "@mui/icons-material/Tag";
import LockIcon from "@mui/icons-material/Lock";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
import PeopleOutlineIcon from "@mui/icons-material/PeopleOutline";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import DescriptionIcon from "@mui/icons-material/Description";
import ImageIcon from "@mui/icons-material/Image";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import { tokens } from "../../theme";
import { AuthContext } from "../../context/AuthContext";
import {
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, sb } from "../../data/firebase";
import { format } from "date-fns";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";
import useUnreadCounts from "../../hooks/useUnreadCounts";
import "react-toastify/dist/ReactToastify.css";

const CHANNEL_ACCESS = {
  admins: ["Admin"],
  "head-tutors": ["Admin", "Head Tutor"],
  "senior-tutors": ["Admin", "Head Tutor", "Senior Tutor"],
  minions: ["Admin", "Minion"],
  "outside-of-work": ["Admin", "Head Tutor", "Senior Tutor", "Tutor", "Minion"],
  cover: ["Admin", "Head Tutor", "Senior Tutor", "Tutor", "Minion"],
  all: ["Admin", "Head Tutor", "Senior Tutor", "Tutor", "Minion"],
};

const CHANNEL_LABELS = {
  admins: "Admins",
  "head-tutors": "Head Tutors",
  "senior-tutors": "Senior Tutors",
  minions: "Minions",
  "outside-of-work": "Outside of Work",
  cover: "Cover",
  all: "All",
};

const PRIVATE_CHANNELS = ["admins", "head-tutors", "senior-tutors", "minions"];

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const DRAWER_WIDTH = 240;
const SENIOR_TUTOR_DM_COLLECTION = "seniorTutorDMs";

const getAccessibleChannels = (role) =>
  Object.entries(CHANNEL_ACCESS)
    .filter(([, roles]) => roles.includes(role))
    .map(([channelId]) => channelId);

const getChannelMembers = (channelId, tutors) => {
  const allowedRoles = CHANNEL_ACCESS[channelId] || [];
  return tutors
    .filter((t) => allowedRoles.includes(t.role))
    .sort((a, b) => a.firstName.localeCompare(b.firstName));
};

const getDmId = (uid1, uid2) => [uid1, uid2].sort().join("_");
const getCurrentWeekKey = () => dayjs().startOf("week").format("YYYY-MM-DD");

const formatBytes = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const isImageType = (type) => type?.startsWith("image/");

const getFileIcon = (type) => {
  if (!type) return <InsertDriveFileIcon />;
  if (type.startsWith("image/")) return <ImageIcon />;
  if (type === "application/pdf") return <PictureAsPdfIcon />;
  if (type.includes("sheet") || type.includes("excel"))
    return <TableChartIcon />;
  if (type.includes("word") || type.includes("document"))
    return <DescriptionIcon />;
  return <InsertDriveFileIcon />;
};

const getStoragePath = (
  activeDM,
  activeChannel,
  currentUserUid,
  messageId,
  filename
) => {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  if (activeDM) {
    const dmId = getDmId(currentUserUid, activeDM.uid);
    return `chat-attachments/dms/${dmId}/${messageId}_${safeName}`;
  }
  return `chat-attachments/channels/${activeChannel}/${messageId}_${safeName}`;
};

const LiveDot = ({ size = 8 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      borderRadius: "50%",
      bgcolor: "success.main",
      flexShrink: 0,
      animation: "livePulse 1.8s infinite",
      "@keyframes livePulse": {
        "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.7)" },
        "70%": { boxShadow: "0 0 0 6px rgba(34,197,94,0)" },
        "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
      },
    }}
  />
);

// Show members of a channel in a popover
const ChannelMembersPopover = ({
  anchorEl,
  onClose,
  channelId,
  tutors,
  colors,
}) => {
  const open = Boolean(anchorEl);
  const members = getChannelMembers(channelId, tutors);

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "center", horizontal: "right" }}
      transformOrigin={{ vertical: "center", horizontal: "left" }}
      slotProps={{
        paper: {
          sx: {
            bgcolor: colors.primary[400],
            backgroundImage: "none",
            borderRadius: "8px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            minWidth: 200,
            maxWidth: 260,
            ml: 1,
          },
        },
      }}
    >
      <Box p={1.5}>
        <Typography
          variant="overline"
          sx={{
            color: colors.orangeAccent[400],
            fontWeight: 700,
            letterSpacing: "0.1em",
            fontSize: "0.65rem",
            display: "block",
            mb: 1,
          }}
        >
          Members - {members.length}
        </Typography>

        {members.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontStyle: "italic", fontSize: "0.8rem" }}
          >
            No members found
          </Typography>
        ) : (
          <List dense disablePadding>
            {members.map((tutor) => {
              const initials = `${tutor.firstName[0]}${
                tutor.lastName ? tutor.lastName[0] : ""
              }`;
              return (
                <ListItem key={tutor.uid} disablePadding sx={{ mb: 0.5 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    px={0.5}
                    py={0.25}
                  >
                    <Avatar
                      src={tutor.avatar || undefined}
                      sx={{
                        width: 26,
                        height: 26,
                        fontSize: "0.65rem",
                        bgcolor: tutor.tutorColor || colors.orangeAccent[700],
                        color: "white",
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: "0.82rem", lineHeight: 1.2 }}
                      >
                        {tutor.firstName} {tutor.lastName}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontSize: "0.7rem" }}
                      >
                        {tutor.role}
                      </Typography>
                    </Box>
                  </Box>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>
    </Popover>
  );
};

// Sidebar component for noticeboard
const SidebarContent = ({
  colors,
  accessibleChannels,
  activeChannel,
  onSelectChannel,
  existingDMs,
  onSelectDM,
  activeDM,
  onNewDM,
  allTutors,
  seniorTutorAssignment,
  activeSeniorTutorDM,
  onSelectSeniorTutorDM,
  seniorTutorInboxSenders,
  isSeniorTutor,
  channelUnread = {},
  dmUnread = {},
  seniorDmUnread = {},
}) => {
  const [membersAnchorEl, setMembersAnchorEl] = useState(null);
  const [membersChannelId, setMembersChannelId] = useState(null);

  const handleMembersOpen = (event, channelId) => {
    event.stopPropagation();
    setMembersAnchorEl(event.currentTarget);
    setMembersChannelId(channelId);
  };

  const handleMembersClose = () => {
    setMembersAnchorEl(null);
    setMembersChannelId(null);
  };

  const noSeniorTutor = !seniorTutorAssignment?.tutorId;

  const badgeSx = {
    "& .MuiBadge-badge": {
      fontSize: "0.6rem",
      height: 16,
      minWidth: 16,
      padding: "0 3px",
    },
  };

  return (
    <Box
      sx={{
        width: DRAWER_WIDTH,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Channels Section */}
      <Box sx={{ px: 2, pt: 2, pb: 1 }}>
        <Typography
          variant="overline"
          sx={{
            color: colors.orangeAccent[400],
            fontWeight: 700,
            letterSpacing: "0.12em",
            fontSize: "0.65rem",
          }}
        >
          Channels
        </Typography>
      </Box>

      <List dense disablePadding>
        {accessibleChannels.map((channelId) => {
          const isPrivate = PRIVATE_CHANNELS.includes(channelId);
          const isActive =
            activeChannel === channelId && !activeDM && !activeSeniorTutorDM;
          return (
            <ListItem key={channelId} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => onSelectChannel(channelId)}
                sx={{
                  mx: 1,
                  borderRadius: "6px",
                  "&.Mui-selected": {
                    bgcolor: `${colors.orangeAccent[400]}22`,
                    "&:hover": { bgcolor: `${colors.orangeAccent[400]}33` },
                  },
                  "&:hover": {
                    bgcolor: colors.primary[400],
                    "& .members-btn": { opacity: 1 },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, overflow: "visible", ml: 0.5 }}>
                  <Badge
                    badgeContent={channelUnread[channelId] || 0}
                    color="error"
                    max={99}
                    sx={badgeSx}
                  >
                    {isPrivate ? (
                      <LockIcon
                        sx={{
                          fontSize: 16,
                          color: isActive
                            ? colors.orangeAccent[400]
                            : colors.grey[400],
                        }}
                      />
                    ) : (
                      <TagIcon
                        sx={{
                          fontSize: 16,
                          color: isActive
                            ? colors.orangeAccent[400]
                            : colors.grey[400],
                        }}
                      />
                    )}
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={CHANNEL_LABELS[channelId]}
                  slotProps={{
                    primary: {
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? colors.orangeAccent[400] : "inherit",
                    },
                  }}
                />
                <Tooltip title="View members" placement="right">
                  <IconButton
                    size="small"
                    className="members-btn"
                    onClick={(e) => handleMembersOpen(e, channelId)}
                    sx={{
                      opacity: 0,
                      transition: "opacity 0.15s",
                      p: 0.25,
                      ml: 0.5,
                      color: colors.grey[400],
                      "&:hover": { color: colors.orangeAccent[400] },
                    }}
                  >
                    <PeopleOutlineIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <ChannelMembersPopover
        anchorEl={membersAnchorEl}
        onClose={handleMembersClose}
        channelId={membersChannelId}
        tutors={allTutors}
        colors={colors}
      />

      <Divider sx={{ my: 1.5, borderColor: colors.primary[300] }} />

      {/* Direct Messages Section */}
      <Box
        sx={{
          px: 2,
          pb: 0.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: colors.orangeAccent[400],
            fontWeight: 700,
            letterSpacing: "0.12em",
            fontSize: "0.65rem",
          }}
        >
          Direct Messages
        </Typography>
        <Tooltip title="New Message" placement="right">
          <IconButton
            size="small"
            onClick={onNewDM}
            sx={{
              color: colors.grey[400],
              "&:hover": { color: colors.orangeAccent[400] },
              p: 0.25,
            }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <List dense disablePadding sx={{ flex: 1, overflowY: "auto" }}>
        {existingDMs.length === 0 && (
          <ListItem>
            <ListItemText
              primary="No messages yet"
              slotProps={{
                primary: {
                  fontSize: "0.75rem",
                  color: colors.grey[500],
                  fontStyle: "italic",
                },
              }}
            />
          </ListItem>
        )}
        {existingDMs.map((tutor) => {
          const isActive = activeDM?.uid === tutor.uid && !activeSeniorTutorDM;
          const initials = `${tutor.firstName[0]}${tutor.lastName ? tutor.lastName[0] : ""}`;
          return (
            <ListItem key={tutor.uid} disablePadding>
              <ListItemButton
                selected={isActive}
                onClick={() => onSelectDM(tutor)}
                sx={{
                  mx: 1,
                  borderRadius: "6px",
                  "&.Mui-selected": {
                    bgcolor: `${colors.orangeAccent[400]}22`,
                    "&:hover": { bgcolor: `${colors.orangeAccent[400]}33` },
                  },
                  "&:hover": { bgcolor: colors.primary[400] },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, overflow: "visible", ml: 0.5 }}>
                  <Badge
                    badgeContent={dmUnread[tutor.uid] || 0}
                    color="error"
                    overlap="circular"
                    max={99}
                    sx={badgeSx}
                  >
                    <Avatar
                      src={tutor.avatar || undefined}
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: "0.65rem",
                        bgcolor: tutor.tutorColor || colors.grey[600],
                        color: "white",
                      }}
                    >
                      {initials}
                    </Avatar>
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary={`${tutor.firstName} ${tutor.lastName}`}
                  slotProps={{
                    primary: {
                      fontSize: "0.85rem",
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? colors.orangeAccent[400] : "inherit",
                      noWrap: true,
                    },
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Live Senior Tutor */}
      <Divider sx={{ borderColor: colors.primary[300] }} />

      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 0.75,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <LiveDot />
        <Typography
          variant="overline"
          sx={{
            color: "success.main",
            fontWeight: 700,
            letterSpacing: "0.12em",
            fontSize: "0.65rem",
            lineHeight: 1,
          }}
        >
          Live Senior Tutor
        </Typography>
      </Box>

      <List dense disablePadding sx={{ pb: 1.5 }}>
        {isSeniorTutor ? (
          // ST sees separate conversation per sender
          seniorTutorInboxSenders.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No messages yet"
                slotProps={{
                  primary: {
                    fontSize: "0.75rem",
                    color: colors.grey[500],
                    fontStyle: "italic",
                  },
                }}
              />
            </ListItem>
          ) : (
            seniorTutorInboxSenders.map((sender) => {
              const isActive = activeSeniorTutorDM === sender.uid;
              const initials = `${sender.firstName[0]}${sender.lastName ? sender.lastName[0] : ""}`;
              return (
                <ListItem key={sender.uid} disablePadding>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => onSelectSeniorTutorDM(sender.uid)}
                    sx={{
                      mx: 1,
                      borderRadius: "6px",
                      "&.Mui-selected": {
                        bgcolor: "rgba(34,197,94,0.12)",
                        "&:hover": { bgcolor: "rgba(34,197,94,0.18)" },
                      },
                      "&:hover": { bgcolor: colors.primary[400] },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 36, overflow: "visible", ml: 0.5 }}>
                      <Badge
                        badgeContent={seniorDmUnread[sender.uid] || 0}
                        color="error"
                        overlap="circular"
                        max={99}
                        sx={badgeSx}
                      >
                        <Avatar
                          src={sender.avatar || undefined}
                          sx={{
                            width: 24,
                            height: 24,
                            fontSize: "0.65rem",
                            bgcolor: sender.tutorColor || colors.grey[600],
                            color: "white",
                          }}
                        >
                          {initials}
                        </Avatar>
                      </Badge>
                    </ListItemIcon>
                    <ListItemText
                      primary={`${sender.firstName} ${sender.lastName}`}
                      slotProps={{
                        primary: {
                          fontSize: "0.85rem",
                          fontWeight: isActive ? 600 : 400,
                          color: isActive ? "success.main" : "inherit",
                          noWrap: true,
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })
          )
        ) : (
          // Everyone else sees a single entry to message the ST
          <Tooltip
            title={
              noSeniorTutor
                ? "No senior tutor assigned this week"
                : `Message ${seniorTutorAssignment.tutorName}`
            }
            placement="right"
          >
            <span>
              <ListItemButton
                disabled={noSeniorTutor}
                selected={activeSeniorTutorDM === "self"}
                onClick={() => !noSeniorTutor && onSelectSeniorTutorDM("self")}
                sx={{
                  mx: 1,
                  borderRadius: "6px",
                  "&.Mui-selected": {
                    bgcolor: "rgba(34,197,94,0.12)",
                    "&:hover": { bgcolor: "rgba(34,197,94,0.18)" },
                  },
                  "&:hover": { bgcolor: colors.primary[400] },
                  "&.Mui-disabled": { opacity: 0.45 },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, overflow: "visible", ml: 0.5 }}>
                  <Badge
                    badgeContent={seniorDmUnread["self"] || 0}
                    color="error"
                    overlap="circular"
                    max={99}
                    sx={badgeSx}
                  >
                    <Avatar
                      sx={{
                        width: 24,
                        height: 24,
                        fontSize: "0.65rem",
                        bgcolor: noSeniorTutor
                          ? colors.grey[600]
                          : "success.dark",
                        color: "white",
                      }}
                    >
                      <SupportAgentIcon sx={{ fontSize: 14 }} />
                    </Avatar>
                  </Badge>
                </ListItemIcon>
                <ListItemText
                  primary="Senior Tutor"
                  secondary={
                    noSeniorTutor
                      ? "Not assigned"
                      : seniorTutorAssignment.tutorName
                  }
                  slotProps={{
                    primary: {
                      fontSize: "0.85rem",
                      fontWeight: activeSeniorTutorDM === "self" ? 600 : 400,
                      color:
                        activeSeniorTutorDM === "self"
                          ? "success.main"
                          : "inherit",
                    },
                    secondary: { fontSize: "0.7rem", noWrap: true },
                  }}
                />
              </ListItemButton>
            </span>
          </Tooltip>
        )}
      </List>
    </Box>
  );
};

// Dialog for new direct message tutor selection
const NewDMDialog = ({
  open,
  onClose,
  onSelectTutor,
  colors,
  currentUserUid,
  tutors = [],
}) => {
  const [search, setSearch] = useState("");

  const filtered = tutors.filter(
    (t) =>
      t.uid !== currentUserUid &&
      `${t.firstName} ${t.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            bgcolor: colors.primary[400],
            backgroundImage: "none",
            borderRadius: "10px",
            minWidth: 320,
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          New Direct Message
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder="Search tutors..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 2 }}
        />

        <List disablePadding>
          {filtered.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
              py={2}
            >
              No tutors found
            </Typography>
          )}
          {filtered.map((tutor) => {
            const initials = `${tutor.firstName[0]}${
              tutor.lastName ? tutor.lastName[0] : ""
            }`;
            return (
              <ListItem key={tutor.uid} disablePadding>
                <ListItemButton
                  onClick={() => {
                    onSelectTutor(tutor);
                    onClose();
                  }}
                  sx={{ borderRadius: "6px" }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Avatar
                      src={tutor.avatar || undefined}
                      sx={{
                        width: 32,
                        height: 32,
                        fontSize: "0.75rem",
                        color: "white",
                        bgcolor: tutor.tutorColor || colors.orangeAccent[700],
                      }}
                    >
                      {initials}
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={`${tutor.firstName} ${tutor.lastName}`}
                    secondary={tutor.role}
                    slotProps={{
                      primary: {
                        fontSize: "0.9rem",
                      },
                      secondary: {
                        fontSize: "0.75rem",
                      },
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </DialogContent>
    </Dialog>
  );
};

// Confirm delete dialog
const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  colors,
  deleting,
}) => (
  <Dialog
    open={open}
    onClose={onClose}
    slotProps={{
      paper: {
        sx: {
          bgcolor: colors.primary[400],
          backgroundImage: "none",
          borderRadius: "10px",
          minWidth: 300,
        },
      },
    }}
  >
    <DialogTitle>Delete message?</DialogTitle>
    <DialogContent>
      <Typography variant="body2" color="text.secondary">
        This will permanently delete the message and any attached file. This
        action cannot be undone.
      </Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button onClick={onClose} size="small" disabled={deleting}>
        Cancel
      </Button>
      <Button
        onClick={onConfirm}
        size="small"
        variant="contained"
        color="error"
        disabled={deleting}
      >
        {deleting ? "Deleting..." : "Delete"}
      </Button>
    </DialogActions>
  </Dialog>
);

// Attachment Preview (inline in message)
const AttachmentPreview = ({ attachment, colors }) => {
  if (!attachment) return null;
  const { url, name, size, type } = attachment;

  if (isImageType(type)) {
    return (
      <Box
        component="a"
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{ display: "block", mt: 0.75, cursor: "pointer" }}
      >
        <Box
          component="img"
          src={url}
          alt={name}
          sx={{
            maxWidth: "100%",
            maxHeight: 220,
            borderRadius: "6px",
            display: "block",
            objectFit: "contain",
            border: `1px solid ${colors.primary[300]}`,
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mt: 0.25 }}
        >
          {name} · {formatBytes(size)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      component="a"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      sx={{ textDecoration: "none", display: "inline-block", mt: 0.75 }}
    >
      <Chip
        icon={getFileIcon(type)}
        label={
          <Box display="flex" alignItems="center" gap={0.5}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                maxWidth: 160,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              · {formatBytes(size)}
            </Typography>
            <OpenInNewIcon sx={{ fontSize: 12, opacity: 0.6 }} />
          </Box>
        }
        size="small"
        variant="outlined"
        sx={{
          borderColor: colors.orangeAccent[400] + "66",
          color: "inherit",
          cursor: "pointer",
          height: "auto",
          py: 0.5,
          "&:hover": {
            borderColor: colors.orangeAccent[400],
            bgcolor: colors.orangeAccent[400] + "11",
          },
          "& .MuiChip-label": { px: 1 },
        }}
      />
    </Box>
  );
};

// Pending Attachment Bar (shown above input before sending)
const PendingAttachmentBar = ({ file, onRemove, colors }) => {
  if (!file) return null;
  const isOversized = file.size > MAX_FILE_SIZE_BYTES;

  return (
    <Box
      mb={1}
      px={1.5}
      py={1}
      bgcolor={colors.primary[500]}
      borderRadius="6px"
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      gap={1}
      sx={{
        border: isOversized ? "1px solid" : "none",
        borderColor: "error.main",
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        sx={{ overflow: "hidden" }}
      >
        {getFileIcon(file.type)}
        <Box sx={{ overflow: "hidden" }}>
          <Typography
            variant="caption"
            sx={{
              display: "block",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {file.name}
          </Typography>
          <Typography
            variant="caption"
            color={isOversized ? "error" : "text.secondary"}
          >
            {formatBytes(file.size)}
            {isOversized ? " — exceeds 10 MB limit" : ""}
          </Typography>
        </Box>
      </Box>
      <IconButton size="small" onClick={onRemove} sx={{ flexShrink: 0 }}>
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

// Full Noticeboard component with sidebar and chat area
const Noticeboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const { currentUser } = useContext(AuthContext);

  const [containerWidth, setContainerWidth] = useState(9999);
  const isNarrow = containerWidth < 600;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [senderName, setSenderName] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [accessibleChannels, setAccessibleChannels] = useState([]);
  const [activeChannel, setActiveChannel] = useState("all");
  const [activeDM, setActiveDM] = useState(null);
  const [existingDMs, setExistingDMs] = useState([]);
  const [allTutors, setAllTutors] = useState([]);
  const [dmDialogOpen, setDmDialogOpen] = useState(false);
  const [currentUserUid, setCurrentUserUid] = useState(null);
  const messagesContainerRef = useRef(null);
  const [oldestDocSnapshot, setOldestDocSnapshot] = useState(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const PAGE_SIZE = 50;
  const isLoadingMoreRef = useRef(false);
  const scrollHeightBeforeRef = useRef(0);

  // Edit & delete state
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [menuMsg, setMenuMsg] = useState(null);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Attachment state
  const [pendingFile, setPendingFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [attachmentError, setAttachmentError] = useState("");

  // Senior Tutor DM state
  const [activeSeniorTutorDM, setActiveSeniorTutorDM] = useState(null);
  const [seniorTutorAssignment, setSeniorTutorAssignment] = useState(null);
  const [isSeniorTutor, setIsSeniorTutor] = useState(false);
  const [seniorTutorInboxSenders, setSeniorTutorInboxSenders] = useState([]);

  const handleIncomingToast = useCallback(
    ({ type, senderName, message, channelId }) => {
      const preview =
        message?.length > 60 ? message.slice(0, 57) + "…" : message;
      const label =
        type === "channel"
          ? `#${CHANNEL_LABELS[channelId] || channelId}`
          : type === "seniorDm"
            ? "Senior Tutor"
            : "Direct Message";
      toast.info(`${senderName} · ${label}`);
    },
    []
  );

  const { channelUnread, dmUnread, seniorDmUnread } = useUnreadCounts({
    currentUserUid,
    accessibleChannels,
    existingDMs,
    activeChannel,
    activeDM,
    activeSeniorTutorDM,
    isSeniorTutor,
    seniorTutorInboxSenders,
    onToast: handleIncomingToast,
  });

  // Track container width for responsive drawer
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setContainerWidth(entry.contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fetch tutor data, all tutors, and senior tutor assignment
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchTutorData = async () => {
      setCurrentUserUid(currentUser.uid);

      const tutorSnap = await getDoc(doc(db, "tutors", currentUser.uid));
      if (tutorSnap.exists()) {
        const t = tutorSnap.data();
        setSenderName(`${t.firstName} ${t.lastName}`);
        setAccessibleChannels(getAccessibleChannels(t.role || "Tutor"));
      } else {
        setSenderName(currentUser.email);
        setAccessibleChannels(getAccessibleChannels("Tutor"));
      }

      // Fetch all tutors for DM search
      const tutorsSnap = await getDocs(collection(db, "tutors"));
      setAllTutors(
        tutorsSnap.docs.map((d) => ({
          uid: d.id,
          firstName: d.data().firstName,
          lastName: d.data().lastName,
          role: d.data().role,
          avatar: d.data().avatar || null,
          tutorColor: d.data().tutorColor || null,
        }))
      );

      // Fetch this week's senior tutor assignment
      const assignmentSnap = await getDoc(
        doc(db, "seniorTutorAssignments", getCurrentWeekKey())
      );
      if (assignmentSnap.exists() && assignmentSnap.data().tutorId) {
        const data = assignmentSnap.data();
        setSeniorTutorAssignment({
          tutorId: data.tutorId,
          tutorName: data.tutorName,
        });
        setIsSeniorTutor(data.tutorId === currentUser.uid);
      } else {
        setSeniorTutorAssignment(null);
        setIsSeniorTutor(false);
      }
    };
    fetchTutorData();
  }, [currentUser?.uid]);

  // If this user is the ST, listen for new senders in real-time
  useEffect(() => {
    if (!isSeniorTutor || !currentUserUid || allTutors.length === 0) return;
    const unsubscribe = onSnapshot(
      collection(db, SENIOR_TUTOR_DM_COLLECTION),
      (snap) => {
        const senderIds = snap.docs
          .map((d) => d.id)
          .filter((id) => id !== currentUserUid);
        const senders = senderIds
          .map((uid) => allTutors.find((t) => t.uid === uid))
          .filter(Boolean)
          .sort((a, b) => a.firstName.localeCompare(b.firstName));
        setSeniorTutorInboxSenders(senders);
      }
    );
    return () => unsubscribe();
  }, [isSeniorTutor, currentUserUid, allTutors]);

  // Load existing DM conversations, sorted by most recent message
  useEffect(() => {
    if (!currentUser?.uid || allTutors.length === 0) return;

    const fetchExistingDMs = async () => {
      const dmChecks = allTutors
        .filter((t) => t.uid !== currentUser.uid)
        .map(async (tutor) => {
          const dmId = getDmId(currentUser.uid, tutor.uid);
          const dmSnap = await getDoc(doc(db, "directMessages", dmId));
          if (!dmSnap.exists()) return null;
          const latestMsgSnap = await getDocs(
            query(
              collection(db, "directMessages", dmId, "messages"),
              orderBy("timestamp", "desc"),
              limit(1)
            )
          );
          const latestTimestamp = latestMsgSnap.empty
            ? 0
            : latestMsgSnap.docs[0].data().timestamp?.toMillis?.() || 0;

          return { tutor, latestTimestamp };
        });

      const results = await Promise.all(dmChecks);
      setExistingDMs(
        results
          .filter(Boolean)
          .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
          .map((r) => r.tutor)
      );
    };

    fetchExistingDMs();
  }, [currentUser?.uid, allTutors]);

  const getActiveMessagesCollection = () => {
    if (activeSeniorTutorDM) {
      const senderId =
        activeSeniorTutorDM === "self" ? currentUserUid : activeSeniorTutorDM;
      return collection(db, SENIOR_TUTOR_DM_COLLECTION, senderId, "messages");
    }
    if (activeDM)
      return collection(
        db,
        "directMessages",
        getDmId(currentUserUid, activeDM.uid),
        "messages"
      );
    return collection(db, "chatMessages", activeChannel, "messages");
  };

  // Listen to messages for the active channel or DM
  useEffect(() => {
    setMessages([]);
    setOldestDocSnapshot(null);
    setHasMoreMessages(false);
    isLoadingMoreRef.current = false;

    if ((activeDM || activeSeniorTutorDM) && !currentUserUid) return;

    const messagesPath = getActiveMessagesCollection();
    const q = query(
      messagesPath,
      orderBy("timestamp", "desc"),
      limit(PAGE_SIZE)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOldestDocSnapshot(snapshot.docs[snapshot.docs.length - 1] ?? null);
      setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);
      setMessages(msgs.reverse());
    });

    return () => unsubscribe();
  }, [activeChannel, activeDM, activeSeniorTutorDM, currentUserUid]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    if (isLoadingMoreRef.current) {
      requestAnimationFrame(() => {
        container.scrollTop =
          container.scrollHeight - scrollHeightBeforeRef.current;
        isLoadingMoreRef.current = false;
      });
    } else {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages]);

  const loadMoreMessages = async () => {
    if (!oldestDocSnapshot || loadingMore) return;
    setLoadingMore(true);
    const messagesPath = getActiveMessagesCollection();
    const snapshot = await getDocs(
      query(
        messagesPath,
        orderBy("timestamp", "desc"),
        startAfter(oldestDocSnapshot),
        limit(PAGE_SIZE)
      )
    );
    if (!snapshot.empty) {
      const olderMsgs = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .reverse();
      setOldestDocSnapshot(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);
      scrollHeightBeforeRef.current =
        messagesContainerRef.current?.scrollHeight ?? 0;
      isLoadingMoreRef.current = true;
      setMessages((prev) => [...olderMsgs, ...prev]);
    } else {
      setHasMoreMessages(false);
    }

    setLoadingMore(false);
  };

  const getMessageDocRef = (msgId) => {
    if (activeSeniorTutorDM) {
      const senderId =
        activeSeniorTutorDM === "self" ? currentUserUid : activeSeniorTutorDM;
      return doc(db, SENIOR_TUTOR_DM_COLLECTION, senderId, "messages", msgId);
    }
    if (activeDM)
      return doc(
        db,
        "directMessages",
        getDmId(currentUserUid, activeDM.uid),
        "messages",
        msgId
      );
    return doc(db, "chatMessages", activeChannel, "messages", msgId);
  };

  // File selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentError("");

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setAttachmentError(
        "File type not supported. Allowed: images, PDF, Word, Excel."
      );
      e.target.value = "";
      return;
    }
    setPendingFile(file);
    e.target.value = "";
  };

  // Upload attachment to Storage
  const uploadAttachment = (file, path) =>
    new Promise((resolve, reject) => {
      const storageRef = ref(sb, path);
      const uploadTask = uploadBytesResumable(storageRef, file, {
        customMetadata: { uploaderId: currentUserUid },
      });
      uploadTask.on(
        "state_changed",
        (snapshot) =>
          setUploadProgress(
            Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
          ),
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });

  // Send message
  const handleSend = async () => {
    const hasText = newMessage.trim().length > 0;
    const hasFile = pendingFile !== null;
    if (!hasText && !hasFile) return;
    if (!currentUser?.uid) return;
    if (pendingFile && pendingFile.size > MAX_FILE_SIZE_BYTES) {
      setAttachmentError(
        "File exceeds the 10 MB limit. Please remove it before sending."
      );
      return;
    }

    setAttachmentError("");
    let attachment = null;

    if (hasFile) {
      const tempId = `${Date.now()}_${currentUserUid}`;
      const safeName = pendingFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = activeSeniorTutorDM
        ? `chat-attachments/senior-tutor-dms/${currentUserUid}/${tempId}_${safeName}`
        : getStoragePath(
            activeDM,
            activeChannel,
            currentUserUid,
            tempId,
            pendingFile.name
          );
      try {
        const url = await uploadAttachment(pendingFile, path);
        attachment = {
          url,
          name: pendingFile.name,
          size: pendingFile.size,
          type: pendingFile.type,
          storagePath: path,
        };
      } catch {
        setAttachmentError("Upload failed. Please try again.");
        setUploadProgress(null);
        return;
      }
      setUploadProgress(null);
      setPendingFile(null);
    }

    const messageData = {
      senderId: currentUser.uid,
      senderName,
      message: newMessage.trim(),
      timestamp: serverTimestamp(),
      replyTo: replyTo
        ? {
            messageId: replyTo.messageId,
            senderName: replyTo.senderName,
            message: replyTo.message,
          }
        : null,
      attachment: attachment || null,
    };

    if (activeSeniorTutorDM) {
      const senderId =
        activeSeniorTutorDM === "self" ? currentUserUid : activeSeniorTutorDM;
      const parentRef = doc(db, SENIOR_TUTOR_DM_COLLECTION, senderId);
      const parentSnap = await getDoc(parentRef);
      if (!parentSnap.exists()) {
        const senderTutor = allTutors.find((t) => t.uid === senderId);
        await setDoc(parentRef, {
          senderId,
          senderName: senderTutor
            ? `${senderTutor.firstName} ${senderTutor.lastName}`
            : senderName,
          createdAt: serverTimestamp(),
        });
        if (activeSeniorTutorDM === "self") {
          setSeniorTutorInboxSenders((prev) => {
            const me = allTutors.find((t) => t.uid === currentUserUid);
            if (!me || prev.find((s) => s.uid === currentUserUid)) return prev;
            return [...prev, me].sort((a, b) =>
              a.firstName.localeCompare(b.firstName)
            );
          });
        }
      }
      await addDoc(
        collection(db, SENIOR_TUTOR_DM_COLLECTION, senderId, "messages"),
        {
          ...messageData,
          senderRole: isSeniorTutor ? "seniorTutor" : "tutor",
        },
      );
    } else if (activeDM) {
      const dmId = getDmId(currentUser.uid, activeDM.uid);
      const dmRef = doc(db, "directMessages", dmId);
      const dmSnap = await getDoc(dmRef);
      if (!dmSnap.exists()) {
        await setDoc(dmRef, {
          participants: [currentUser.uid, activeDM.uid],
          createdAt: serverTimestamp(),
        });
      }
      setExistingDMs((prev) => [
        activeDM,
        ...prev.filter((d) => d.uid !== activeDM.uid),
      ]);
      await addDoc(
        collection(db, "directMessages", dmId, "messages"),
        messageData
      );
    } else {
      await addDoc(
        collection(db, "chatMessages", activeChannel, "messages"),
        messageData
      );
    }

    setNewMessage("");
    setReplyTo(null);
  };

  // Edit handlers
  const handleEditStart = (msg) => {
    setEditingMsgId(msg.id);
    setEditingText(msg.message);
    setMenuAnchorEl(null);
    setMenuMsg(null);
  };

  const handleEditSave = async (msgId) => {
    if (!editingText.trim()) return;
    await updateDoc(getMessageDocRef(msgId), {
      message: editingText.trim(),
      edited: true,
    });
    setEditingMsgId(null);
    setEditingText("");
  };

  const handleEditCancel = () => {
    setEditingMsgId(null);
    setEditingText("");
  };

  // Delete handlers
  const handleDeletePrompt = (msg) => {
    setMsgToDelete(msg);
    setDeleteDialogOpen(true);
    setMenuAnchorEl(null);
    setMenuMsg(null);
  };

  const handleDeleteConfirm = async () => {
    if (!msgToDelete) return;
    setDeleting(true);
    if (msgToDelete.attachment?.storagePath) {
      try {
        await deleteObject(ref(sb, msgToDelete.attachment.storagePath));
      } catch {}
    }
    await deleteDoc(getMessageDocRef(msgToDelete.id));
    setDeleting(false);
    setDeleteDialogOpen(false);
    setMsgToDelete(null);
  };

  // Navigation
  const handleSelectChannel = (channelId) => {
    setActiveChannel(channelId);
    setActiveDM(null);
    setActiveSeniorTutorDM(null);
    setReplyTo(null);
    if (isNarrow) setDrawerOpen(false);
  };

  const handleSelectDM = (tutor) => {
    setActiveDM(tutor);
    setActiveSeniorTutorDM(null);
    setReplyTo(null);
    if (isNarrow) setDrawerOpen(false);
  };

  const handleNewDMSelect = (tutor) => {
    setExistingDMs((prev) => [
      tutor,
      ...prev.filter((d) => d.uid !== tutor.uid),
    ]);
    handleSelectDM(tutor);
  };
  const handleSelectSeniorTutorDM = (senderIdOrSelf) => {
    setActiveSeniorTutorDM(senderIdOrSelf);
    setActiveDM(null);
    setReplyTo(null);
    if (isNarrow) setDrawerOpen(false);
  };

  let chatTitle, chatSubtitle, chatIcon;
  if (activeSeniorTutorDM) {
    if (isSeniorTutor) {
      const sender = seniorTutorInboxSenders.find(
        (s) => s.uid === activeSeniorTutorDM
      );
      chatTitle = sender
        ? `${sender.firstName} ${sender.lastName}`
        : "Unknown sender";
      chatSubtitle = "Live Senior Tutor · Incoming message";
    } else {
      chatTitle = seniorTutorAssignment?.tutorName ?? "Senior Tutor";
      chatSubtitle = "Live Senior Tutor · Direct Message";
    }
    chatIcon = (
      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          mr: 0.5,
        }}
      >
        <SupportAgentIcon sx={{ color: "success.main", fontSize: 26 }} />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            right: -2,
            width: 9,
            height: 9,
            borderRadius: "50%",
            bgcolor: "success.main",
            border: `1.5px solid ${colors.primary[400]}`,
            animation: "livePulse 1.8s infinite",
            "@keyframes livePulse": {
              "0%": { boxShadow: "0 0 0 0 rgba(34,197,94,0.7)" },
              "70%": { boxShadow: "0 0 0 6px rgba(34,197,94,0)" },
              "100%": { boxShadow: "0 0 0 0 rgba(34,197,94,0)" },
            },
          }}
        />
      </Box>
    );
  } else if (activeDM) {
    chatTitle = `${activeDM.firstName} ${activeDM.lastName}`;
    chatSubtitle = "Direct Message";
    chatIcon = (
      <Avatar
        src={activeDM.avatar || undefined}
        sx={{
          width: 32,
          height: 32,
          fontSize: "0.7rem",
          color: "white",
          bgcolor: activeDM.tutorColor || colors.orangeAccent[700],
        }}
      >
        {activeDM.firstName[0]}
        {activeDM.lastName[0]}
      </Avatar>
    );
  } else {
    chatTitle = CHANNEL_LABELS[activeChannel] || activeChannel;
    chatSubtitle = PRIVATE_CHANNELS.includes(activeChannel)
      ? "Private Channel"
      : "Public Channel";
    chatIcon = PRIVATE_CHANNELS.includes(activeChannel) ? (
      <LockIcon sx={{ color: colors.orangeAccent[400], fontSize: 20 }} />
    ) : (
      <TagIcon sx={{ color: colors.orangeAccent[400], fontSize: 20 }} />
    );
  }

  // Only allow edit/delete on your own messages
  const canEditDelete = (msg) => msg.senderId === currentUserUid;

  const sidebarContent = (
    <SidebarContent
      colors={colors}
      accessibleChannels={accessibleChannels}
      activeChannel={activeChannel}
      onSelectChannel={handleSelectChannel}
      existingDMs={existingDMs}
      onSelectDM={handleSelectDM}
      activeDM={activeDM}
      onNewDM={() => setDmDialogOpen(true)}
      allTutors={allTutors}
      currentUserUid={currentUserUid}
      seniorTutorAssignment={seniorTutorAssignment}
      activeSeniorTutorDM={activeSeniorTutorDM}
      onSelectSeniorTutorDM={handleSelectSeniorTutorDM}
      seniorTutorInboxSenders={seniorTutorInboxSenders}
      isSeniorTutor={isSeniorTutor}
      channelUnread={channelUnread}
      dmUnread={dmUnread}
      seniorDmUnread={seniorDmUnread}
    />
  );

  return (
    <Box
      ref={containerRef}
      width="100%"
      height="100%"
      display="flex"
      overflow="hidden"
      borderRadius="8px"
      sx={{ position: "relative" }}
    >
      {!isNarrow && (
        <Box
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            height: "100%",
            borderRight: `1px solid ${colors.primary[300]}`,
            overflow: "hidden",
          }}
        >
          {sidebarContent}
        </Box>
      )}

      {isNarrow && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          container={containerRef.current}
          ModalProps={{
            keepMounted: true,
            disablePortal: true,
            style: { position: "absolute" },
            slotProps: {
              backdrop: {
                style: { position: "absolute" },
              },
            },
          }}
          PaperProps={{
            sx: {
              width: DRAWER_WIDTH,
              backgroundImage: "none",
              position: "absolute",
            },
          }}
          sx={{
            position: "absolute",
            zIndex: 1200,
            "& .MuiDrawer-root": { position: "absolute" },
            "& .MuiPaper-root": { position: "absolute" },
          }}
        >
          {sidebarContent}
        </Drawer>
      )}

      <Box
        flex="1"
        display="flex"
        flexDirection="column"
        overflow="hidden"
        p="16px"
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          mb={2}
          pb={1.5}
          sx={{ borderBottom: `1px solid ${colors.primary[300]}` }}
        >
          {isNarrow && (
            <IconButton
              size="small"
              onClick={() => setDrawerOpen(true)}
              sx={{ mr: 0.5 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          {chatIcon}
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              lineHeight={1.2}
              color={
                activeSeniorTutorDM ? "success.main" : colors.orangeAccent[400]
              }
            >
              {chatTitle}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {chatSubtitle}
            </Typography>
          </Box>
        </Box>

        <Box
          ref={messagesContainerRef}
          flex="1"
          overflow="auto"
          mb={2}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            paddingRight: "4px",
          }}
        >
          {hasMoreMessages && (
            <Box display="flex" justifyContent="center" mb={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={loadMoreMessages}
                disabled={loadingMore}
                sx={{
                  fontSize: "0.75rem",
                  color: colors.grey[400],
                  borderColor: colors.primary[300],
                  "&:hover": {
                    borderColor: colors.orangeAccent[400],
                    color: colors.orangeAccent[400],
                  },
                }}
              >
                {loadingMore ? "Loading..." : "Load older messages"}
              </Button>
            </Box>
          )}

          {messages.length === 0 && (
            <Box
              flex={1}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              sx={{ opacity: 0.4, userSelect: "none" }}
            >
              {activeSeniorTutorDM ? (
                <SupportAgentIcon sx={{ fontSize: 48, mb: 1 }} />
              ) : activeDM ? (
                <PersonIcon sx={{ fontSize: 48, mb: 1 }} />
              ) : (
                <TagIcon sx={{ fontSize: 48, mb: 1 }} />
              )}
              <Typography variant="body2">No messages yet</Typography>
            </Box>
          )}

          {messages.map((msg) => {
            const isOwn = activeSeniorTutorDM
              ? isSeniorTutor
                ? msg.senderRole === "seniorTutor"
                : msg.senderRole === "tutor"
              : msg.senderId === currentUserUid;

            const isEditing = editingMsgId === msg.id;
            const showSenderName = activeSeniorTutorDM
              ? true
              : !isOwn || !activeDM;

            return (
              <Box
                key={msg.id}
                display="flex"
                flexDirection="column"
                alignItems={isOwn ? "flex-end" : "flex-start"}
              >
                <Box
                  sx={{
                    maxWidth: "75%",
                    p: "10px",
                    borderRadius: isOwn
                      ? "12px 12px 2px 12px"
                      : "12px 12px 12px 2px",
                    bgcolor: isOwn
                      ? `${colors.orangeAccent[400]}22`
                      : colors.primary[500],
                    border: isOwn
                      ? `1px solid ${colors.orangeAccent[400]}44`
                      : "none",
                    position: "relative",
                    "&:hover .msg-actions": { opacity: 1 },
                  }}
                >
                  {showSenderName && (
                    <Typography
                      variant="body2"
                      color={
                        isOwn
                          ? colors.orangeAccent[400]
                          : activeSeniorTutorDM
                            ? "success.main"
                            : colors.orangeAccent[400]
                      }
                      sx={{ fontWeight: "bold", mb: 0.25 }}
                    >
                      {msg.senderName}
                    </Typography>
                  )}

                  {/* Reply preview */}
                  {msg.replyTo && (
                    <Box
                      sx={{
                        borderLeft: `3px solid ${colors.orangeAccent[400]}`,
                        pl: 1,
                        mb: 0.5,
                        opacity: 0.8,
                      }}
                    >
                      <Typography variant="caption">
                        Replying to <b>{msg.replyTo.senderName}</b>{" "}
                      </Typography>
                      <Typography variant="caption">
                        "{msg.replyTo.message}"
                      </Typography>
                    </Box>
                  )}

                  {/* Message body - inline edit when active */}
                  {isEditing ? (
                    <Box
                      display="flex"
                      flexDirection="column"
                      gap={0.75}
                      mt={0.5}
                    >
                      <TextField
                        size="small"
                        fullWidth
                        multiline
                        value={editingText}
                        autoFocus
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleEditSave(msg.id);
                          }
                          if (e.key === "Escape") handleEditCancel();
                        }}
                      />
                      <Box display="flex" gap={0.5} justifyContent="flex-end">
                        <Button size="small" onClick={handleEditCancel}>
                          Cancel
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleEditSave(msg.id)}
                        >
                          Save
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <>
                      {msg.message && (
                        <Typography variant="body1">{msg.message}</Typography>
                      )}
                      <AttachmentPreview
                        attachment={msg.attachment}
                        colors={colors}
                      />
                    </>
                  )}

                  {/* Timestamp + reply + three-dot menu */}
                  {!isEditing && (
                    <Box
                      display="flex"
                      justifyContent={isOwn ? "flex-end" : "space-between"}
                      alignItems="center"
                      mt={0.5}
                      gap={1}
                    >
                      <Typography fontSize={10} color="text.secondary">
                        {msg.timestamp?.toDate
                          ? format(
                              msg.timestamp.toDate(),
                              "dd MMM yyyy, h:mm a"
                            )
                          : "Sending..."}
                        {msg.edited && (
                          <Typography
                            component="span"
                            fontSize={10}
                            color="text.secondary"
                            sx={{ ml: 0.5, fontStyle: "italic" }}
                          >
                            (edited)
                          </Typography>
                        )}
                      </Typography>

                      <Box display="flex" alignItems="center" gap={0.25}>
                        <Button
                          size="small"
                          sx={{
                            minWidth: 0,
                            fontSize: "0.7rem",
                            py: 0,
                            px: 0.75,
                          }}
                          onClick={() =>
                            setReplyTo({
                              messageId: msg.id,
                              senderName: msg.senderName,
                              message: msg.message,
                            })
                          }
                        >
                          Reply
                        </Button>
                        {canEditDelete(msg) && (
                          <IconButton
                            size="small"
                            className="msg-actions"
                            onClick={(e) => {
                              setMenuAnchorEl(e.currentTarget);
                              setMenuMsg(msg);
                            }}
                            sx={{
                              opacity: 0,
                              transition: "opacity 0.15s",
                              p: 0.25,
                              color: colors.grey[400],
                              "&:hover": { color: colors.orangeAccent[400] },
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 15 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Upload progress bar */}
        {uploadProgress !== null && (
          <Box mb={1}>
            <Typography variant="caption" color="text.secondary">
              Uploading... {uploadProgress}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={uploadProgress}
              sx={{ mt: 0.5, borderRadius: 4 }}
            />
          </Box>
        )}

        {/* Pending attachment preview */}
        <PendingAttachmentBar
          file={pendingFile}
          onRemove={() => {
            setPendingFile(null);
            setAttachmentError("");
          }}
          colors={colors}
        />

        {/* Attachment error */}
        {attachmentError && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mb: 0.5, display: "block" }}
          >
            {attachmentError}
          </Typography>
        )}

        {replyTo && (
          <Box
            mb={1}
            p={1}
            bgcolor={colors.primary[500]}
            borderRadius="6px"
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography variant="caption">
                Replying to <b>{replyTo.senderName}</b>{" "}
              </Typography>
              <Typography variant="caption">"{replyTo.message}"</Typography>
            </Box>
            <Button size="small" color="error" onClick={() => setReplyTo(null)}>
              Cancel
            </Button>
          </Box>
        )}

        <Box display="flex" gap="8px" alignItems="center">
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_MIME_TYPES.join(",")}
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />
          <Tooltip title="Attach file (max 10 MB)">
            <span>
              <IconButton
                size="small"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadProgress !== null}
                sx={{
                  color: pendingFile
                    ? colors.orangeAccent[400]
                    : colors.grey[400],
                  "&:hover": { color: colors.orangeAccent[400] },
                }}
              >
                <AttachFileIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder={
              activeSeniorTutorDM
                ? isSeniorTutor
                  ? `Reply to ${seniorTutorInboxSenders.find((s) => s.uid === activeSeniorTutorDM)?.firstName ?? "sender"}...`
                  : "Message Senior Tutor..."
                : activeDM
                  ? `Message ${activeDM.firstName}...`
                  : `Message #${CHANNEL_LABELS[activeChannel] || activeChannel}...`
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSend}
            disabled={uploadProgress !== null}
          >
            Send
          </Button>
        </Box>
      </Box>

      {/* Context menu for own messages */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => {
          setMenuAnchorEl(null);
          setMenuMsg(null);
        }}
        slotProps={{
          paper: {
            sx: {
              bgcolor: colors.primary[400],
              backgroundImage: "none",
              minWidth: 140,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => handleEditStart(menuMsg)}
          sx={{ gap: 1, fontSize: "0.875rem" }}
        >
          <EditIcon sx={{ fontSize: 16 }} /> Edit
        </MenuItem>
        <MenuItem
          onClick={() => handleDeletePrompt(menuMsg)}
          sx={{ gap: 1, fontSize: "0.875rem", color: "error.main" }}
        >
          <DeleteIcon sx={{ fontSize: 16 }} /> Delete
        </MenuItem>
      </Menu>

      <NewDMDialog
        open={dmDialogOpen}
        onClose={() => setDmDialogOpen(false)}
        onSelectTutor={handleNewDMSelect}
        colors={colors}
        currentUserUid={currentUserUid}
        tutors={allTutors}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setMsgToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        colors={colors}
        deleting={deleting}
      />

      <ToastContainer position="bottom-right" autoClose={3000} newestOnTop />
    </Box>
  );
};

export default Noticeboard;
