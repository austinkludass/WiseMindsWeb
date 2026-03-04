import { useEffect } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { doc, updateDoc } from "firebase/firestore";
import { messaging, db } from "../data/firebase";

const VAPID_KEY = "BAj_wLsJkDf6UAnL4EOlJaxew1F47SATK_Pw7_BBodH0ahj1AHBkbZWF5zdBDRlj4KHNZgE8XbHvKD7yPG_6GsM";

const useFCMToken = (currentUserUid) => {
  useEffect(() => {
    if (!currentUserUid) return;

    const registration = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === "granted") return;

        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        if (!token) return;

        await updateDoc(doc(db, "tutors", currentUserUid), {
          fcmToken: token,
        });
      } catch (err) {
        console.error("Error getting FCM token:", err);
      }
    };

    registration();

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message: ", payload);
    });

    return () => unsubscribe();
  }, [currentUserUid]);
};

export default useFCMToken;
