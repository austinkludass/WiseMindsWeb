import {
  isPlainObject,
  isNonEmptyString,
  normalizeLessonType,
  validateStudentRoster,
  validateLessonTimes,
  validateReports,
  validateLessonCreatePayload,
  validateLessonPatchPayload,
  lessonTypeValues,
} from "../src/validation";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function validCreatePayload(overrides: Record<string, any> = {}) {
  return {
    tutorId: "tutor-1",
    tutorColor: "#ff0000",
    tutorName: "Jane Doe",
    subjectGroupId: "sg-1",
    subjectGroupName: "Maths",
    locationId: "loc-1",
    locationName: "Room A",
    startDateTime: "2025-06-01T09:00:00Z",
    endDateTime: "2025-06-01T11:00:00Z",
    type: "Normal",
    studentIds: ["s-1"],
    studentNames: ["Alice"],
    reports: [{studentId: "s-1", studentName: "Alice"}],
    ...overrides,
  };
}


// ---------------------------------------------------------------------------
// isPlainObject
// ---------------------------------------------------------------------------

describe("isPlainObject", () => {
  it("returns true for {}", () => expect(isPlainObject({})).toBe(true));
  it("returns true for { key: 'value' }", () =>
    expect(isPlainObject({key: "value"})).toBe(true));
  it("returns false for null", () => expect(isPlainObject(null)).toBe(false));
  it("returns false for undefined", () =>
    expect(isPlainObject(undefined)).toBe(false));
  it("returns false for arrays", () => expect(isPlainObject([])).toBe(false));
  it("returns false for strings", () =>
    expect(isPlainObject("hello")).toBe(false));
  it("returns false for numbers", () => expect(isPlainObject(42)).toBe(false));
});

// ---------------------------------------------------------------------------
// isNonEmptyString
// ---------------------------------------------------------------------------

describe("isNonEmptyString", () => {
  it("returns true for normal string", () =>
    expect(isNonEmptyString("hello")).toBe(true));
  it("returns true for string with surrounding spaces", () =>
    expect(isNonEmptyString(" hello ")).toBe(true));
  it("returns false for empty string", () =>
    expect(isNonEmptyString("")).toBe(false));
  it("returns false for whitespace-only string", () =>
    expect(isNonEmptyString("   ")).toBe(false));
  it("returns false for null", () =>
    expect(isNonEmptyString(null)).toBe(false));
  it("returns false for undefined", () =>
    expect(isNonEmptyString(undefined)).toBe(false));
  it("returns false for number", () =>
    expect(isNonEmptyString(42)).toBe(false));
});

// ---------------------------------------------------------------------------
// normalizeLessonType
// ---------------------------------------------------------------------------

describe("normalizeLessonType", () => {
  it("normalizes exact match", () =>
    expect(normalizeLessonType("Normal")).toBe("Normal"));
  it("normalizes lowercase", () =>
    expect(normalizeLessonType("normal")).toBe("Normal"));
  it("normalizes uppercase", () =>
    expect(normalizeLessonType("NORMAL")).toBe("Normal"));
  it("trims whitespace", () =>
    expect(normalizeLessonType(" normal ")).toBe("Normal"));
  it("handles multi-word types", () =>
    expect(normalizeLessonType("student trial")).toBe("Student Trial"));
  it("returns null for empty string", () =>
    expect(normalizeLessonType("")).toBeNull());
  it("returns null for unknown type", () =>
    expect(normalizeLessonType("InvalidType")).toBeNull());
  it("returns null for null", () =>
    expect(normalizeLessonType(null)).toBeNull());
  it("returns null for number", () =>
    expect(normalizeLessonType(42)).toBeNull());
});

// ---------------------------------------------------------------------------
// validateStudentRoster
// ---------------------------------------------------------------------------

