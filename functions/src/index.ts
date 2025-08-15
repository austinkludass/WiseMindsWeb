import * as admin from "firebase-admin";
import {logger} from "firebase-functions";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import dayjs from "dayjs";

admin.initializeApp();
const db = admin.firestore();

type Priority = "low" | "medium" | "high";

interface Tutor {
  firstAidFilePath?: string | null;
  faExpiry?: admin.firestore.Timestamp | null;
  emergencyName?: string | null;
  emergencyPhone?: string | null;
  emergencyEmail?: string | null;
  emergencyRelationship?: string | null;
}

interface NotificationDoc {
  userId: string;
  key: string;
  title: string;
  message: string;
  priority: Priority;
  read: boolean;
  createdAt: admin.firestore.FieldValue | admin.firestore.Timestamp;
  updatedAt: admin.firestore.FieldValue | admin.firestore.Timestamp;
}

const notifId = (userId: string, key: string) => `${userId}__${key}`;

async function upsertNotification(
  userId: string,
  key: string,
  title: string,
  message: string,
  priority: Priority
) {
  const id = notifId(userId, key);
  const ref = db.collection("notifications").doc(id);
  const snap = await ref.get();

  const base: Partial<NotificationDoc> = {
    userId,
    key,
    title,
    message,
    priority,
    read: false,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  if (snap.exists) {
    await ref.update(base);
  } else {
    await ref.set({
      ...base,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    } as NotificationDoc);
  }
}

async function deleteNotificationIfExists(userId: string, key: string) {
  const id = notifId(userId, key);
  const ref = db.collection("notifications").doc(id);
  const snap = await ref.get();
  if (snap.exists) {
    await ref.delete();
  }
}

function isBlank(v: any) {
  if (v === null || v === undefined) return true;
  if (typeof v === "string") return v.trim() === "";
  if (typeof v === "object") return Object.keys(v).length === 0;
  return false;
}

function daysUntil(ts?: admin.firestore.Timestamp | null): number | null {
  if (!ts) return null;
  const now = dayjs();
  const d = dayjs(ts.toDate());
  return d.diff(now, "day");
}

async function evaluateTutorNotifications(tutorId: string, tutor: Tutor) {
  if (isBlank(tutor.firstAidFilePath)) {
    await upsertNotification(
      tutorId,
      "missing_first_aid_file",
      "First Aid Certificate Missing",
      "Please upload your First Aid document to your profile.",
      "low"
    );
  } else {
    await deleteNotificationIfExists(tutorId, "missing_first_aid_file");
  }

  const days = daysUntil(tutor.faExpiry ?? null);
  if (days !== null && days <= 30 && days >= 0) {
    await upsertNotification(
      tutorId,
      "first_aid_expiring",
      "First Aid Expiring Soon",
      `Your First Aid certificate will expire in ${days} day${
        days === 1 ? "" : "s"
      }.`,
      "medium"
    );
  } else {
    await deleteNotificationIfExists(tutorId, "first_aid_expiring");
  }

  const missingEC =
    isBlank(tutor.emergencyName) ||
    isBlank(tutor.emergencyPhone) ||
    isBlank(tutor.emergencyEmail) ||
    isBlank(tutor.emergencyRelationship);

  if (missingEC) {
    await upsertNotification(
      tutorId,
      "missing_emergency_contact_fields",
      "Emergency Contact Details Incomplete",
      "Please fill in your Emergency Contact details",
      "high"
    );
  } else {
    await deleteNotificationIfExists(
      tutorId,
      "missing_emergency_contact_fields"
    );
  }
}

export const generateTutorNotifications = onSchedule(
  {
    schedule: "every 24 hours",
    timeZone: "Australia/Sydney",
  },
  async () => {
    logger.info("Running scheduled tutor notification generation...");

    const pageSize = 300;
    let last: FirebaseFirestore.QueryDocumentSnapshot | undefined;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      let query = db
        .collection("tutors")
        .orderBy(admin.firestore.FieldPath.documentId())
        .limit(pageSize);
      if (last) query = query.startAfter(last);

      const snap = await query.get();
      if (snap.empty) break;

      for (const doc of snap.docs) {
        const tutor = doc.data() as Tutor;
        await evaluateTutorNotifications(doc.id, tutor);
      }

      last = snap.docs[snap.docs.length - 1];
      if (snap.size < pageSize) break;
    }
  }
);

export const onTutorWrite = onDocumentWritten(
  {
    document: "tutors/{tutorId}",
    region: "australia-southeast1",
  },
  async (event) => {
    const tutorId = event.params.tutorId as string;
    const after = event.data?.after?.data() as Tutor | undefined;

    if (!after) {
      await Promise.all([
        deleteNotificationIfExists(tutorId, "missing_first_aid_file"),
        deleteNotificationIfExists(tutorId, "first_aid_expiring"),
        deleteNotificationIfExists(tutorId, "missing_emergency_contact_fields"),
      ]);
      return;
    }

    await evaluateTutorNotifications(tutorId, after);
  }
);
