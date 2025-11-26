import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../data/firebase";
import dayjs from "dayjs";

export const getWeekRange = (date) => {
  const current = dayjs(date);
  const start = current.startOf("week");
  const end = start.add(6, "day");
  return { start, end };
};

export const nextWeek = (weekStart) => weekStart.add(7, "day");
export const prevWeek = (weekStart) => weekStart.subtract(7, "day");
export const getCurrentWeekStart = () => getWeekRange(dayjs()).start;

export const fetchLessonsForWeek = async (start, end) => {
  const startISO = start.startOf("day").toISOString();
  const endISO = end.endOf("day").toISOString();

  const q = query(
    collection(db, "lessons"),
    where("startDateTime", ">=", startISO),
    where("startDateTime", "<=", endISO)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
};

export const getUnreportedLessonsCount = (lessons) => {
  let count = 0;

  lessons.forEach((lesson) => {
    lesson.reports.forEach((r) => {
      if (!r.status) count++;
    });
  });

  return count;
};

export const getReportedCount = (lessons) => {
  let count = 0;
  lessons.forEach((lesson) => {
    lesson.reports.forEach((r) => {
      if (r.status) count++;
    });
  });
  return count;
};

export const getTotalReportsCount = (lessons) => {
  let count = 0;
  lessons.forEach((lesson) => {
    count += lesson.reports.length;
  });
  return count;
};

export const fetchInvoicesForWeek = async (date) => {
  const week = dayjs(date).startOf("day").format("YYYY-MM-DD");
  const col = collection(db, `invoices/${week}/items`);
  const snap = await getDocs(col);
  return snap.docs.map((d) => ({ id: d.id, ...d.data()}));
};