describe("validateStudentRoster", () => {
  it("passes with matching arrays", () => {
    const result = validateStudentRoster(["s-1"], ["Alice"]);
    expect(result.errors).toEqual([]);
  });

  it("passes with multiple students", () => {
    const result = validateStudentRoster(
      ["s-1", "s-2", "s-3"],
      ["Alice", "Bob", "Charlie"]
    );
    expect(result.errors).toEqual([]);
  });

  it("errors when studentIds is not an array", () => {
    const result = validateStudentRoster("not-array", ["Alice"]);
    expect(result.errors).toContain("studentIds must be a non-empty array");
  });

  it("errors when studentNames is not an array", () => {
    const result = validateStudentRoster(["s-1"], "not-array");
    expect(result.errors).toContain("studentNames must be a non-empty array");
  });

  it("errors when studentIds is empty", () => {
    const result = validateStudentRoster([], ["Alice"]);
    expect(result.errors).toContain("studentIds must be a non-empty array");
  });

  it("errors when arrays have different lengths", () => {
    const result = validateStudentRoster(["s-1", "s-2"], ["Alice"]);
    expect(result.errors).toContain(
      "studentIds and studentNames must have the same length"
    );
  });

  it("errors when studentIds contains empty string", () => {
    const result = validateStudentRoster([""], ["Alice"]);
    expect(result.errors).toContain(
      "studentIds must contain only non-empty strings"
    );
  });

  it("errors on duplicate studentIds", () => {
    const result = validateStudentRoster(["s-1", "s-1"], ["Alice", "Bob"]);
    expect(result.errors).toContain("studentIds must not contain duplicates");
  });

  it("returns normalized arrays", () => {
    const result = validateStudentRoster(["s-1"], ["Alice"]);
    expect(result.studentIds).toEqual(["s-1"]);
    expect(result.studentNames).toEqual(["Alice"]);
  });
});

// ---------------------------------------------------------------------------
// validateLessonTimes
// ---------------------------------------------------------------------------

describe("validateLessonTimes", () => {
  it("passes with valid times 2 hours apart", () => {
    const errors = validateLessonTimes(
      "2025-06-01T09:00:00Z",
      "2025-06-01T11:00:00Z"
    );
    expect(errors).toEqual([]);
  });

  it("passes with exactly 1 hour", () => {
    const errors = validateLessonTimes(
      "2025-06-01T09:00:00Z",
      "2025-06-01T10:00:00Z"
    );
    expect(errors).toEqual([]);
  });

  it("errors on invalid startDateTime", () => {
    const errors = validateLessonTimes("not-a-date", "2025-06-01T11:00:00Z");
    expect(errors).toContain("Invalid startDateTime");
  });

  it("errors on invalid endDateTime", () => {
    const errors = validateLessonTimes("2025-06-01T09:00:00Z", "not-a-date");
    expect(errors).toContain("Invalid endDateTime");
  });

  it("errors when end equals start", () => {
    const errors = validateLessonTimes(
      "2025-06-01T09:00:00Z",
      "2025-06-01T09:00:00Z"
    );
    expect(errors).toContain("endDateTime must be after startDateTime");
  });

  it("errors when end is before start", () => {
    const errors = validateLessonTimes(
      "2025-06-01T11:00:00Z",
      "2025-06-01T09:00:00Z"
    );
    expect(errors).toContain("endDateTime must be after startDateTime");
  });

  it("errors when duration is less than 1 hour", () => {
    const errors = validateLessonTimes(
      "2025-06-01T09:00:00Z",
      "2025-06-01T09:30:00Z"
    );
    expect(errors).toContain("Lesson duration must be at least 1 hour");
  });
});

// ---------------------------------------------------------------------------
// validateReports
// ---------------------------------------------------------------------------

