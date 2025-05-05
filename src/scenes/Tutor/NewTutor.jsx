import { React, useState, useMemo, useCallback } from "react";
import {
  Paper,
  Typography,
  Stack,
  Button,
  Box,
  LinearProgress,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { useColor } from "react-color-palette";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, sb } from "../../data/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Grid from "@mui/material/Grid2";
import Header from "../../components/Global/Header";
import AvailabilitySelector from "../../components/Tutor/AvailabilitySelector";
import UnavailabilitySelector from "../../components/Tutor/UnavailabilitySelector";
import TutorProfileInfo from "../../components/Tutor/TutorProfileInfo";
import TutorLoginInfo from "../../components/Tutor/TutorLoginInfo";
import TutorContactInfo from "../../components/Tutor/TutorContactInfo";
import TutorPersonalInfo from "../../components/Tutor/TutorPersonalInfo";
import TutorEmergencyInfo from "../../components/Tutor/TutorEmergencyInfo";
import TutorBankInfo from "../../components/Tutor/TutorBankInfo";
import TutorWWVPInfo from "../../components/Tutor/TutorWWVPInfo";
import TutorFirstAidInfo from "../../components/Tutor/TutorFirstAidInfo";
import TutorPoliceCheckInfo from "../../components/Tutor/TutorPoliceCheckInfo";
import "react-toastify/dist/ReactToastify.css";
import "dayjs/locale/en-gb";
import TutorBlockedStudents from "../../components/Tutor/TutorBlockedStudents";

