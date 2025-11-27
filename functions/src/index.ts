import * as admin from "firebase-admin";
import {logger} from "firebase-functions";
import {onSchedule} from "firebase-functions/v2/scheduler";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {onCall} from "firebase-functions/https";
import {onRequest} from "firebase-functions/https";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";

admin.initializeApp();
const db = admin.firestore();
dayjs.extend(isSameOrBefore);
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

export interface LessonReport {
  effort: number | null;
  notes: string | null;
  quality: number | null;
  satisfaction: number | null;
  status: string | null;
  studentId: string;
  studentName: string;
  topic: string | null;
}

export interface Lesson {
  id: string;
  startDateTime: string;
  endDateTime: string;
  duration?: number;
  subjectGroupName: string;
  tutorName: string;
  type: string | null;
  reports: { [id: string]: LessonReport };
}

export interface FamilyStudentRef {
  id: string;
  name: string;
}

export interface Family {
  id: string;
  parentName: string;
  parentEmail: string;
  students: FamilyStudentRef[];
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

function daysUntil(ts?: any): number | null {
  if (!ts) return null;
  const d = dayjs(ts);
  if (!d.isValid()) return null;
  return d.diff(dayjs(), "day");
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

function requireApiKey(req: any, res: any): boolean {
  const key = req.headers["x-api-key"];
  const envKey = process.env.API_KEY;

  if (!key || key !== envKey) {
    res.status(401).json({error: "Unauthorized"});
    return false;
  }
  return true;
}

async function sendCollection(
  collectionName: string,
  res: any
) {
  const snap = await db.collection(collectionName).get();
  const arr = snap.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
  return res.json(arr);
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
    const before = event.data?.before?.data() as any | undefined;
    const after = event.data?.after?.data() as any | undefined;

    if (!after) {
      await Promise.all([
        deleteNotificationIfExists(tutorId, "missing_first_aid_file"),
        deleteNotificationIfExists(tutorId, "first_aid_expiring"),
        deleteNotificationIfExists(tutorId, "missing_emergency_contact_fields"),
      ]);

      try {
        await admin.auth().setCustomUserClaims(tutorId, null);
      } catch (error) {
        logger.error("Error clearing custom claims: ", error);
      }
      return;
    }

    const newRole = after.role;
    const oldRule = before?.role;

    if (newRole && newRole !== oldRule) {
      try {
        await admin.auth().setCustomUserClaims(tutorId, {role: newRole});
        logger.info(`Updated custom claims for ${tutorId} to role: ${newRole}`);
      } catch (error) {
        logger.error("Error setting custom claims: ", error);
      }
    }

    await evaluateTutorNotifications(tutorId, after);
  }
);

export const generateWeeklyStats = onSchedule(
  {
    schedule: "every monday 02:00",
    timeZone: "Australia/Sydney",
  },
  async () => {
    logger.info("Running weekly stats generation...");

    const collections = ["students", "tutors", "lessons", "subjects"];
    const counts: Record<string, number> = {};

    for (const col of collections) {
      const agg = await db.collection(col).count().get();
      counts[col] = agg.data().count;
    }

    const now = dayjs().tz(tz).startOf("day");
    const docId = now.format("YYYY-MM-DD");

    await db
      .collection("stats")
      .doc(docId)
      .set({
        ...counts,
        timestamp: admin.firestore.Timestamp.fromDate(now.toDate()),
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    logger.info("Saved stats snapshot:", counts);
  }
);

export const createRepeatingLessons = onCall(
  {
    region: "australia-southeast1",
    timeoutSeconds: 60,
  },
  async (request) => {
    const data = request.data;
    if (!data || !data.repeatingId || !data.startDateTime || !data.frequency) {
      throw new Error(
        "Missing required fields (repeatingId, startDateTime, frequency)"
      );
    }

    const {
      repeatingId,
      startDateTime,
      endDateTime,
      frequency,
      ...baseLessonData
    } = data;

    const start = dayjs(startDateTime).tz(tz);
    const end = dayjs(endDateTime).tz(tz);
    const endOfNextYear = dayjs().tz(tz).add(1, "year").endOf("year");
    const lessonsToCreate: any[] = [];
    const intervalDays = frequency === "weekly" ? 7 : 14;
    let nextStart = start;
    let nextEnd = end;

    while (nextStart.isSameOrBefore(endOfNextYear)) {
      lessonsToCreate.push({
        ...baseLessonData,
        startDateTime: nextStart.toISOString(),
        endDateTime: nextEnd.toISOString(),
        repeatingId,
        frequency,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      nextStart = nextStart.add(intervalDays, "day");
      nextEnd = nextEnd.add(intervalDays, "day");
    }

    const batch = db.batch();
    const lessonsCol = db.collection("lessons");

    for (const lesson of lessonsToCreate) {
      const docRef = lessonsCol.doc();
      batch.set(docRef, lesson);
    }

    await batch.commit();

    return {
      success: true,
      created: lessonsToCreate.length,
    };
  }
);

export const updateRepeatingLessons = onCall(
  {
    region: "australia-southeast1",
    timeoutSeconds: 60,
  },
  async (request) => {
    const {repeatingId, updatedFields, currentLessonStart,
      startShiftMs, endShiftMs} = request.data || {};
    if (!repeatingId || !updatedFields) {
      throw new Error("Missing required fields (repeatingId, updatedFields)");
    }

    try {
      const lessonsRef = db.collection("lessons");
      let query = lessonsRef.where("repeatingId", "==", repeatingId);
      if (currentLessonStart) {
        const startDate = dayjs(currentLessonStart).tz(tz).toDate();
        query = query.where("startDateTime", ">=", startDate.toISOString());
      }

      const snapshot = await query.get();
      if (snapshot.empty) {
        return {success: false, message: "No lessons found."};
      }

      const batch = db.batch();
      let opCount = 0;
      const MAX_BATCH_SIZE = 500;

      for (const doc of snapshot.docs) {
        const data = doc.data();
        const newStart = new Date(
          new Date(data.startDateTime).getTime() + startShiftMs
        );
        const newEnd = new Date(
          new Date(data.endDateTime).getTime() + endShiftMs
        );

        batch.update(doc.ref, {
          ...updatedFields,
          startDateTime: newStart.toISOString(),
          endDateTime: newEnd.toISOString(),
        });

        if (++opCount === MAX_BATCH_SIZE) {
          await batch.commit();
          opCount = 0;
        }
      }

      if (opCount > 0) await batch.commit();
      return {success: true, updated: snapshot.size};
    } catch (error: any) {
      throw new Error("Error updating repeating lessons:" + error.message);
    }
  }
);

export const deleteRepeatingLessons = onCall(
  {
    region: "australia-southeast1",
    timeoutSeconds: 60,
  },
  async (request) => {
    const {repeatingId, currentLessonStart} = request.data || {};

    if (!repeatingId || !currentLessonStart) {
      throw new Error(
        "Missing required fields (repeatingId, currentLessonStart)"
      );
    }

    try {
      const lessonsRef = db.collection("lessons");
      const startDate = dayjs(currentLessonStart).tz(tz).toISOString();

      const snapshot = await lessonsRef
        .where("repeatingId", "==", repeatingId)
        .where("startDateTime", ">=", startDate)
        .get();

      if (snapshot.empty) {
        return {success: false, message: "No lessons found."};
      }

      let opCount = 0;
      const MAX_BATCH_SIZE = 500;
      let batch = db.batch();

      for (const doc of snapshot.docs) {
        batch.delete(doc.ref);

        if (++opCount === MAX_BATCH_SIZE) {
          await batch.commit();
          batch = db.batch();
          opCount = 0;
        }
      }

      if (opCount > 0) await batch.commit();
      return {success: true, deleted: snapshot.size};
    } catch (error: any) {
      throw new Error("Error deleting repeating lessons:" + error.message);
    }
  }
);

export const api = onRequest(
  {
    region: "australia-southeast1",
    cors: true,
  },
  async (req, res) => {
    if (!requireApiKey(req, res)) return;

    const path = req.path.replace(/^\/api/, "").toLowerCase();

    try {
      switch (path) {
      case "/students":
        return sendCollection("students", res);

      case "/subjectgroups":
        return sendCollection("subjectGroups", res);

      case "/subjects":
        return sendCollection("subjects", res);

      case "/tutors":
        return sendCollection("tutors", res);

      case "/locations":
        return sendCollection("locations", res);

      default:
        res.status(404).json({error: "Unknown endpoint"});
      }
    } catch (error: any) {
      res.status(500).json({error: error.message});
    }
  }
);

export const generateWeeklyInvoices = onCall(
  {
    region: "australia-southeast1",
    timeoutSeconds: 60,
  },
  async (request) => {
    const {start, end} = request.data;
    if (!start || !end) throw new Error("Missing dates");

    const weekStart = dayjs(start).startOf("day").toISOString();
    const weekEnd = dayjs(end).endOf("day").toISOString();
    const weekKey = dayjs(start).startOf("day").format("YYYY-MM-DD");

    const lessonsSnap = await db
      .collection("lessons")
      .where("startDateTime", ">=", weekStart)
      .where("startDateTime", "<=", weekEnd)
      .get();

    const lessons: Lesson[] = lessonsSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Lesson, "id">),
    }))
      .filter((l) => l.type === "Normal" || l.type === "Tutor Trial");

    if (lessons.length === 0) {
      return {success: true};
    }

    const famSnap = await db.collection("families").get();
    const families: Family[] = famSnap.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Family, "id">),
    }));

    const findFamily = (studentId: string) =>
      families.find((f) => f.students?.some((s) => s.id === studentId));

    const familyMap = new Map<string, any[]>();

    for (const lesson of lessons) {
      const allReports = Object.values(lesson.reports || {}) as any[];

      for (const rep of allReports) {
        if (rep.status === "cancelled") continue;
        const family = findFamily(rep.studentId);
        if (!family) continue;

        const duration = dayjs(lesson.endDateTime)
          .diff(dayjs(lesson.startDateTime), "hours");

        const item = {
          lessonId: lesson.id,
          studentId: rep.studentId,
          studentName: rep.studentName,
          date: lesson.startDateTime,
          duration: duration,
          price: 0,
          subject: lesson.subjectGroupName || null,
          tutorName: lesson.tutorName,
          reported: rep.status,
        };

        if (!familyMap.has(family.id)) familyMap.set(family.id, []);
        familyMap.get(family.id)!.push(item);
      }
    }

    const weekCollection = db.collection(`invoices/${weekKey}/items`);
    const weekDocRef = db.collection("invoices").doc(weekKey);
    await weekDocRef.set({
      locked: false,
      lastGenerated: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
    const batch = db.batch();

    const existing = await weekCollection.get();
    existing.forEach((doc) => batch.delete(doc.ref));

    for (const [familyId, lineItems] of familyMap.entries()) {
      const fam = families.find((f) => f.id === familyId);
      if (!fam) continue;

      const ref = weekCollection.doc();
      const total = lineItems.reduce((sum, li) => sum + li.price, 0);

      const invoice = {
        familyId,
        familyName: fam.parentName,
        parentEmail: fam.parentEmail,
        weekStart: weekStart,
        weekEnd: weekEnd,
        total,
        lineItems,
      };

      batch.set(ref, invoice);
    }

    await batch.commit();

    return {success: true};
  }
);

