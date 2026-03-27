import dayjs from "dayjs";

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

export const lessonTypeValues = [
  "Normal",
  "Postpone",
  "Cancelled",
  "Student Trial",
  "Tutor Trial",
  "Unconfirmed",
];

export const lessonTypeMap = new Map(
  lessonTypeValues.map((value) => [value.toLowerCase(), value])
);

// PATCH stays partial but intentionally narrow.
export const lessonPatchAllowedFields = new Set([
  "startDateTime",
  "endDateTime",
  "type",
  "notes",
  "tutorId",
  "tutorName",
  "tutorColor",
  "subjectGroupId",
  "subjectGroupName",
  "locationId",
  "locationName",
  "studentIds",
  "studentNames",
  "reports",
]);

export function isPlainObject(value: any): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isNonEmptyString(value: any): value is string {
  return typeof value === "string" && value.trim() !== "";
}

export function normalizeLessonType(value: any): string | null {
  if (!isNonEmptyString(value)) return null;
  return lessonTypeMap.get(value.trim().toLowerCase()) ?? null;
}

export function validateStudentRoster(
  studentIds: any,
  studentNames: any
): {errors: string[]; studentIds: string[]; studentNames: string[]} {
  const errors: string[] = [];

  if (!Array.isArray(studentIds) || studentIds.length === 0) {
    errors.push("studentIds must be a non-empty array");
  }

  if (!Array.isArray(studentNames) || studentNames.length === 0) {
    errors.push("studentNames must be a non-empty array");
  }

  if (
    Array.isArray(studentIds) &&
    Array.isArray(studentNames) &&
    studentIds.length !== studentNames.length
  ) {
    errors.push("studentIds and studentNames must have the same length");
  }

  const normalizedStudentIds = Array.isArray(studentIds) ? studentIds : [];
  const normalizedStudentNames = Array.isArray(studentNames) ?
    studentNames :
    [];

  if (
    normalizedStudentIds.some((id) => !isNonEmptyString(id))
  ) {
    errors.push("studentIds must contain only non-empty strings");
  }

  if (
    normalizedStudentNames.some((name) => !isNonEmptyString(name))
  ) {
    errors.push("studentNames must contain only non-empty strings");
  }

  const uniqueIds = new Set(
    normalizedStudentIds.filter((id) => isNonEmptyString(id))
  );

  if (uniqueIds.size !== normalizedStudentIds.length) {
    errors.push("studentIds must not contain duplicates");
  }

  return {
    errors,
    studentIds: normalizedStudentIds,
    studentNames: normalizedStudentNames,
  };
}

export function validateLessonTimes(
  startDateTime: any,
  endDateTime: any
): string[] {
  const errors: string[] = [];

  if (!dayjs(startDateTime).isValid()) {
    errors.push("Invalid startDateTime");
  }

  if (!dayjs(endDateTime).isValid()) {
    errors.push("Invalid endDateTime");
  }

  if (errors.length > 0) {
    return errors;
  }

  const start = dayjs(startDateTime);
  const end = dayjs(endDateTime);

  if (!end.isAfter(start)) {
    errors.push("endDateTime must be after startDateTime");
  } else if (end.diff(start, "minute") < 60) {
    errors.push("Lesson duration must be at least 1 hour");
  }

  return errors;
}

export function validateReports(
  reports: any,
  studentIds?: string[]
): string[] {
  const errors: string[] = [];

  if (reports === undefined || reports === null) {
    errors.push("reports is required");
    return errors;
  }

  if (!Array.isArray(reports)) {
    errors.push("reports must be an array");
    return errors;
  }

  if (studentIds && reports.length !== studentIds.length) {
    errors.push(
      "reports length must match studentIds length"
    );
  }

  for (let i = 0; i < reports.length; i++) {
    const r = reports[i];
    if (!isPlainObject(r)) {
      errors.push(`reports[${i}] must be an object`);
      continue;
    }
    if (!isNonEmptyString(r.studentId)) {
      errors.push(`reports[${i}].studentId must be a non-empty string`);
    }
    if (!isNonEmptyString(r.studentName)) {
      errors.push(`reports[${i}].studentName must be a non-empty string`);
    }
  }

  if (studentIds && errors.length === 0) {
    const reportIds = reports.map((r: any) => r.studentId);
    const missingFromReports = studentIds.filter(
      (id) => !reportIds.includes(id)
    );
    const extraInReports = reportIds.filter(
      (id: string) => !studentIds.includes(id)
    );
    if (missingFromReports.length > 0) {
      errors.push(
        `reports missing entries for studentIds: ${missingFromReports.join(", ")}`
      );
    }
    if (extraInReports.length > 0) {
      errors.push(
        `reports contain studentIds not in studentIds array: ${extraInReports.join(", ")}`
      );
    }
  }

  return errors;
}

