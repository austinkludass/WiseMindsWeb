import { useCallback, useState, useMemo } from "react";
import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  useTheme,
  LinearProgress,
  Grid2 as Grid,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { tokens } from "../../theme";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ToastContainer } from "react-toastify";
import Header from "../../components/Global/Header";
import StudentGeneralInfo from "../../components/student/StudentGeneralInfo";
import StudentFamilyInfo from "../../components/student/StudentFamilyInfo";
import StudentEmergencyInfo from "../../components/student/StudentEmergencyInfo";
import StudentAcademicInfo from "../../components/student/StudentAcademicInfo";
import StudentAdditionalInfo from "../../components/student/StudentAdditionalInfo";
import "dayjs/locale/en-gb";
import StudentTrialInfo from "../../components/student/StudentTrialInfo";
import StudentAvailabilityInfo from "../../components/student/StudentAvailabilityInfo";

const NewStudent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [trialAvailability, setTrialAvailability] = useState({});
  const [availability, setAvailability] = useState({});
  const [subjects, setSubjects] = useState([]);
  
  const handleSubmit = (e) => {
    e.preventDefault();

    // firebase api send to DB

    // Get Trial > formatAvailability(trialAvailability)
    // Get Availability > formatAvailability(availability)
    // Get Subjects > subjects
  };

  const [touched, setTouched] = useState({
    firstName: false,
    familyPhone: false,
    familyEmail: false,
  });

  const [generalInfo, setGeneralInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: null,
    allergiesAna: "",
    allergiesNonAna: "",
    doesCarryEpi: false,
    doesAdminEpi: false,
  });

  const [familyInfo, setFamilyInfo] = useState({
    familyPhone: "",
    familyEmail: "",
    familyAddress: "",
  });

  const [emergencyInfo, setEmergencyInfo] = useState({
    emergencyFirst: "",
    emergencyLast: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  });

  const [academicInfo, setAcademicInfo] = useState({
    school: "",
    yearLevel: "",
    notes: "",
  });

  const [additionalInfo, setAdditionalInfo] = useState({
    canOfferFood: true,
    avoidFoods: "",
    questions: "",
    howUserHeard: "",
  });

  const [trialInfo, setTrialInfo] = useState({
    preferredStart: null,
  });

  const [availabilityInfo, setAvailabilityInfo] = useState({
    isSameAsTrial: false,
  });

  const setGeneralInfoCallback = useCallback(
    (info) => setGeneralInfo(info),
    []
  );

  const setFamilyInfoCallback = useCallback((info) => setFamilyInfo(info), []);
  const setEmergencyInfoCallback = useCallback(
    (info) => setEmergencyInfo(info),
    []
  );

  const setAcademicInfoCallback = useCallback(
    (info) => setAcademicInfo(info),
    []
  );

  const setAdditionalInfoCallback = useCallback(
    (info) => setAdditionalInfo(info),
    []
  );

  const setTrialInfoCallback = useCallback((info) => setTrialInfo(info), []);

  const setAvailabilityInfoCallback = useCallback(
    (info) => setAvailabilityInfo(info),
    []
  );

  const formatAvailability = (availabilityObj) => {
    return Object.fromEntries(
      Object.entries(availabilityObj).map(([day, slots]) => [
        day,
        slots.map((slot) => ({
          start: new Date(slot.start).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          end: new Date(slot.end).toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        })),
      ])
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header title="NEW STUDENT" subtitle="Enter details for new student" />
      </Box>

      {/* General Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">General Student Information</Typography>
          <StudentGeneralInfo
            formData={generalInfo}
            setFormData={setGeneralInfoCallback}
            touched={touched}
            setTouched={setTouched}
            isEdit={true}
          />
        </Stack>
      </Paper>

      {/* Family Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Family Information</Typography>
          <StudentFamilyInfo
            formData={familyInfo}
            setFormData={setFamilyInfoCallback}
            touched={touched}
            setTouched={setTouched}
            isEdit={true}
          />
        </Stack>
      </Paper>

      {/* Emergency Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Emergency Contact</Typography>
          <StudentEmergencyInfo
            formData={emergencyInfo}
            setFormData={setEmergencyInfoCallback}
            touched={touched}
            setTouched={setTouched}
            isEdit={true}
          />
        </Stack>
      </Paper>

      {/* Academic Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Academic Information</Typography>
          <StudentAcademicInfo
            formData={academicInfo}
            setFormData={setAcademicInfoCallback}
            isEdit={true}
            subjects={subjects}
            setSubjects={setSubjects}
          />
        </Stack>
      </Paper>

      {/* Trial Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Trial Session</Typography>
          <Typography variant="h6" color={colors.orangeAccent[400]}>
            Available times for trial session
          </Typography>
          <StudentTrialInfo
            formData={trialInfo}
            setFormData={setTrialInfoCallback}
            isEdit={true}
            trialAvailability={trialAvailability}
            setTrialAvailability={setTrialAvailability}
          />
        </Stack>
      </Paper>

      {/* Availability Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Regular Availability</Typography>
          <StudentAvailabilityInfo
            formData={availabilityInfo}
            setFormData={setAvailabilityInfoCallback}
            isEdit={true}
            availability={availability}
            setAvailability={setAvailability}
          />
        </Stack>
      </Paper>

      {/* Additional Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Additional Information</Typography>
          <StudentAdditionalInfo
            formData={additionalInfo}
            setFormData={setAdditionalInfoCallback}
            isEdit={true}
          />
        </Stack>
      </Paper>

      <Grid
        container
        justifyContent="flex-end"
        sx={{ alignItems: "center", m: 5 }}
      >
        {loading && (
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ width: "50%", marginRight: 4 }}
          />
        )}
        <Button
          loading={loading}
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          <Typography variant="h4">Submit</Typography>
        </Button>
      </Grid>

      <ToastContainer position="top-right" autoClose={3000} />
    </LocalizationProvider>
  );
};

export default NewStudent;