const NewTutor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [specificUnavailability, setSpecificUnavailability] = useState([]);
  const [availability, setAvailability] = useState({});
  const [profilePic, setProfilePic] = useState(null);
  const [tutorColor, setTutorColor] = useColor("#6e6e6e");
  const [wwvpFile, setWwvpFile] = useState(null);
  const [firstAidFile, setFirstAidFile] = useState(null);
  const [policeCheckFile, setPoliceCheckFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [touched, setTouched] = useState({
    firstName: false,
    wiseMindsEmail: false,
    password: false,
    secondPassword: false,
  });

  const [profileInfo, setProfileInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: null,
  });

  const [loginInfo, setLoginInfo] = useState({
    wiseMindsEmail: "",
    password: "",
    secondPassword: "",
  });

  const [contactInfo, setContactInfo] = useState({
    personalEmail: "",
    phone: "",
    address: "",
  });

  const [personalInfo, setPersonalInfo] = useState({
    career: "",
    degree: "",
    position: "",
    homeLocation: "",
    role: "tutor",
    hours: [0, 20],
  });

  const [emergencyInfo, setEmergencyInfo] = useState({
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    emergencyEmail: "",
  });

  const [bankInfo, setBankInfo] = useState({
    bankName: "",
    accountName: "",
    bsb: "",
    accountNumber: "",
    tfn: "",
    superCompany: "",
  });

  const [wwvpInfo, setWwvpInfo] = useState({
    wwvpName: "",
    wwvpRegNumber: "",
    wwvpCardNumber: "",
    wwvpExpiry: null,
  });

  const [firstAidInfo, setFirstAidInfo] = useState({
    faCourseDate: null,
    faProvider: "",
    faNumber: "",
    faCourseType: "",
    faCourseCode: "",
    faExpiry: null,
  });

  const [policeCheckInfo, setPoliceCheckInfo] = useState({
    pcName: "",
    pcIsNational: false,
    pcAddress: "",
    pcResult: "",
    pcAPPRef: "",
  });

  const handleAvailabilityChange = (updatedAvailability) => {
    setAvailability(updatedAvailability);
  };

  const isFormValid = () => {
    return (
      profileInfo.firstName &&
      loginInfo.wiseMindsEmail &&
      loginInfo.password &&
      loginInfo.secondPassword
    );
  };

  const setProfileInfoCallback = useCallback(
    (info) => setProfileInfo(info),
    []
  );
  const setLoginInfoCallback = useCallback((info) => setLoginInfo(info), []);
  const setContactInfoCallback = useCallback(
    (info) => setContactInfo(info),
    []
  );
  const setPersonalInfoCallback = useCallback(
    (info) => setPersonalInfo(info),
    []
  );
  const setEmergencyInfoCallback = useCallback(
    (info) => setEmergencyInfo(info),
    []
  );
  const setBankInfoCallback = useCallback((info) => setBankInfo(info), []);
  const setWWVPInfoCallback = useCallback((info) => setWwvpInfo(info), []);
  const setFirstAidInfoCallback = useCallback(
    (info) => setFirstAidInfo(info),
    []
  );
  const setPoliceCheckInfoCallback = useCallback(
    (info) => setPoliceCheckInfo(info),
    []
  );

  const uploadFileToFirebase = async (file, path) => {
    if (!file) return null;
    const storageRef = ref(sb, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const uploadProfileImage = (userId) =>
    uploadFileToFirebase(profilePic, `profilePictures/${userId}`);
  const uploadWwvpFile = (userId) =>
    uploadFileToFirebase(wwvpFile, `wwvpFiles/${userId}`);
  const uploadFirstAidFile = (userId) =>
    uploadFileToFirebase(firstAidFile, `firstAidFiles/${userId}`);
  const uploadPoliceCheckFile = (userId) =>
    uploadFileToFirebase(policeCheckFile, `policeCheckFiles/${userId}`);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      setTouched({
        firstName: true,
        wiseMindsEmail: true,
        password: true,
        secondPassword: true,
      });
      toast.error("Complete all required fields");
      return;
    }

    if (loginInfo.password !== loginInfo.secondPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    setUploadProgress(10);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        loginInfo.wiseMindsEmail,
        loginInfo.password
      );
      const user = userCredential.user;
      setUploadProgress(30);

      const [avatarUrl, wwvpFileUrl, firstAidFileUrl, policeCheckFileUrl] =
        await Promise.all([
          uploadProfileImage(user.uid),
          uploadWwvpFile(user.uid),
          uploadFirstAidFile(user.uid),
          uploadPoliceCheckFile(user.uid),
        ]);
      setUploadProgress(90);

      await setDoc(doc(db, "tutors", user.uid), {
        avatar: avatarUrl,
        wwvpFilePath: wwvpFileUrl,
        firstAidFilePath: firstAidFileUrl,
        policeCheckFilePath: policeCheckFileUrl,
        tutorColor: tutorColor.hex,
        availability: formattedAvailability,
        unavailability: specificUnavailability,
        firstName: profileInfo.firstName,
        middleName: profileInfo.middleName,
        lastName: profileInfo.lastName,
        dateOfBirth: profileInfo.dateOfBirth?.toISOString() || null,
        wiseMindsEmail: loginInfo.wiseMindsEmail,
        personalEmail: contactInfo.personalEmail,
        phone: contactInfo.phone,
        address: contactInfo.address,
        career: personalInfo.career,
        degree: personalInfo.degree,
        position: personalInfo.position,
        homeLocation: personalInfo.homeLocation,
        role: personalInfo.role,
        hours: personalInfo.hours,
        emergencyName: emergencyInfo.emergencyName,
        emergencyRelationship: emergencyInfo.emergencyRelationship,
        emergencyPhone: emergencyInfo.emergencyPhone,
        emergencyEmail: emergencyInfo.emergencyEmail,
        bankName: bankInfo.bankName,
        accountName: bankInfo.accountName,
        bsb: bankInfo.bsb,
        accountNumber: bankInfo.accountNumber,
        tfn: bankInfo.tfn,
        superCompany: bankInfo.superCompany,
        wwvpName: wwvpInfo.wwvpName,
        wwvpRegNumber: wwvpInfo.wwvpRegNumber,
        wwvpCardNumber: wwvpInfo.wwvpCardNumber,
        wwvpExpiry: wwvpInfo.wwvpExpiry?.toISOString() || null,
        faCourseDate: firstAidInfo.faCourseDate?.toISOString() || null,
        faProvider: firstAidInfo.faProvider,
        faNumber: firstAidInfo.faNumber,
        faCourseType: firstAidInfo.faCourseType,
        faCourseCode: firstAidInfo.faCourseCode,
        faExpiry: firstAidInfo.faExpiry?.toISOString() || null,
        pcName: policeCheckInfo.pcName,
        pcIsNational: policeCheckInfo.pcIsNational,
        pcAddress: policeCheckInfo.pcAddress,
        pcResult: policeCheckInfo.pcResult,
        pcAPPRef: policeCheckInfo.pcAPPRef,
      });
      setUploadProgress(100);

      toast.success("Successfully added tutor!");
      navigate("/tutors");
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formattedAvailability = useMemo(() => {
    return Object.fromEntries(
      Object.entries(availability).map(([day, slots]) => [
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
  }, [availability]);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header title="NEW TUTOR" subtitle="Enter details for a new tutor" />
      </Box>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <TutorProfileInfo
          formData={profileInfo}
          setFormData={setProfileInfoCallback}
          color={tutorColor}
          setColor={setTutorColor}
          profilePicFile={profilePic}
          setProfilePicFile={setProfilePic}
          touched={touched}
          setTouched={setTouched}
          isEdit={true}
        />
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <TutorLoginInfo
          formData={loginInfo}
          setFormData={setLoginInfoCallback}
          touched={touched}
          setTouched={setTouched}
        />
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={4}>
          <TutorContactInfo
            formData={contactInfo}
            setFormData={setContactInfoCallback}
            isEdit={true}
          />
          <TutorPersonalInfo
            formData={personalInfo}
            setFormData={setPersonalInfoCallback}
            isEdit={true}
          />
          <TutorEmergencyInfo
            formData={emergencyInfo}
            setFormData={setEmergencyInfoCallback}
            isEdit={true}
          />
          <TutorBankInfo
            formData={bankInfo}
            setFormData={setBankInfoCallback}
            isEdit={true}
          />
          <TutorWWVPInfo
            formData={wwvpInfo}
            setFormData={setWWVPInfoCallback}
            wwvpFile={wwvpFile}
            setWwvpFile={setWwvpFile}
            isEdit={true}
          />
          <TutorFirstAidInfo
            formData={firstAidInfo}
            setFormData={setFirstAidInfoCallback}
            firstAidFile={firstAidFile}
            setFirstAidFile={setFirstAidFile}
            isEdit={true}
          />
          <TutorPoliceCheckInfo
            formData={policeCheckInfo}
            setFormData={setPoliceCheckInfoCallback}
            policeCheckFile={policeCheckFile}
            setPoliceCheckFile={setPoliceCheckFile}
            isEdit={true}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Availability</Typography>
          <AvailabilitySelector
            onAvailabilityChange={handleAvailabilityChange}
            isEdit={true}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Unavailability</Typography>
          <UnavailabilitySelector
            unavailability={specificUnavailability}
            onChange={setSpecificUnavailability}
            isEdit={true}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Typography variant="h4">Capabilities</Typography>
      </Paper>

      <Paper
        sx={{
          p: 3,
          maxWidth: 1000,
          minWidth: 600,
          mb: 12,
          mt: 4,
          ml: 4,
          mr: 4,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="h4">Blocked Students</Typography>
          <TutorBlockedStudents />
        </Stack>
      </Paper>

      {/* Remove Paper to revert */}
      {/* <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "99%",
          maxWidth: "1111px",
          zIndex: 1000,
          p: 2,
          boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
        }}
      > */}
        <Grid container justifyContent="flex-end" sx={{ alignItems: "center", m: 5 }}>
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
      {/* </Paper> */}

      <ToastContainer position="top-right" autoClose={3000} />
    </LocalizationProvider>
  );
};

export default NewTutor;
