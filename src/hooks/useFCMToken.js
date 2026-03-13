import { useEffect } from "react";
import { onMessage } from "firebase/messaging";
import { messaging } from "../data/firebase";

const useFCMToken = (currentUserUid) => {
  useEffect(() => {
    if (!currentUserUid) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("Foreground message: ", payload);
    });

    return () => unsubscribe();
  }, [currentUserUid]);
};

export default useFCMToken;