describe("validateReports", () => {
  describe("presence and type", () => {
    it("errors when reports is undefined", () => {
      expect(validateReports(undefined)).toContain("reports is required");
    });

    it("errors when reports is null", () => {
      expect(validateReports(null)).toContain("reports is required");
    });

    it("errors when reports is a string", () => {
      expect(validateReports("not-array")).toContain(
        "reports must be an array"
      );
    });

    it("errors when reports is an object", () => {
      expect(validateReports({})).toContain("reports must be an array");
    });
  });

  describe("per-report structure", () => {
    it("passes with valid report (no studentIds)", () => {
      const errors = validateReports([
        {studentId: "s-1", studentName: "Alice"},
      ]);
      expect(errors).toEqual([]);
    });

    it("errors when report is not an object", () => {
      const errors = validateReports(["not-an-object"]);
      expect(errors).toContain("reports[0] must be an object");
    });

    it("errors when report is null", () => {
      const errors = validateReports([null]);
      expect(errors).toContain("reports[0] must be an object");
    });

    it("errors when studentId is missing", () => {
      const errors = validateReports([{studentName: "Alice"}]);
      expect(errors).toContain(
        "reports[0].studentId must be a non-empty string"
      );
    });

    it("errors when studentId is empty", () => {
      const errors = validateReports([{studentId: "", studentName: "Alice"}]);
      expect(errors).toContain(
        "reports[0].studentId must be a non-empty string"
      );
    });

    it("errors when studentName is missing", () => {
      const errors = validateReports([{studentId: "s-1"}]);
      expect(errors).toContain(
        "reports[0].studentName must be a non-empty string"
      );
    });

    it("reports indexed errors for multiple invalid reports", () => {
      const errors = validateReports([
        {studentId: "s-1", studentName: "Alice"},
        {studentId: "", studentName: ""},
      ]);
      expect(errors).toContain(
        "reports[1].studentId must be a non-empty string"
      );
      expect(errors).toContain(
        "reports[1].studentName must be a non-empty string"
      );
    });
  });

  describe("cross-validation with studentIds", () => {
    it("passes when reports match studentIds (same order)", () => {
      const errors = validateReports(
        [{studentId: "s-1", studentName: "Alice"}],
        ["s-1"]
      );
      expect(errors).toEqual([]);
    });

    it("passes when reports match studentIds (different order)", () => {
      const errors = validateReports(
        [
          {studentId: "s-2", studentName: "Bob"},
          {studentId: "s-1", studentName: "Alice"},
        ],
        ["s-1", "s-2"]
      );
      expect(errors).toEqual([]);
    });

    it("errors on length mismatch", () => {
      const errors = validateReports(
        [{studentId: "s-1", studentName: "Alice"}],
        ["s-1", "s-2"]
      );
      expect(errors).toContain(
        "reports length must match studentIds length"
      );
    });

    it("errors when report has student not in studentIds", () => {
      const errors = validateReports(
        [{studentId: "s-99", studentName: "Unknown"}],
        ["s-1"]
      );
      // Length matches (1 === 1) but IDs differ
      expect(errors).toContain(
        "reports missing entries for studentIds: s-1"
      );
      expect(errors).toContain(
        "reports contain studentIds not in studentIds array: s-99"
      );
    });

    it("skips cross-validation when studentIds is undefined", () => {
      const errors = validateReports([
        {studentId: "s-1", studentName: "Alice"},
      ]);
      expect(errors).toEqual([]);
    });

    it("skips cross-validation when structural errors exist", () => {
      const errors = validateReports(
        [{studentId: "", studentName: "Alice"}],
        ["s-1"]
      );
      // Should have structural error but NOT cross-validation errors
      expect(errors).toContain(
        "reports[0].studentId must be a non-empty string"
      );
      expect(errors).not.toContain(
        expect.stringContaining("reports missing entries")
      );
    });
  });
});

// ---------------------------------------------------------------------------
// validateLessonCreatePayload
// ---------------------------------------------------------------------------

