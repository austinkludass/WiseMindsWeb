import { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../data/firebase";
import IntakeLayout from "../../components/intake/IntakeLayout";
import StudentBasicsStep from "../../components/intake/steps/StudentBasicsStep";
import FamilyEmergencyStep from "../../components/intake/steps/FamilyEmergencyStep";
import AcademicNeedsStep from "../../components/intake/steps/AcademicNeedsStep";
import TrialStep from "../../components/intake/steps/TrialStep";
import RegularAvailabilityStep from "../../components/intake/steps/RegularAvailabilityStep";
import AdditionalInfoStep from "../../components/intake/steps/AdditionalInfoStep";
import AvailabilityFormatter from "../../utils/AvailabilityFormatter";

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
  baseRate: "",
  additionalNotes: "",
  consentAccepted: false,
};

const hasAvailability = (availability) =>
  Object.values(availability || {}).some((slots) => slots?.length);

const formatDateValue = (value) =>
  value && typeof value.toISOString === "function" ? value.toISOString() : null;

const defaultSubjects = [{ id: "", hours: "" }];

const ParentIntake = () => {
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
          })),
        homeLocation: formData.homeLocation,
        baseRate: formData.baseRate ? Number(formData.baseRate) : null,
        trialNotes: formData.trialNotes,
        additionalNotes: formData.additionalNotes,
      },
      family: {
        parentName: formData.parentName,
        parentEmail: formData.familyEmail,
        parentPhone: formData.familyPhone,
        parentAddress: formData.familyAddress,
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

    if (!formData.baseRate)
      nextErrors.push("Expected hourly rate is required.");

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
