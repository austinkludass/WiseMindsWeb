import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { db } from "../../data/firebase";
import IntakeLayout from "../../components/intake/IntakeLayout";
import StudentBasicsStep from "../../components/intake/steps/StudentBasicsStep";
import FamilyEmergencyStep from "../../components/intake/steps/FamilyEmergencyStep";
import AcademicNeedsStep from "../../components/intake/steps/AcademicNeedsStep";
import TrialStep from "../../components/intake/steps/TrialStep";
import RegularAvailabilityStep from "../../components/intake/steps/RegularAvailabilityStep";
import AdditionalInfoStep from "../../components/intake/steps/AdditionalInfoStep";
import AvailabilityFormatter from "../../utils/AvailabilityFormatter";

/**
 * Query parameter support for pre-filling the intake form.
 *
 * Family/guardian:
 * - parentName | guardianName | familyName | primaryName
 * - parentFirstName | guardianFirstName | familyFirst | familyFirstName | primaryFirstName
 * - parentLastName | guardianLastName | familyLast | familyLastName | primaryLastName
 * - parentEmail | guardianEmail | familyEmail | email
 * - parentPhone | guardianPhone | familyPhone | phone
 * - parentAddress | guardianAddress | familyAddress | address
 *
 * Child (first entry is used):
 * - childName | studentName (full name)
 * - childNames | children (list, separated by commas, semicolons, or pipes)
 * - childFirstName | studentFirstName | firstName
 * - childMiddleName | studentMiddleName | middleName
 * - childLastName | studentLastName | lastName
 *
 * Hidden location:
 * - homeLocation | location | locationId | location_id | preferredLocation
 */
const defaultFormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  dateOfBirth: null,
  allergiesAna: "",
  allergiesNonAna: "",
  doesCarryEpi: false,
  doesAdminEpi: false,
  parentName: "",
  familyEmail: "",
  familyPhone: "",
  familyAddress: "",
  secondaryContactName: "",
  secondaryContactEmail: "",
  secondaryContactPhone: "",
  schedulePreference: "same_time_within_hour",
  usePrimaryAsEmergency: false,
  emergencyFirst: "",
  emergencyLast: "",
  emergencyRelationship: "",
  emergencyRelationshipOther: "",
  emergencyPhone: "",
  school: "",
  yearLevel: "",
  notes: "",
  canOfferFood: true,
  avoidFoods: "",
  questions: "",
  howUserHeard: "",
  preferredStart: null,
  trialNotes: "",
  homeLocation: "",
  additionalNotes: "",
  consentAccepted: false,
};

const hasAvailability = (availability) =>
  Object.values(availability || {}).some((slots) => slots?.length);

const formatDateValue = (value) =>
  value && typeof value.toISOString === "function" ? value.toISOString() : null;

const defaultSubjects = [{ id: "", hours: "", selected: false }];

const getParamValue = (params, keys) => {
  for (const key of keys) {
    const value = params.get(key);
    if (value && value.trim()) {
      return value.trim();
    }
  }
  return "";
};

const splitFullName = (fullName = "") => {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { first: "", middle: "", last: "" };
  if (parts.length === 1) return { first: parts[0], middle: "", last: "" };
  if (parts.length === 2) return { first: parts[0], middle: "", last: parts[1] };
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(" "),
    last: parts[parts.length - 1],
  };
};

const parseChildNamesList = (raw) => {
  if (!raw) return [];
  return raw
    .split(/[|,;]/)
    .map((item) => item.trim())
    .filter(Boolean);
};

