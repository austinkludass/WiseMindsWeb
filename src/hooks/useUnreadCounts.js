import { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../data/firebase";

const getDmId = (uid1, uid2) => [uid1, uid2].sort().join("_");
const SENIOR_TUTOR_DM_COLLECTION = "seniorTutorDMs";

const storageKey = (uid) => `unread_lastSeen_${uid}`;

const loadLastSeen = (uid) => {
  if (!uid) return {};
  try {
    const raw = localStorage.getItem(storageKey(uid));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveLastSeen = (uid, map) => {
  if (!uid) return;
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(map));
  } catch {}
};

const useUnreadCounts = ({
  currentUserUid,
  accessibleChannels,
  existingDMs,
  activeChannel,
  activeDM,
  activeSeniorTutorDM,
  isSeniorTutor,
  seniorTutorInboxSenders,
  onToast,
}) => {
  const [channelUnread, setChannelUnread] = useState({});
  const [dmUnread, setDmUnread] = useState({});
  const [seniorDmUnread, setSeniorDmUnread] = useState({});
  const [lastSeenReady, setLastSeenReady] = useState(false);

  const lastSeenRef = useRef({});
  const isFirstSnapshotRef = useRef({});

  useEffect(() => {
    if (!currentUserUid) return;
    lastSeenRef.current = loadLastSeen(currentUserUid);
    setLastSeenReady(true);
  }, [currentUserUid]);

  const markSeen = (key) => {
    lastSeenRef.current[key] = Date.now();
    saveLastSeen(currentUserUid, lastSeenRef.current);
  };

  // When active conversation changes, mark it as seen and clear its badge
  useEffect(() => {
    if (!currentUserUid || !lastSeenReady) return;
    if (activeDM) {
      const key = `dm_${getDmId(currentUserUid, activeDM.uid)}`;
      markSeen(key);
      setDmUnread((prev) => ({ ...prev, [activeDM.uid]: 0 }));
    } else if (activeSeniorTutorDM) {
      const key = `senior_${activeSeniorTutorDM}`;
      markSeen(key);
      setSeniorDmUnread((prev) => ({ ...prev, [activeSeniorTutorDM]: 0 }));
    } else if (activeChannel) {
      const key = `channel_${activeChannel}`;
      markSeen(key);
      setChannelUnread((prev) => ({ ...prev, [activeChannel]: 0 }));
    }
  }, [
    activeChannel,
    activeDM,
    activeSeniorTutorDM,
    currentUserUid,
    lastSeenReady,
  ]);

  // Channel listeners
  useEffect(() => {
    if (!currentUserUid || !lastSeenReady || accessibleChannels.length === 0)
      return;

    const unsubs = accessibleChannels.map((channelId) => {
      const key = `channel_${channelId}`;
      if (isFirstSnapshotRef.current[key] === undefined) {
        isFirstSnapshotRef.current[key] = true;
      }

      const q = query(
        collection(db, "chatMessages", channelId, "messages"),
        orderBy("timestamp", "desc"),
        limit(50)
      );

      return onSnapshot(q, (snap) => {
        const isFirst = isFirstSnapshotRef.current[key];
        isFirstSnapshotRef.current[key] = false;

        const lastSeen = lastSeenRef.current[key] ?? 0;
        const isActive =
          activeChannel === channelId && !activeDM && !activeSeniorTutorDM;

        if (isActive) {
          markSeen(key);
          setChannelUnread((prev) => ({ ...prev, [channelId]: 0 }));
          return;
        }

        let newCount = 0;
        snap.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const data = change.doc.data();
          if (data.senderId === currentUserUid) return;
          const ts = data.timestamp?.toMillis?.() || 0;
          if (ts <= lastSeen) return;

          newCount++;

          if (!isFirst && onToast) {
            onToast({
              type: "channel",
              channelId,
              senderName: data.senderName,
              message: data.message,
            });
          }
        });

        if (newCount > 0) {
          setChannelUnread((prev) => ({
            ...prev,
            [channelId]: (prev[channelId] || 0) + newCount,
          }));
        }
      });
    });

    return () => unsubs.forEach((u) => u());
  }, [currentUserUid, lastSeenReady, accessibleChannels.join(",")]);

  // DM listeners
  useEffect(() => {
    if (!currentUserUid || !lastSeenReady || existingDMs.length === 0) return;

    const unsubs = existingDMs.map((tutor) => {
      const dmId = getDmId(currentUserUid, tutor.uid);
      const key = `dm_${dmId}`;
      if (isFirstSnapshotRef.current[key] === undefined) {
        isFirstSnapshotRef.current[key] = true;
      }

      const q = query(
        collection(db, "directMessages", dmId, "messages"),
        orderBy("timestamp", "desc"),
        limit(30)
      );

      return onSnapshot(q, (snap) => {
        const isFirst = isFirstSnapshotRef.current[key];
        isFirstSnapshotRef.current[key] = false;

        const lastSeen = lastSeenRef.current[key] ?? 0;
        const isActive = activeDM?.uid === tutor.uid && !activeSeniorTutorDM;

        if (isActive) {
          markSeen(key);
          setDmUnread((prev) => ({ ...prev, [tutor.uid]: 0 }));
          return;
        }

        let newCount = 0;
        snap.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const data = change.doc.data();
          if (data.senderId === currentUserUid) return;
          const ts = data.timestamp?.toMillis?.() || 0;
          if (ts <= lastSeen) return;

          newCount++;

          if (!isFirst && onToast) {
            onToast({
              type: "dm",
              tutorUid: tutor.uid,
              senderName: data.senderName,
              message: data.message,
            });
          }
        });

        if (newCount > 0) {
          setDmUnread((prev) => ({
            ...prev,
            [tutor.uid]: (prev[tutor.uid] || 0) + newCount,
          }));
        }
      });
    });

    return () => unsubs.forEach((u) => u());
  }, [currentUserUid, lastSeenReady, existingDMs.map((d) => d.uid).join(",")]);

  // Senior Tutor DM listeners
  useEffect(() => {
    if (!currentUserUid || !lastSeenReady) return;

    const senderIds = isSeniorTutor
      ? seniorTutorInboxSenders.map((s) => s.uid)
      : ["self"];

    if (senderIds.length === 0) return;

    const unsubs = senderIds.map((senderId) => {
      const firestoreSenderId = senderId === "self" ? currentUserUid : senderId;
      const key = `senior_${senderId}`;
      if (isFirstSnapshotRef.current[key] === undefined) {
        isFirstSnapshotRef.current[key] = true;
      }

      const q = query(
        collection(
          db,
          SENIOR_TUTOR_DM_COLLECTION,
          firestoreSenderId,
          "messages"
        ),
        orderBy("timestamp", "desc"),
        limit(30)
      );

      return onSnapshot(q, (snap) => {
        const isFirst = isFirstSnapshotRef.current[key];
        isFirstSnapshotRef.current[key] = false;

        const lastSeen = lastSeenRef.current[key] ?? 0;
        const isActive = activeSeniorTutorDM === senderId;

        if (isActive) {
          markSeen(key);
          setSeniorDmUnread((prev) => ({ ...prev, [senderId]: 0 }));
          return;
        }

        let newCount = 0;
        snap.docChanges().forEach((change) => {
          if (change.type !== "added") return;
          const data = change.doc.data();
          if (data.senderId === currentUserUid) return;
          const ts = data.timestamp?.toMillis?.() || 0;
          if (ts <= lastSeen) return;

          newCount++;

          if (!isFirst && onToast) {
            onToast({
              type: "seniorDm",
              senderId,
              senderName: data.senderName,
              message: data.message,
            });
          }
        });

        if (newCount > 0) {
          setSeniorDmUnread((prev) => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + newCount,
          }));
        }
      });
    });

    return () => unsubs.forEach((u) => u());
  }, [
    currentUserUid,
    lastSeenReady,
    isSeniorTutor,
    seniorTutorInboxSenders.map((s) => s.uid).join(","),
  ]);

  return { channelUnread, dmUnread, seniorDmUnread };
};

export default useUnreadCounts;