describe("validateLessonCreatePayload", () => {
  it("passes with valid full payload", () => {
    const result = validateLessonCreatePayload(validCreatePayload());
    expect(result.details).toEqual([]);
    expect(result.normalizedData).toBeDefined();
    expect(result.normalizedData!.type).toBe("Normal");
  });

  it("normalizes type in output", () => {
    const result = validateLessonCreatePayload(
      validCreatePayload({type: "cancelled"})
    );
    expect(result.details).toEqual([]);
    expect(result.normalizedData!.type).toBe("Cancelled");
  });

  it("errors when data is not an object", () => {
    const result = validateLessonCreatePayload(null);
    expect(result.details).toContain("Request body must be a JSON object");
  });

  it("errors when data is an array", () => {
    const result = validateLessonCreatePayload([]);
    expect(result.details).toContain("Request body must be a JSON object");
  });

  it("reports all missing required fields", () => {
    const result = validateLessonCreatePayload({});
    expect(result.details).toContain("tutorId is required");
    expect(result.details).toContain("tutorColor is required");
    expect(result.details).toContain("tutorName is required");
    expect(result.details).toContain("subjectGroupId is required");
    expect(result.details).toContain("subjectGroupName is required");
    expect(result.details).toContain("locationId is required");
    expect(result.details).toContain("locationName is required");
    expect(result.details).toContain("startDateTime is required");
    expect(result.details).toContain("endDateTime is required");
  });

  it("errors on invalid type", () => {
    const result = validateLessonCreatePayload(
      validCreatePayload({type: "InvalidType"})
    );
    expect(result.details).toContain(
      `type must be one of: ${lessonTypeValues.join(", ")}`
    );
  });

  it("errors when notes is not a string", () => {
    const result = validateLessonCreatePayload(
      validCreatePayload({notes: 123})
    );
    expect(result.details).toContain("notes must be a string");
  });

  it("allows undefined notes", () => {
    const payload = validCreatePayload();
    const result = validateLessonCreatePayload(payload);
    // notes key not present at all — should be fine
    expect(result.details).toEqual([]);
  });

  it("catches reports-roster mismatch", () => {
    const result = validateLessonCreatePayload(
      validCreatePayload({
        studentIds: ["s-1"],
        studentNames: ["Alice"],
        reports: [{studentId: "s-99", studentName: "Wrong"}],
      })
    );
    expect(result.details.length).toBeGreaterThan(0);
    expect(result.details.some((d) => d.includes("reports"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateLessonPatchPayload
// ---------------------------------------------------------------------------

describe("validateLessonPatchPayload", () => {
  it("passes with valid single field", () => {
    const result = validateLessonPatchPayload({notes: "hello"});
    expect(result.details).toEqual([]);
    expect(result.normalizedData).toBeDefined();
  });

  it("errors when data is not an object", () => {
    const result = validateLessonPatchPayload(null);
    expect(result.details).toContain("Request body must be a JSON object");
  });

  it("errors on empty object", () => {
    const result = validateLessonPatchPayload({});
    expect(result.details).toContain(
      "Request body must include at least one field"
    );
  });

  it("errors on unknown fields", () => {
    const result = validateLessonPatchPayload({unknownField: "value"});
    expect(result.details).toContain(
      "Unknown or protected fields: unknownField"
    );
  });

  it("normalizes type", () => {
    const result = validateLessonPatchPayload({type: "postpone"});
    expect(result.details).toEqual([]);
    expect(result.normalizedData!.type).toBe("Postpone");
  });

  it("errors on invalid type", () => {
    const result = validateLessonPatchPayload({type: "invalid"});
    expect(result.details).toContain(
      `type must be one of: ${lessonTypeValues.join(", ")}`
    );
  });

  // Time co-requirements
  it("errors when only startDateTime is provided", () => {
    const result = validateLessonPatchPayload({
      startDateTime: "2025-06-01T09:00:00Z",
    });
    expect(result.details).toContain(
      "startDateTime and endDateTime must be provided together"
    );
  });

  it("passes with both times together", () => {
    const result = validateLessonPatchPayload({
      startDateTime: "2025-06-01T09:00:00Z",
      endDateTime: "2025-06-01T11:00:00Z",
    });
    expect(result.details).toEqual([]);
  });

  // Tutor trio co-requirement
  it("errors when only tutorId is provided", () => {
    const result = validateLessonPatchPayload({tutorId: "t-1"});
    expect(result.details).toContain(
      "tutorId, tutorName, and tutorColor must be provided together"
    );
  });

  it("passes with all three tutor fields", () => {
    const result = validateLessonPatchPayload({
      tutorId: "t-1",
      tutorName: "Jane",
      tutorColor: "#ff0000",
    });
    expect(result.details).toEqual([]);
  });

  // Subject pair co-requirement
  it("errors when only subjectGroupId is provided", () => {
    const result = validateLessonPatchPayload({subjectGroupId: "sg-1"});
    expect(result.details).toContain(
      "subjectGroupId and subjectGroupName must be provided together"
    );
  });

  it("passes with both subject fields", () => {
    const result = validateLessonPatchPayload({
      subjectGroupId: "sg-1",
      subjectGroupName: "Maths",
    });
    expect(result.details).toEqual([]);
  });

  // Location pair co-requirement
  it("errors when only locationId is provided", () => {
    const result = validateLessonPatchPayload({locationId: "loc-1"});
    expect(result.details).toContain(
      "locationId and locationName must be provided together"
    );
  });

  it("passes with both location fields", () => {
    const result = validateLessonPatchPayload({
      locationId: "loc-1",
      locationName: "Room A",
    });
    expect(result.details).toEqual([]);
  });

  // Roster trio co-requirement
  it("errors when studentIds provided without studentNames and reports", () => {
    const result = validateLessonPatchPayload({studentIds: ["s-1"]});
    expect(result.details).toContain(
      "studentIds, studentNames, and reports must be provided together"
    );
  });

  it("passes with full roster update", () => {
    const result = validateLessonPatchPayload({
      studentIds: ["s-1"],
      studentNames: ["Alice"],
      reports: [{studentId: "s-1", studentName: "Alice"}],
    });
    expect(result.details).toEqual([]);
  });

  it("catches reports-roster mismatch in patch", () => {
    const result = validateLessonPatchPayload({
      studentIds: ["s-1"],
      studentNames: ["Alice"],
      reports: [{studentId: "s-99", studentName: "Wrong"}],
    });
    expect(result.details.length).toBeGreaterThan(0);
  });
});
