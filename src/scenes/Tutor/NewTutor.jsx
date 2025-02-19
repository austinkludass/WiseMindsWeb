import { React, useState } from "react";
import { Paper, Typography, Stack, Button, Box } from "@mui/material";
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

  const uploadProfileImage = async (userId) => {
    if (!profilePic) return null;

    const storageRef = ref(sb, `profilePictures/${userId}`);
    await uploadBytes(storageRef, profilePic);
    return await getDownloadURL(storageRef);
  };

  const uploadWwvpFile = async (userId) => {
    if (!wwvpFile) return null;

    const storageRef = ref(sb, `wwvpFiles/${userId}`);
    await uploadBytes(storageRef, wwvpFile);
    return await getDownloadURL(storageRef);
  };

  const uploadFirstAidFile = async (userId) => {
    if (!firstAidFile) return null;

    const storageRef = ref(sb, `firstAidFiles/${userId}`);
    await uploadBytes(storageRef, firstAidFile);
    return await getDownloadURL(storageRef);
  };

  const uploadPoliceCheckFile = async (userId) => {
    if (!policeCheckFile) return null;

    const storageRef = ref(sb, `policeCheckFiles/${userId}`);
    await uploadBytes(storageRef, policeCheckFile);
    return await getDownloadURL(storageRef);
  };

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

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        loginInfo.wiseMindsEmail,
        loginInfo.password
      );
      const user = userCredential.user;

      let avatarUrl = "";
      if (profilePic) {
        avatarUrl = await uploadProfileImage(user.uid);
      }

      let wwvpFileUrl = "";
      if (wwvpFile) {
        wwvpFileUrl = await uploadWwvpFile(user.uid);
      }

      let firstAidFileUrl = "";
      if (firstAidFile) {
        firstAidFileUrl = await uploadFirstAidFile(user.uid);
      }

      let policeCheckFileUrl = "";
      if (policeCheckFile) {
        policeCheckFileUrl = await uploadPoliceCheckFile(user.uid);
      }

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

      toast.success("Successfully added tutor!");
      navigate("/tutors");
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formattedAvailability = Object.fromEntries(
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

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header title="NEW TUTOR" subtitle="Enter details for a new tutor" />
      </Box>

      {/* Profile Information */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <TutorProfileInfo
          formData={profileInfo}
          setFormData={setProfileInfo}
          color={tutorColor}
          setColor={setTutorColor}
          profilePicFile={profilePic}
          setProfilePicFile={setProfilePic}
          touched={touched}
          setTouched={setTouched}
        />
      </Paper>

      {/* Login Information */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <TutorLoginInfo
          formData={loginInfo}
          setFormData={setLoginInfo}
          touched={touched}
          setTouched={setTouched}
        />
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={4}>
          <TutorContactInfo
            formData={contactInfo}
            setFormData={setContactInfo}
          />
          <TutorPersonalInfo
            formData={personalInfo}
            setFormData={setPersonalInfo}
          />
          <TutorEmergencyInfo
            formData={emergencyInfo}
            setFormData={setEmergencyInfo}
          />
          <TutorBankInfo formData={bankInfo} setFormData={setBankInfo} />
          <TutorWWVPInfo
            formData={wwvpInfo}
            setFormData={setWwvpInfo}
            wwvpFile={wwvpFile}
            setWwvpFile={setWwvpFile}
          />
          <TutorFirstAidInfo
            formData={firstAidInfo}
            setFormData={setFirstAidInfo}
            firstAidFile={firstAidFile}
            setFirstAidFile={setFirstAidFile}
          />
          <TutorPoliceCheckInfo
            formData={policeCheckInfo}
            setFormData={setPoliceCheckInfo}
            policeCheckFile={policeCheckFile}
            setPoliceCheckFile={setPoliceCheckFile}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Availability</Typography>
          <AvailabilitySelector
            onAvailabilityChange={handleAvailabilityChange}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Unavailability</Typography>
          <UnavailabilitySelector
            unavailability={specificUnavailability}
            onChange={setSpecificUnavailability}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Typography variant="h4">Capabilities</Typography>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Typography variant="h4">Blocked Students</Typography>
      </Paper>

      {/* Submit Button */}
      <Grid container justifyContent="flex-end" sx={{ m: 4 }}>
        <Button
          loading={loading}
          onClick={handleSubmit}
          variant="contained"
          color="primary"
        >
          <Typography variant="h4">Submit</Typography>
        </Button>
      </Grid>

      {/* Toast element */}
      <ToastContainer position="top-right" autoClose={3000} />
    </LocalizationProvider>
  );
};

export default NewTutor;