export function validateLessonCreatePayload(data: any): {
  details: string[];
  normalizedData?: Record<string, any>;
} {
  if (!isPlainObject(data)) {
    return {details: ["Request body must be a JSON object"]};
  }

  const details: string[] = [];

  if (!isNonEmptyString(data.tutorId)) {
    details.push("tutorId is required");
  }

  if (!isNonEmptyString(data.tutorColor)) {
    details.push("tutorColor is required");
  }

  if (!isNonEmptyString(data.tutorName)) {
    details.push("tutorName is required");
  }

  if (!isNonEmptyString(data.subjectGroupId)) {
    details.push("subjectGroupId is required");
  }

  if (!isNonEmptyString(data.subjectGroupName)) {
    details.push("subjectGroupName is required");
  }

  if (!isNonEmptyString(data.locationId)) {
    details.push("locationId is required");
  }

  if (!isNonEmptyString(data.locationName)) {
    details.push("locationName is required");
  }

  if (data.startDateTime === undefined) {
    details.push("startDateTime is required");
  }

  if (data.endDateTime === undefined) {
    details.push("endDateTime is required");
  }

  if (data.startDateTime !== undefined && data.endDateTime !== undefined) {
    details.push(...validateLessonTimes(data.startDateTime, data.endDateTime));
  }

  const normalizedType = normalizeLessonType(data.type);
  if (!normalizedType) {
    details.push(
      `type must be one of: ${lessonTypeValues.join(", ")}`
    );
  }

  if (data.notes !== undefined && typeof data.notes !== "string") {
    details.push("notes must be a string");
  }

  const rosterValidation = validateStudentRoster(
    data.studentIds,
    data.studentNames
  );
  details.push(...rosterValidation.errors);
  details.push(
    ...validateReports(data.reports, rosterValidation.studentIds)
  );

  if (details.length > 0) {
    return {details};
  }

  return {
    details,
    normalizedData: {
      ...data,
      type: normalizedType,
    },
  };
}

export function validateLessonPatchPayload(
  data: any
): {details: string[]; normalizedData?: Record<string, any>} {
  if (!isPlainObject(data)) {
    return {details: ["Request body must be a JSON object"]};
  }

  const details: string[] = [];
  const keys = Object.keys(data);

  if (keys.length === 0) {
    return {details: ["Request body must include at least one field"]};
  }

  const unknownFields = keys.filter(
    (key) => !lessonPatchAllowedFields.has(key)
  );

  if (unknownFields.length > 0) {
    details.push(
      `Unknown or protected fields: ${unknownFields.join(", ")}`
    );
  }

  const normalizedData = {...data};

  if ("type" in data) {
    const normalizedType = normalizeLessonType(data.type);
    if (!normalizedType) {
      details.push(
        `type must be one of: ${lessonTypeValues.join(", ")}`
      );
    } else {
      normalizedData.type = normalizedType;
    }
  }

  if ("notes" in data && typeof data.notes !== "string") {
    details.push("notes must be a string");
  }

  const hasStart = "startDateTime" in data;
  const hasEnd = "endDateTime" in data;
  if (hasStart || hasEnd) {
    if (!hasStart || !hasEnd) {
      details.push(
        "startDateTime and endDateTime must be provided together"
      );
    } else {
      details.push(
        ...validateLessonTimes(data.startDateTime, data.endDateTime)
      );
    }
  }

  const tutorKeys = ["tutorId", "tutorName", "tutorColor"];
  const tutorKeysPresent = tutorKeys.filter((key) => key in data);
  if (
    tutorKeysPresent.length > 0 &&
    tutorKeysPresent.length !== tutorKeys.length
  ) {
    details.push(
      "tutorId, tutorName, and tutorColor must be provided together"
    );
  } else if (tutorKeysPresent.length === tutorKeys.length) {
    if (!isNonEmptyString(data.tutorId)) {
      details.push("tutorId must be a non-empty string");
    }
    if (!isNonEmptyString(data.tutorName)) {
      details.push("tutorName must be a non-empty string");
    }
    if (!isNonEmptyString(data.tutorColor)) {
      details.push("tutorColor must be a non-empty string");
    }
  }

  const subjectKeys = ["subjectGroupId", "subjectGroupName"];
  const subjectKeysPresent = subjectKeys.filter((key) => key in data);
  if (
    subjectKeysPresent.length > 0 &&
    subjectKeysPresent.length !== subjectKeys.length
  ) {
    details.push(
      "subjectGroupId and subjectGroupName must be provided together"
    );
  } else if (subjectKeysPresent.length === subjectKeys.length) {
    if (!isNonEmptyString(data.subjectGroupId)) {
      details.push("subjectGroupId must be a non-empty string");
    }
    if (!isNonEmptyString(data.subjectGroupName)) {
      details.push("subjectGroupName must be a non-empty string");
    }
  }

  const locationKeys = ["locationId", "locationName"];
  const locationKeysPresent = locationKeys.filter((key) => key in data);
  if (
    locationKeysPresent.length > 0 &&
    locationKeysPresent.length !== locationKeys.length
  ) {
    details.push("locationId and locationName must be provided together");
  } else if (locationKeysPresent.length === locationKeys.length) {
    if (!isNonEmptyString(data.locationId)) {
      details.push("locationId must be a non-empty string");
    }
    if (!isNonEmptyString(data.locationName)) {
      details.push("locationName must be a non-empty string");
    }
  }

  const hasStudentIds = "studentIds" in data;
  const hasStudentNames = "studentNames" in data;
  const hasReports = "reports" in data;
  const isRosterUpdate = hasStudentIds || hasStudentNames;

  if (isRosterUpdate && !(hasStudentIds && hasStudentNames && hasReports)) {
    details.push(
      "studentIds, studentNames, and reports must be provided together"
    );
  }

  let validatedStudentIds: string[] | undefined;
  if (hasStudentIds || hasStudentNames) {
    const rosterValidation = validateStudentRoster(
      data.studentIds,
      data.studentNames
    );
    details.push(...rosterValidation.errors);
    validatedStudentIds = rosterValidation.studentIds;
  }

  if (hasReports) {
    details.push(...validateReports(data.reports, validatedStudentIds));
  }

  if (details.length > 0) {
    return {details};
  }

  return {
    details,
    normalizedData,
  };
}
