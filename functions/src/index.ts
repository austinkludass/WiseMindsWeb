import * as admin from "firebase-admin";
import {logger} from "firebase-functions";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {BigBatch} from "@qualdesk/firestore-big-batch";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

admin.initializeApp();
const db = admin.firestore();
dayjs.extend(isSameOrAfter);
dayjs.extend(utc);
dayjs.extend(timezone);

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

const tz = "Australia/Sydney";

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

async function generateLessonsForTemplate(
  templateId: string,
  template: any,
  weeksAhead = 26,
  force = false
) {
  const batch = new BigBatch({firestore: db});

  const frequencyWeeks = template.frequency === "weekly" ? 1 : 2;
  let current = dayjs(template.startDate).startOf("day");

  const hardEnd = template.endDate ?
    dayjs(template.endDate).endOf("day") :
    dayjs().add(weeksAhead, "week").startOf("day");

  while (current.isBefore(hardEnd)) {
    if (current.isSameOrAfter(dayjs().startOf("day"))) {
      const lessonId = `${templateId}_${current.format("YYYYMMDD")}`;
      const lessonRef = db.collection("lessons").doc(lessonId);

      const startDateTime = dayjs
        .tz(`${current.format("YYYY-MM-DD")}T${template.startTime}`, tz)
        .toISOString();

      const endDateTime = dayjs
        .tz(`${current.format("YYYY-MM-DD")}T${template.endTime}`, tz)
        .toISOString();

      const {startDate, startTime, endTime, endDate, ...templateData} =
        template;

      const lessonData = {
        ...templateData,
        templateId,
        startDateTime,
        endDateTime,
        students: template.studentIds.map((id: string, i: number) => ({
          studentId: id,
          studentName: template.studentNames[i],
          attendance: null,
          report: "",
        })),
        isException: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      };

      batch.set(lessonRef, lessonData, {merge: force});
    }
    current = current.add(frequencyWeeks, "week");
  }

  await batch.commit();
}

export const generateLessons = onSchedule(
  {
    schedule: "every monday 03:00",
    timeZone: "Australia/Sydney",
  },
  async () => {
    logger.info("Running weekly lesson generation...");
    const snap = await db.collection("lessonTemplates").get();
    for (const doc of snap.docs) {
      await generateLessonsForTemplate(doc.id, doc.data(), 26, false);
    }

    logger.info("Finished weekly lesson generation.");
  }
);

export const onLessonTemplateWrite = onDocumentWritten(
  {
    document: "lessonTemplates/{templateId}",
    region: "australia-southeast1",
  },
  async (event) => {
    const templateId = event.params.templateId as string;
    const after = event.data?.after?.data();

    if (!after) {
      const snap = await db
        .collection("lessons")
        .where("templateId", "==", templateId)
        .where("startDateTime", ">=", dayjs().toISOString())
        .where("isException", "==", false)
        .get();

      if (!snap.empty) {
        const batch = new BigBatch({firestore: db});
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
        logger.info(
          `Deleted future lessons for removed template ${templateId}`
        );
      }
      return;
    }

    const futureLessonsSnap = await db
      .collection("lessons")
      .where("templateId", "==", templateId)
      .where("startDateTime", ">=", dayjs().toISOString())
      .where("isException", "==", false)
      .get();

    if (!futureLessonsSnap.empty) {
      const batch = new BigBatch({firestore: db});
      futureLessonsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      logger.info(
        `Deleted ${futureLessonsSnap.size} 
        future lessons for template ${templateId}`
      );
    }

    const {endDate, ...templateData} = after;

    await generateLessonsForTemplate(
      templateId,
      {...templateData, endDate},
      26,
      true
    );
    logger.info(`Generated lessons for template ${templateId}`);
  }
);

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
