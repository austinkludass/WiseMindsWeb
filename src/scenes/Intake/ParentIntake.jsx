import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { useLocation } from "react-router-dom";
import { db } from "../../data/firebase";
import IntakeLayout from "../../components/intake/IntakeLayout";
import FamilyStep from "../../components/intake/steps/FamilyStep";
import ChildrenStep from "../../components/intake/steps/ChildrenStep";
import AdditionalInfoStep from "../../components/intake/steps/AdditionalInfoStep";
import AvailabilityFormatter from "../../utils/AvailabilityFormatter";
import {
  createChild,
  createChildTouched,
  defaultFamilyData,
  formatDateValue,
  hasAvailability,
  normalizeTutorIds,
  validateAvailability,
} from "./intakeUtils";

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
 * Child (first entry is used for a single child unless childNames is supplied):
 * - childName | studentName (full name)
 * - childNames | children (list, separated by commas, semicolons, or pipes)
 * - childFirstName | studentFirstName | firstName
 * - childMiddleName | studentMiddleName | middleName
 * - childLastName | studentLastName | lastName
 *
 * Hidden location:
 * - homeLocation | location | locationId | location_id | preferredLocation
 */
/**
 * Intake submission payload contract (intakeSubmissions):
 * - family: guardian + emergency + household preferences; homeLocation is optional
 * - children: array of child objects; availability/subjects are per child
 * - meta: submission metadata
 *
 * Required (validation):
 * - family: parentName, familyEmail, familyPhone, familyAddress
 * - family: emergencyFirst, emergencyLast, emergencyRelationship, emergencyPhone
 * - family: howUserHeard, consentAccepted
 * - child: firstName, lastName, dateOfBirth, school, yearLevel
 * - child: preferredStart, trialAvailability, availability
 *
 * Normalization:
 * - date values are stored as ISO strings
 * - availability and trialAvailability are formatted via AvailabilityFormatter
 * - subjects include id, hours, and selected (request tutoring)
 */
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
  const [familyData, setFamilyData] = useState(defaultFamilyData);
  const [children, setChildren] = useState([createChild()]);
  const [childrenTouched, setChildrenTouched] = useState([
    createChildTouched(),
  ]);

  const steps = useMemo(
    () => [{ label: "Family" }, { label: "Children" }, { label: "Additional" }],
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

    setFamilyData((prev) => {
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

      if (homeLocation && next.homeLocation !== homeLocation) {
        next.homeLocation = homeLocation;
      }

      return next;
    });

    const listChildren = childNames.map((name) =>
      createChild(splitFullName(name))
    );

    const primaryChild = createChild({
      firstName: childFirst || splitChild?.first || "",
      middleName: childMiddle || splitChild?.middle || "",
      lastName: childLast || splitChild?.last || "",
    });

    const hasPrimaryName =
      primaryChild.firstName || primaryChild.middleName || primaryChild.lastName;

    if (listChildren.length > 0) {
      setChildren((prev) => {
        const hasExistingNames = prev.some(
          (child) => child.firstName || child.middleName || child.lastName
        );
        if (hasExistingNames) {
          return prev;
        }
        setChildrenTouched(listChildren.map(() => createChildTouched()));
        return listChildren;
      });
      return;
    }

    if (hasPrimaryName) {
      setChildren((prev) =>
        prev.map((child, index) =>
          index === 0
            ? {
                ...child,
                firstName: child.firstName || primaryChild.firstName,
                middleName: child.middleName || primaryChild.middleName,
                lastName: child.lastName || primaryChild.lastName,
              }
            : child
        )
      );
    }
  }, [search]);

  const buildSubmissionPayload = () => {
    return {
      family: {
        parentName: familyData.parentName,
        parentEmail: familyData.familyEmail,
        parentPhone: familyData.familyPhone,
        parentAddress: familyData.familyAddress,
        schedulePreference: familyData.schedulePreference,
        secondaryName: familyData.secondaryContactName,
        secondaryEmail: familyData.secondaryContactEmail,
        secondaryPhone: familyData.secondaryContactPhone,
        secondaryAddress: familyData.secondaryContactAddress,
        emergencyFirst: familyData.emergencyFirst,
        emergencyLast: familyData.emergencyLast,
        emergencyRelationship:
          familyData.emergencyRelationship === "Other"
            ? familyData.emergencyRelationshipOther || "Other"
            : familyData.emergencyRelationship,
        emergencyPhone: familyData.emergencyPhone,
        usePrimaryAsEmergency: Boolean(familyData.usePrimaryAsEmergency),
        howUserHeard: familyData.howUserHeard,
        additionalNotes: familyData.additionalNotes,
        homeLocation: familyData.homeLocation,
      },
      children: children.map((child) => ({
        firstName: child.firstName.trim(),
        middleName: child.middleName.trim(),
        lastName: child.lastName.trim(),
        dateOfBirth: formatDateValue(child.dateOfBirth),
        allergiesAna: child.allergiesAna,
        allergiesNonAna: child.allergiesNonAna,
        doesCarryEpi: Boolean(child.doesCarryEpi),
        doesAdminEpi: Boolean(child.doesAdminEpi),
        school: child.school,
        yearLevel: child.yearLevel,
        notes: child.notes,
        maxHoursPerDay: child.maxHoursPerDay,
        preferredStart: formatDateValue(child.preferredStart),
        trialNotes: child.trialNotes,
        canOfferFood: Boolean(child.canOfferFood),
        avoidFoods: child.avoidFoods,
        questions: child.questions,
        trialAvailability: hasAvailability(child.trialAvailability)
          ? AvailabilityFormatter(child.trialAvailability)
          : {},
        availability: hasAvailability(child.availability)
          ? AvailabilityFormatter(child.availability)
          : {},
        subjects: child.subjects
          .filter((subject) => subject.id)
          .map((subject) => ({
            id: subject.id,
            hours: subject.hours ? String(subject.hours) : "0",
            selected: Boolean(subject.selected),
            preferredTutorIds: normalizeTutorIds(
              subject.preferredTutorIds || subject.preferredTutors
            ),
            blockedTutorIds: normalizeTutorIds(
              subject.blockedTutorIds || subject.blockedTutors
            ),
          })),
      })),
      meta: {
        status: "new",
        source: "parent-intake",
        submittedAt: new Date().toISOString(),
        consentAccepted: Boolean(familyData.consentAccepted),
      },
    };
  };

  const validateForm = () => {
    const nextErrors = [];

    if (children.length < 1) nextErrors.push("Please add at least one child.");

    if (!familyData.parentName.trim())
      nextErrors.push("Primary guardian name is required.");
    if (!familyData.familyEmail.trim())
      nextErrors.push("Primary guardian email is required.");
    if (!familyData.familyPhone.trim())
      nextErrors.push("Primary guardian phone is required.");
    if (!familyData.familyAddress.trim())
      nextErrors.push("Home address is required.");

    if (!familyData.emergencyFirst.trim())
      nextErrors.push("Emergency contact first name is required.");
    if (!familyData.emergencyLast.trim())
      nextErrors.push("Emergency contact last name is required.");
    if (!familyData.emergencyRelationship)
      nextErrors.push("Emergency contact relationship is required.");
    if (
      familyData.emergencyRelationship === "Other" &&
      !familyData.emergencyRelationshipOther.trim()
    ) {
      nextErrors.push("Please specify the emergency contact relationship.");
    }
    if (!familyData.emergencyPhone.trim())
      nextErrors.push("Emergency contact phone is required.");

    children.forEach((child, index) => {
      const label = `Child ${index + 1}`;
      if (!child.firstName.trim())
        nextErrors.push(`${label}: first name is required.`);
      if (!child.lastName.trim())
        nextErrors.push(`${label}: last name is required.`);
      if (!child.dateOfBirth)
        nextErrors.push(`${label}: date of birth is required.`);
      if (!child.school.trim())
        nextErrors.push(`${label}: school is required.`);
      if (!child.yearLevel.trim())
        nextErrors.push(`${label}: year level is required.`);
      if (!hasAvailability(child.trialAvailability))
        nextErrors.push(`${label}: add at least one trial availability slot.`);
      if (!child.preferredStart)
        nextErrors.push(`${label}: preferred start date is required.`);
      if (!hasAvailability(child.availability))
        nextErrors.push(`${label}: add regular availability.`);

      if (hasAvailability(child.trialAvailability)) {
        nextErrors.push(
          ...validateAvailability(
            child.trialAvailability,
            `${label} trial availability`
          )
        );
      }

      if (hasAvailability(child.availability)) {
        nextErrors.push(
          ...validateAvailability(
            child.availability,
            `${label} regular availability`
          )
        );
      }
    });

    if (!familyData.howUserHeard.trim())
      nextErrors.push("Please tell us how you heard about Wise Minds.");

    if (!familyData.consentAccepted)
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
    const validationErrors = validateForm();

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    try {
      const payload = buildSubmissionPayload();
      console.log("Intake submission payload:", JSON.stringify(payload, null, 2));
      await addDoc(collection(db, "intakeSubmissions"), payload);
      setSubmitted(true);
      setFamilyData(defaultFamilyData);
      setChildren([createChild()]);
      setChildrenTouched([createChildTouched()]);
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
            Submit another family
          </Button>
        </Stack>
      </Box>
    );
  }

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
      {currentStep === 0 && (
        <FamilyStep formData={familyData} setFormData={setFamilyData} />
      )}
      {currentStep === 1 && (
        <ChildrenStep
          childrenData={children}
          setChildrenData={setChildren}
          childrenTouched={childrenTouched}
          setChildrenTouched={setChildrenTouched}
          createChild={createChild}
          createChildTouched={createChildTouched}
        />
      )}
      {currentStep === 2 && (
        <AdditionalInfoStep formData={familyData} setFormData={setFamilyData} />
      )}
    </IntakeLayout>
  );
};

export default ParentIntake;
