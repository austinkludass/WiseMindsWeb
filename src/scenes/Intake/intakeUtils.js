const defaultFamilyData = {
  parentName: "",
  familyEmail: "",
  familyPhone: "",
  familyAddress: "",
  secondaryContactName: "",
  secondaryContactEmail: "",
  secondaryContactPhone: "",
  secondaryContactAddress: "",
  secondaryContactSameAddress: true,
  schedulePreference: "same_time_within_hour",
  usePrimaryAsEmergency: false,
  emergencyFirst: "",
  emergencyLast: "",
  emergencyRelationship: "",
  emergencyRelationshipOther: "",
  emergencyPhone: "",
  howUserHeard: "",
  homeLocation: "",
  additionalNotes: "",
  consentAccepted: false,
};

const hasAvailability = (availability) =>
  Object.values(availability || {}).some((slots) => slots?.length);

const formatDateValue = (value) =>
  value && typeof value.toISOString === "function" ? value.toISOString() : null;

const defaultSubjects = [
  {
    id: "",
    hours: "",
    selected: false,
    preferredTutorIds: [],
    blockedTutorIds: [],
  },
];

const normalizeTutorIds = (value) => {
  if (!value) return [];
  if (!Array.isArray(value)) return [];
  const ids = value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object") {
        return item.id || item.tutorId || "";
      }
      return "";
    })
    .filter(Boolean);
  return Array.from(new Set(ids));
};

const createChild = (overrides = {}) => ({
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: null,
  allergiesAna: "",
  allergiesNonAna: "",
  doesCarryEpi: false,
  doesAdminEpi: false,
  school: "",
  yearLevel: "",
  notes: "",
  maxHoursPerDay: "",
  preferredStart: null,
  trialNotes: "",
  canOfferFood: true,
  avoidFoods: "",
  questions: "",
  subjects: defaultSubjects.map((subject) => ({ ...subject })),
  availability: {},
  trialAvailability: {},
  ...overrides,
});

const createChildTouched = () => ({
  firstName: false,
  lastName: false,
});

const toTimeValue = (value) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.getTime();
  }
  if (typeof value === "string" && value.includes(":")) {
    const [hours, minutes] = value.split(":").map(Number);
    if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.getTime();
  }
  return null;
};

const validateAvailability = (availability, label) => {
  const messages = [];
  const reported = new Set();

  Object.entries(availability || {}).forEach(([day, slots]) => {
    if (!Array.isArray(slots) || slots.length === 0) return;

    const normalized = [];
    let hasInvalidValue = false;
    let hasInvalidRange = false;

    slots.forEach((slot) => {
      const start = toTimeValue(slot.start);
      const end = toTimeValue(slot.end);
      if (start === null || end === null) {
        hasInvalidValue = true;
        return;
      }
      if (start >= end) {
        hasInvalidRange = true;
      }
      normalized.push({ start, end });
    });

    if (hasInvalidValue) {
      const key = `${label}-${day}-invalid`;
      if (!reported.has(key)) {
        messages.push(`${label}: ${day} has an invalid time value.`);
        reported.add(key);
      }
    }

    if (hasInvalidRange) {
      const key = `${label}-${day}-range`;
      if (!reported.has(key)) {
        messages.push(`${label}: ${day} has an end time before the start time.`);
        reported.add(key);
      }
    }

    if (normalized.length > 1) {
      normalized.sort((a, b) => a.start - b.start);
      const hasOverlap = normalized.some((slot, index) => {
        if (index === 0) return false;
        return slot.start < normalized[index - 1].end;
      });
      if (hasOverlap) {
        const key = `${label}-${day}-overlap`;
        if (!reported.has(key)) {
          messages.push(`${label}: ${day} has overlapping time slots.`);
          reported.add(key);
        }
      }
    }
  });

  return messages;
};

export {
  createChild,
  createChildTouched,
  defaultFamilyData,
  defaultSubjects,
  formatDateValue,
  hasAvailability,
  normalizeTutorIds,
  validateAvailability,
};