const ParentIntake = () => {
  const { search } = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [errors, setErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState(defaultFormData);
  const [subjects, setSubjects] = useState(defaultSubjects);
  const [availability, setAvailability] = useState({});
  const [trialAvailability, setTrialAvailability] = useState({});
  const [touched, setTouched] = useState({
    firstName: false,
    familyPhone: false,
    familyEmail: false,
  });

  const steps = useMemo(
    () => [
      { label: "Student", Component: StudentBasicsStep },
      { label: "Family", Component: FamilyEmergencyStep },
      { label: "Academic", Component: AcademicNeedsStep },
      { label: "Trial", Component: TrialStep },
      { label: "Availability", Component: RegularAvailabilityStep },
      { label: "Additional", Component: AdditionalInfoStep },
    ],
    []
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  useEffect(() => {
    if (!search) return;
    const params = new URLSearchParams(search);

    const parentNameRaw = getParamValue(params, [
      "parentName",
      "guardianName",
      "familyName",
      "primaryName",
    ]);
    const parentFirst = getParamValue(params, [
      "parentFirstName",
      "guardianFirstName",
      "familyFirst",
      "familyFirstName",
      "primaryFirstName",
    ]);
    const parentLast = getParamValue(params, [
      "parentLastName",
      "guardianLastName",
      "familyLast",
      "familyLastName",
      "primaryLastName",
    ]);
    const parentName =
      parentNameRaw || [parentFirst, parentLast].filter(Boolean).join(" ");

    const familyEmail = getParamValue(params, [
      "parentEmail",
      "guardianEmail",
      "familyEmail",
      "email",
    ]);
    const familyPhone = getParamValue(params, [
      "parentPhone",
      "guardianPhone",
      "familyPhone",
      "phone",
    ]);
    const familyAddress = getParamValue(params, [
      "parentAddress",
      "guardianAddress",
      "familyAddress",
      "address",
    ]);
    const homeLocation = getParamValue(params, [
      "homeLocation",
      "location",
      "locationId",
      "location_id",
      "preferredLocation",
    ]);

    const childNamesParam = getParamValue(params, ["childNames", "children"]);
    const childNames = parseChildNamesList(childNamesParam);
    const childNameRaw = getParamValue(params, ["childName", "studentName"]);
    const childFullName =
      childNameRaw || (childNames.length > 0 ? childNames[0] : "");

    const childFirst = getParamValue(params, [
      "childFirstName",
      "studentFirstName",
      "firstName",
    ]);
    const childMiddle = getParamValue(params, [
      "childMiddleName",
      "studentMiddleName",
      "middleName",
    ]);
    const childLast = getParamValue(params, [
      "childLastName",
      "studentLastName",
      "lastName",
    ]);

    const splitChild = childFullName ? splitFullName(childFullName) : null;

    setFormData((prev) => {
      const next = { ...prev };
      const setIfEmpty = (key, value) => {
        if (!value) return;
        if (typeof next[key] === "string" && next[key].trim() === "") {
          next[key] = value;
        }
      };

      setIfEmpty("parentName", parentName);
      setIfEmpty("familyEmail", familyEmail);
      setIfEmpty("familyPhone", familyPhone);
      setIfEmpty("familyAddress", familyAddress);

      setIfEmpty("firstName", childFirst || splitChild?.first || "");
      setIfEmpty("middleName", childMiddle || splitChild?.middle || "");
      setIfEmpty("lastName", childLast || splitChild?.last || "");

      if (homeLocation && next.homeLocation !== homeLocation) {
        next.homeLocation = homeLocation;
      }

      return next;
    });
  }, [search]);

  const buildSubmissionPayload = () => {
    const formattedTrial = hasAvailability(trialAvailability)
      ? AvailabilityFormatter(trialAvailability)
      : {};
    const formattedAvailability = hasAvailability(availability)
      ? AvailabilityFormatter(availability)
      : {};

    return {
      student: {
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formatDateValue(formData.dateOfBirth),
        allergiesAna: formData.allergiesAna,
        allergiesNonAna: formData.allergiesNonAna,
        doesCarryEpi: Boolean(formData.doesCarryEpi),
        doesAdminEpi: Boolean(formData.doesAdminEpi),
        familyPhone: formData.familyPhone,
        familyEmail: formData.familyEmail,
        familyAddress: formData.familyAddress,
        emergencyFirst: formData.emergencyFirst,
        emergencyLast: formData.emergencyLast,
        emergencyRelationship:
          formData.emergencyRelationship === "Other"
            ? formData.emergencyRelationshipOther || "Other"
            : formData.emergencyRelationship,
        emergencyPhone: formData.emergencyPhone,
        school: formData.school,
        yearLevel: formData.yearLevel,
        notes: formData.notes,
        canOfferFood: Boolean(formData.canOfferFood),
        avoidFoods: formData.avoidFoods,
        questions: formData.questions,
        howUserHeard: formData.howUserHeard,
        preferredStart: formatDateValue(formData.preferredStart),
        trialAvailability: formattedTrial,
        availability: formattedAvailability,
        subjects: subjects
          .filter((subject) => subject.id)
          .map((subject) => ({
            id: subject.id,
            hours: subject.hours ? String(subject.hours) : "0",
            selected: Boolean(subject.selected),
          })),
        homeLocation: formData.homeLocation,
        trialNotes: formData.trialNotes,
        additionalNotes: formData.additionalNotes,
      },
      family: {
        parentName: formData.parentName,
        parentEmail: formData.familyEmail,
        parentPhone: formData.familyPhone,
        parentAddress: formData.familyAddress,
        schedulePreference: formData.schedulePreference,
        secondaryName: formData.secondaryContactName,
        secondaryEmail: formData.secondaryContactEmail,
        secondaryPhone: formData.secondaryContactPhone,
      },
      meta: {
        status: "new",
        source: "parent-intake",
        submittedAt: new Date().toISOString(),
        consentAccepted: Boolean(formData.consentAccepted),
      },
    };
  };

  const validateForm = () => {
    const nextErrors = [];

    if (!formData.firstName.trim()) nextErrors.push("Student first name is required.");
    if (!formData.lastName.trim()) nextErrors.push("Student last name is required.");
    if (!formData.dateOfBirth) nextErrors.push("Date of birth is required.");

    if (!formData.parentName.trim())
      nextErrors.push("Primary guardian name is required.");
    if (!formData.familyEmail.trim())
      nextErrors.push("Primary guardian email is required.");
    if (!formData.familyPhone.trim())
      nextErrors.push("Primary guardian phone is required.");
    if (!formData.familyAddress.trim())
      nextErrors.push("Home address is required.");

    if (!formData.emergencyFirst.trim())
      nextErrors.push("Emergency contact first name is required.");
    if (!formData.emergencyLast.trim())
      nextErrors.push("Emergency contact last name is required.");
    if (!formData.emergencyRelationship)
      nextErrors.push("Emergency contact relationship is required.");
    if (
      formData.emergencyRelationship === "Other" &&
      !formData.emergencyRelationshipOther.trim()
    ) {
      nextErrors.push("Please specify the emergency contact relationship.");
    }
    if (!formData.emergencyPhone.trim())
      nextErrors.push("Emergency contact phone is required.");

    if (!formData.school.trim()) nextErrors.push("School is required.");
    if (!formData.yearLevel.trim()) nextErrors.push("Year level is required.");

    if (!hasAvailability(trialAvailability))
      nextErrors.push("Please add at least one trial availability slot.");
    if (!formData.preferredStart)
      nextErrors.push("Preferred start date is required.");
    if (!hasAvailability(availability))
      nextErrors.push("Please add regular availability.");

    if (!formData.howUserHeard.trim())
      nextErrors.push("Please tell us how you heard about Wise Minds.");

    if (!formData.consentAccepted)
      nextErrors.push("You must accept the terms and conditions.");

    return nextErrors;
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    // const validationErrors = validateForm();

    // if (validationErrors.length > 0) {
    //   setErrors(validationErrors);
    //   return;
    // }

    setErrors([]);
    setIsSubmitting(true);

    try {
      const payload = buildSubmissionPayload();
      console.log("Intake submission payload:", JSON.stringify(payload, null, 2));
      await addDoc(collection(db, "intakeSubmissions"), payload);
      setSubmitted(true);
      setFormData(defaultFormData);
      setSubjects(defaultSubjects);
      setAvailability({});
      setTrialAvailability({});
    } catch (error) {
      setErrors(["Submission failed. Please try again in a moment."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartNew = () => {
    setSubmitted(false);
    setCurrentStep(0);
    setErrors([]);
  };

  if (submitted) {
    return (
      <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 4, md: 8 } }}>
        <Stack spacing={3} sx={{ maxWidth: 700, mx: "auto" }}>
          <Typography variant="h3" fontWeight="bold">
            Thanks! Your submission is in.
          </Typography>
          <Typography variant="body1" color="text.secondary">
            We'll review the details and get back to you shortly to confirm the
            next steps.
          </Typography>
          <Button variant="contained" onClick={handleStartNew}>
            Submit another student
          </Button>
        </Stack>
      </Box>
    );
  }

  const ActiveStep = steps[currentStep].Component;

  return (
    <IntakeLayout
      steps={steps}
      currentStep={currentStep}
      errors={errors}
      onNext={handleNext}
      onBack={handleBack}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      isLastStep={currentStep === steps.length - 1}
    >
      <ActiveStep
        formData={formData}
        setFormData={setFormData}
        touched={touched}
        setTouched={setTouched}
        subjects={subjects}
        setSubjects={setSubjects}
        availability={availability}
        setAvailability={setAvailability}
        trialAvailability={trialAvailability}
        setTrialAvailability={setTrialAvailability}
      />
    </IntakeLayout>
  );
};

export default ParentIntake;
