import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export const getLessonsForWeek = async (startDate, endDate) => {
  const lessonsRef = collection(db, "lessons");
  const q = query(
    lessonsRef,
    where("startDateTime", ">=", startDate.toISOString()),
    where("startDateTime", "<=", endDate.toISOString())
  );
  const snap = await getDocs(q);
  return snap.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      start: data.startDateTime.toDate
        ? data.startDateTime.toDate()
        : new Date(data.startDateTime),
      end: data.endDateTime.toDate
        ? data.endDateTime.toDate()
        : new Date(data.endDateTime),
    };
  });
};
