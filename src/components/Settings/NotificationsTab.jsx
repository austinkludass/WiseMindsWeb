import { useContext, useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { getToken } from "firebase/messaging";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { messaging, db } from "../../data/firebase";
import { AuthContext } from "../../context/AuthContext";

const VAPID_KEY =
  "BAj_wLsJkDf6UAnL4EOlJaxew1F47SATK_Pw7_BBodH0ahj1AHBkbZWF5zdBDRlj4KHNZgE8XbHvKD7yPG_6GsM";

const NotificationsTab = () => {
  const { currentUser } = useContext(AuthContext);
  const [status, setStatus] = useState("idle");
  const [savedToken, setSavedToken] = useState(null);

  useEffect(() => {
    if (!currentUser?.uid) return;

    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setStatus("unsupported");
      return;
    }

    if (Notification.permission === "granted") {
      setStatus("granted");
    } else if (Notification.permission === "denied") {
      setStatus("denied");
    }

    const checkSavedToken = async () => {
      const snap = await getDoc(doc(db, "tutors", currentUser.uid));
      if (snap.exists() && snap.data().fcmToken) {
        setSavedToken(snap.data().fcmToken);
      }
    };
    checkSavedToken();
  }, [currentUser?.uid]);

  const handleEnable = async () => {
    if (!currentUser?.uid) return;
    setStatus("loading");

    try {
      const permission = await Notification.requestPermission();

      if (permission !== "granted") {
        setStatus("denied");
        return;
      }

      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js"
      );

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!token) {
        setStatus("idle");
        return;
      }

      await updateDoc(doc(db, "tutors", currentUser.uid), {
        fcmToken: token,
      });

      setSavedToken(token);
      setStatus("granted");
    } catch (err) {
      console.error("FCM setup failed:", err);
      setStatus("idle");
    }
  };

  const handleDisable = async () => {
    if (!currentUser?.uid) return;
    await updateDoc(doc(db, "tutors", currentUser.uid), { fcmToken: null });
    setSavedToken(null);
    setStatus(Notification.permission === "granted" ? "granted" : "idle");
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches;

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: "12px" }}>
      <Typography variant="h5" fontWeight={600} mb={1}>
        Push Notifications
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Get notified on your device when you receive a direct message.
      </Typography>

      {/* iOS install prompt */}
      {isIOS && !isStandalone && (
        <Alert severity="info" sx={{ mb: 3 }}>
          On iPhone, you need to add this app to your Home Screen first. In
          Safari, tap the <strong>Share</strong> button then{" "}
          <strong>Add to Home Screen</strong>, then open the app from there.
        </Alert>
      )}

      {status === "unsupported" && (
        <Alert severity="warning">
          Push notifications are not supported on this browser or device.
        </Alert>
      )}

      {status === "denied" && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Notifications are blocked. Please enable them in your browser or
          device settings, then try again.
        </Alert>
      )}

      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        {savedToken ? (
          <>
            <Chip
              icon={<NotificationsActiveIcon />}
              label="Notifications enabled on this device"
              color="success"
              variant="outlined"
            />
            <Button
              variant="outlined"
              color="error"
              startIcon={<NotificationsOffIcon />}
              onClick={handleDisable}
            >
              Disable
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={
              status === "loading" ? (
                <CircularProgress size={18} sx={{ color: "white" }} />
              ) : (
                <NotificationsActiveIcon />
              )
            }
            onClick={handleEnable}
            disabled={
              status === "loading" ||
              status === "unsupported" ||
              (isIOS && !isStandalone)
            }
          >
            {status === "loading" ? "Setting up..." : "Enable Notifications"}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default NotificationsTab;
