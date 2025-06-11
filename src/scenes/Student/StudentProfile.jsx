// StudentProfile.jsx
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { db } from "../../data/firebase";
import { tokens } from "../../theme";
import Header from "../../components/Global/Header";
import Section from "../../components/Global/Section";
import StudentGeneralInfo from "../../components/student/StudentGeneralInfo";
import StudentFamilyInfo from "../../components/student/StudentFamilyInfo";
import StudentEmergencyInfo from "../../components/student/StudentEmergencyInfo";
import StudentAcademicInfo from "../../components/student/StudentAcademicInfo";
import StudentTrialInfo from "../../components/student/StudentTrialInfo";
import StudentAvailabilityInfo from "../../components/student/StudentAvailabilityInfo";
import StudentAdditionalInfo from "../../components/student/StudentAdditionalInfo";
import StudentAdminInformation from "../../components/student/StudentAdminInformation";

const StudentProfile = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [availability, setAvailability] = useState({});
  const [trialAvailability, setTrialAvailability] = useState({});

  const [isEditingGeneralInfo, setIsEditingGeneralInfo] = useState(false);
  const [touchedFields, setTouchedFields] = useState({});
  const [generalInfoForm, setGeneralInfoForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: null,
    allergiesAna: "",
    doesCarryEpi: false,
    doesAdminEpi: false,
    allergiesNonAna: "",
  });

  useEffect(() => {
    const fetchStudent = async () => {
      if (!studentId) return;

      const studentRef = doc(db, "students", studentId);
      const studentSnap = await getDoc(studentRef);

      if (studentSnap.exists()) {
        const fetchedData = studentSnap.data();
        setStudent(fetchedData);
        setSubjects(fetchedData.subjects);
        setAvailability(fetchedData.availability);
        setTrialAvailability(fetchedData.trialAvailability);

        setGeneralInfoForm({
          firstName: fetchedData.firstName || "",
          middleName: fetchedData.middleName || "",
          lastName: fetchedData.lastName || "",
          dateOfBirth: fetchedData.dateOfBirth
            ? dayjs(fetchedData.dateOfBirth)
            : null,
          allergiesAna: fetchedData.allergiesAna || "",
          doesCarryEpi: fetchedData.doesCarryEpi || false,
          doesAdminEpi: fetchedData.doesAdminEpi || false,
          allergiesNonAna: fetchedData.allergiesNonAna || "",
        });
      }
    };

    fetchStudent();
  }, [studentId]);

  if (!student) return <Typography>Loading...</Typography>;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header
          title={`${student.firstName} ${student.lastName}`}
          subtitle={`Year ${student.yearLevel}`}
        />
      </Box>

      <Section title="General Student Information">
        {isEditingGeneralInfo ? (
          <Box display="flex" justifyContent="flex-end" gap={1}>
            <Button
              variant="contained"
              onClick={async () => {
                const studentRef = doc(db, "students", studentId);
                await updateDoc(studentRef, {
                  ...generalInfoForm,
                  dateOfBirth:
                    generalInfoForm.dateOfBirth?.toISOString() || null,
                });
                setStudent((prev) => ({ ...prev, ...generalInfoForm }));
                setIsEditingGeneralInfo(false);
              }}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setGeneralInfoForm({
                  firstName: student.firstName || "",
                  middleName: student.middleName || "",
                  lastName: student.lastName || "",
                  dateOfBirth: student.dateOfBirth
                    ? dayjs(student.dateOfBirth)
                    : null,
                  allergiesAna: student.allergiesAna || "",
                  doesCarryEpi: student.doesCarryEpi || false,
                  doesAdminEpi: student.doesAdminEpi || false,
                  allergiesNonAna: student.allergiesNonAna || "",
                });
                setIsEditingGeneralInfo(false);
              }}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Box  display="flex" justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={() => setIsEditingGeneralInfo(true)}
            >
              Edit
            </Button>
          </Box>
        )}
        <StudentGeneralInfo
          formData={generalInfoForm}
          isEdit={isEditingGeneralInfo}
          setFormData={setGeneralInfoForm}
          touched={touchedFields}
          setTouched={setTouchedFields}
        />
      </Section>

      <Section title="Family Information">
        <StudentFamilyInfo
          formData={{
            familyPhone: student.familyPhone || "",
            familyEmail: student.familyEmail || "",
            familyAddress: student.familyAddress || "",
          }}
        />
      </Section>

      <Section title="Emergency Contact">
        <StudentEmergencyInfo
          formData={{
            emergencyFirst: student.emergencyFirst || "",
            emergencyLast: student.emergencyLast || "",
            emergencyRelationship: student.emergencyRelationship || "",
            emergencyPhone: student.emergencyPhone || "",
          }}
        />
      </Section>

      <Section title="Academic Information">
        <StudentAcademicInfo
          formData={{
            school: student.school || "",
            yearLevel: student.yearLevel || "",
            notes: student.notes || "",
          }}
          subjects={subjects}
        />
      </Section>

      <Section title="Trial Session">
        <Typography variant="h6" color={colors.orangeAccent[400]}>
          Available times for trial session
        </Typography>
        <StudentTrialInfo
          formData={{ preferredStart: student.preferredStart || null }}
          trialAvailability={trialAvailability}
        />
      </Section>

      <Section title="Regular Availability">
        <StudentAvailabilityInfo
          formData={{ isSameAsTrial: student.isSameAsTrial }}
          availability={availability}
        />
      </Section>

      <Section title="Additional Information">
        <StudentAdditionalInfo
          formData={{
            canOfferFood: student.canOfferFood || "",
            avoidFoods: student.avoidFoods || "",
            questions: student.questions || "",
            howUserHeard: student.howUserHeard || "",
          }}
        />
      </Section>

      <Section title="Admin Information">
        <StudentAdminInformation
          formData={{ homeLocation: student.homeLocation || "" }}
        />
      </Section>
    </LocalizationProvider>
  );
};

export default StudentProfile;
