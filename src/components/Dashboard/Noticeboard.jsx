import { useContext, useEffect, useRef, useState } from "react";
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
  InputAdornment,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import TagIcon from "@mui/icons-material/Tag";
import LockIcon from "@mui/icons-material/Lock";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import PersonIcon from "@mui/icons-material/Person";
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
} from "firebase/firestore";
import { db } from "../../data/firebase";
import { format } from "date-fns";

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

const getAccessibleChannels = (role) =>
  Object.entries(CHANNEL_ACCESS)
    .filter(([, roles]) => roles.includes(role))
    .map(([channelId]) => channelId);

const DRAWER_WIDTH = 240;

const getDmId = (uid1, uid2) => [uid1, uid2].sort().join("_");

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
}) => (
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
        const isActive = activeChannel === channelId && !activeDM;
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
                "&:hover": { bgcolor: colors.primary[400] },
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
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
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>

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
        const isActive = activeDM?.uid === tutor.uid;
        const initials = `${tutor.firstName[0]}${
          tutor.lastName ? tutor.lastName[0] : ""
        }`;
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
              <ListItemIcon sx={{ minWidth: 36 }}>
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
  </Box>
);

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
        .includes(search.toLowerCase()),
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

// Full Noticeboard component with sidebar and chat area
const Noticeboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const containerRef = useRef(null);
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

  // Fetch user role, name & all tutors
  useEffect(() => {
    if (!currentUser?.uid) return;

    const fetchTutorData = async () => {
      setCurrentUserUid(currentUser.uid);

      const tutorRef = doc(db, "tutors", currentUser.uid);
      const tutorSnap = await getDoc(tutorRef);

      if (tutorSnap.exists()) {
        const t = tutorSnap.data();
        setSenderName(`${t.firstName} ${t.lastName}`);
        const role = t.role || "Tutor";
        setAccessibleChannels(getAccessibleChannels(role));
      } else {
        setSenderName(currentUser.email);
        setAccessibleChannels(getAccessibleChannels("Tutor"));
      }

      // Fetch all tutors for DM search
      const tutorsSnap = await getDocs(collection(db, "tutors"));
      const tutorList = tutorsSnap.docs.map((d) => ({
        uid: d.id,
        firstName: d.data().firstName,
        lastName: d.data().lastName,
        role: d.data().role,
        avatar: d.data().avatar || null,
        tutorColor: d.data().tutorColor || null,
      }));
      setAllTutors(tutorList);
    };

    fetchTutorData();
  }, [currentUser?.uid]);

  // Load existing DM conversations, sorted by most recent message
  useEffect(() => {
    if (!currentUser?.uid || allTutors.length === 0) return;

    const fetchExistingDMs = async () => {
      const dmChecks = allTutors
        .filter((t) => t.uid !== currentUser.uid)
        .map(async (tutor) => {
          const dmId = getDmId(currentUser.uid, tutor.uid);
          const dmRef = doc(db, "directMessages", dmId);
          const dmSnap = await getDoc(dmRef);
          if (!dmSnap.exists()) return null;

          const latestMsgQuery = query(
            collection(db, "directMessages", dmId, "messages"),
            orderBy("timestamp", "desc"),
            limit(1),
          );
          const latestMsgSnap = await getDocs(latestMsgQuery);
          const latestTimestamp = latestMsgSnap.empty
            ? 0
            : latestMsgSnap.docs[0].data().timestamp?.toMillis?.() || 0;

          return { tutor, latestTimestamp };
        });

      const results = await Promise.all(dmChecks);
      const activeDMs = results
        .filter(Boolean)
        .sort((a, b) => b.latestTimestamp - a.latestTimestamp)
        .map((r) => r.tutor);

      setExistingDMs(activeDMs);
    };

    fetchExistingDMs();
  }, [currentUser?.uid, allTutors]);

  // Listen to messages for the active channel or DM
  useEffect(() => {
    setMessages([]);
    setOldestDocSnapshot(null);
    setHasMoreMessages(false);
    isLoadingMoreRef.current = false;

    const messagesPath = activeDM
      ? collection(
          db,
          "directMessages",
          getDmId(currentUserUid, activeDM.uid),
          "messages",
        )
      : collection(db, "chatMessages", activeChannel, "messages");

    if (activeDM && !currentUserUid) return;

    const q = query(
      messagesPath,
      orderBy("timestamp", "desc"),
      limit(PAGE_SIZE),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;

      const msgs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

      setOldestDocSnapshot(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);

      setMessages(msgs.reverse());
    });

    return () => unsubscribe();
  }, [activeChannel, activeDM, currentUserUid]);

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

    const messagesPath = activeDM
      ? collection(
          db,
          "directMessages",
          getDmId(currentUserUid, activeDM.uid),
          "messages",
        )
      : collection(db, "chatMessages", activeChannel, "messages");

    const q = query(
      messagesPath,
      orderBy("timestamp", "desc"),
      startAfter(oldestDocSnapshot),
      limit(PAGE_SIZE),
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const olderMsgs = snapshot.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .reverse();

      setOldestDocSnapshot(snapshot.docs[snapshot.docs.length - 1]);
      setHasMoreMessages(snapshot.docs.length === PAGE_SIZE);

      const container = messagesContainerRef.current;
      scrollHeightBeforeRef.current = container?.scrollHeight ?? 0;
      isLoadingMoreRef.current = true;

      setMessages((prev) => [...olderMsgs, ...prev]);
    } else {
      setHasMoreMessages(false);
    }

    setLoadingMore(false);
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    if (!currentUser?.uid) return;

    if (activeDM) {
      const dmId = getDmId(currentUser.uid, activeDM.uid);
      const dmRef = doc(db, "directMessages", dmId);
      const dmSnap = await getDoc(dmRef);

      if (!dmSnap.exists()) {
        await setDoc(dmRef, {
          participants: [currentUser.uid, activeDM.uid],
          createdAt: serverTimestamp(),
        });
      }

      // Move tutor to top of DM list on new message
      setExistingDMs((prev) => [
        activeDM,
        ...prev.filter((d) => d.uid !== activeDM.uid),
      ]);

      await addDoc(collection(db, "directMessages", dmId, "messages"), {
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
      });

      setNewMessage("");
      setReplyTo(null);
      return;
    }

    await addDoc(collection(db, "chatMessages", activeChannel, "messages"), {
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
    });

    setNewMessage("");
    setReplyTo(null);
  };

  const handleSelectChannel = (channelId) => {
    setActiveChannel(channelId);
    setActiveDM(null);
    setReplyTo(null);
    if (isNarrow) setDrawerOpen(false);
  };

  const handleSelectDM = (tutor) => {
    setActiveDM(tutor);
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

  const chatTitle = activeDM
    ? `${activeDM.firstName} ${activeDM.lastName}`
    : CHANNEL_LABELS[activeChannel] || activeChannel;

  const chatSubtitle = activeDM
    ? "Direct Message"
    : PRIVATE_CHANNELS.includes(activeChannel)
      ? "Private Channel"
      : "Public Channel";

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
      currentUserUid={currentUserUid}
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

          {activeDM ? (
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
          ) : PRIVATE_CHANNELS.includes(activeChannel) ? (
            <LockIcon sx={{ color: colors.orangeAccent[400], fontSize: 20 }} />
          ) : (
            <TagIcon sx={{ color: colors.orangeAccent[400], fontSize: 20 }} />
          )}

          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              lineHeight={1.2}
              color={colors.orangeAccent[400]}
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
              {activeDM ? (
                <PersonIcon sx={{ fontSize: 48, mb: 1 }} />
              ) : (
                <TagIcon sx={{ fontSize: 48, mb: 1 }} />
              )}
              <Typography variant="body2">No messages yet</Typography>
            </Box>
          )}

          {messages.map((msg) => (
            <Box
              key={msg.id}
              p="10px"
              bgcolor={colors.primary[500]}
              borderRadius="6px"
            >
              <Typography
                variant="body2"
                color={colors.orangeAccent[400]}
                sx={{ fontWeight: "bold" }}
              >
                {msg.senderName}
              </Typography>

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
                  <Typography variant="caption" noWrap>
                    "{msg.replyTo.message}"
                  </Typography>
                </Box>
              )}

              <Typography variant="body1">{msg.message}</Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "end",
                }}
              >
                <Typography fontSize={10} color="text.secondary">
                  {msg.timestamp?.toDate
                    ? format(msg.timestamp.toDate(), "dd MMM yyyy, h:mm a")
                    : "Sending..."}
                </Typography>
                <Button
                  size="small"
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
              </Box>
            </Box>
          ))}
        </Box>

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

        <Box display="flex" gap="8px">
          <TextField
            variant="outlined"
            size="small"
            fullWidth
            placeholder={
              activeDM
                ? `Message ${activeDM.firstName}...`
                : `Message #${
                    CHANNEL_LABELS[activeChannel] || activeChannel
                  }...`
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
          <Button variant="contained" onClick={handleSend}>
            Send
          </Button>
        </Box>
      </Box>

      <NewDMDialog
        open={dmDialogOpen}
        onClose={() => setDmDialogOpen(false)}
        onSelectTutor={handleNewDMSelect}
        colors={colors}
        currentUserUid={currentUserUid}
        tutors={allTutors}
      />
    </Box>
  );
};

export default Noticeboard;
