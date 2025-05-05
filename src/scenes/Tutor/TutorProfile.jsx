import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../data/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Typography, Box, Paper, Stack } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/en-gb";
import Header from "../../components/Global/Header";
import TutorProfileInfo from "../../components/Tutor/TutorProfileInfo";
import { useColor } from "react-color-palette";
import TutorContactInfo from "../../components/Tutor/TutorContactInfo";
import TutorPersonalInfo from "../../components/Tutor/TutorPersonalInfo";
import TutorEmergencyInfo from "../../components/Tutor/TutorEmergencyInfo";
import TutorBankInfo from "../../components/Tutor/TutorBankInfo";
import TutorWWVPInfo from "../../components/Tutor/TutorWWVPInfo";
import TutorFirstAidInfo from "../../components/Tutor/TutorFirstAidInfo";
import TutorPoliceCheckInfo from "../../components/Tutor/TutorPoliceCheckInfo";
import AvailabilitySelector from "../../components/Tutor/AvailabilitySelector";
import UnavailabilitySelector from "../../components/Tutor/UnavailabilitySelector";

const TutorProfile = () => {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tutorColor, setTutorColor] = useColor("hex", "#000000");
  const [profilePic, setProfilePic] = useState(null);
  const [availability, setAvailability] = useState({});
  const [unavailability, setUnavailability] = useState({});

  useEffect(() => {
    // Get logged-in user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(storedUser);

    // Fetch tutor details from Firestore
    const fetchTutor = async () => {
      const tutorRef = doc(db, "tutors", tutorId);
      const tutorSnap = await getDoc(tutorRef);

      if (tutorSnap.exists()) {
        const fetchedData = tutorSnap.data();
        setTutor(fetchedData);
        setTutorColor({ hex: fetchedData.tutorColor });
        setProfilePic(fetchedData.avatar);
        setAvailability(fetchedData.availability);
        setUnavailability(fetchedData.unavailability);
        console.log(fetchedData.unavailability);
      }
    };

    fetchTutor();
  }, [tutorId]);

  if (!tutor) return <Typography>Loading...</Typography>;

  const isSelf = currentUser?.uid === tutorId;
  const isAdmin = currentUser?.role === "admin";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header
          title={`${tutor.firstName} ${tutor.lastName}`}
          subtitle={tutor.role}
        />
      </Box>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <TutorProfileInfo
          formData={{
            firstName: tutor?.firstName || "",
            middleName: tutor?.middleName || "",
            lastName: tutor?.lastName || "",
            dateOfBirth: tutor?.dateOfBirth || null,
            wiseMindsEmail: tutor?.wiseMindsEmail || "",
          }}
          color={tutorColor}
          profilePicFile={profilePic}
        />
      </Paper>
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={4}>
          <TutorContactInfo
            formData={{
              personalEmail: tutor?.personalEmail || "",
              phone: tutor?.phone || "",
              address: tutor?.address || "",
            }}
          />
          <TutorPersonalInfo
            formData={{
              career: tutor?.career || "",
              degree: tutor?.degree || "",
              position: tutor?.position || "",
              homeLocation: tutor?.homeLocation || "",
              role: tutor?.role || "",
              hours: tutor?.hours || [0, 0],
            }}
          />
          <TutorEmergencyInfo
            formData={{
              emergencyName: tutor?.emergencyName || "",
              emergencyRelationship: tutor?.emergencyRelationship || "",
              emergencyPhone: tutor?.emergencyPhone || "",
              emergencyEmail: tutor?.emergencyEmail || "",
            }}
          />
          <TutorBankInfo
            formData={{
              bankName: tutor?.bankName || "",
              accountName: tutor?.accountName || "",
              bsb: tutor?.bsb || "",
              accountNumber: tutor?.accountNumber || "",
              tfn: tutor?.tfn || "",
              superCompany: tutor?.superCompany || "",
            }}
          />
          <TutorWWVPInfo
            formData={{
              wwvpName: tutor?.wwvpName || "",
              wwvpRegNumber: tutor?.wwvpRegNumber || "",
              wwvpCardNumber: tutor?.wwvpCardNumber || "",
              wwvpExpiry: tutor?.wwvpExpiry || "",
            }}
            wwvpFile={tutor?.wwvpFilePath || null}
          />
          <TutorFirstAidInfo
            formData={{
              faCourseDate: tutor?.faCourseDate || "",
              faProvider: tutor?.faProvider || "",
              faNumber: tutor?.faNumber || "",
              faCourseType: tutor?.faCourseType || "",
              faCourseCode: tutor?.faCourseCode || "",
              faExpiry: tutor?.faExpiry || "",
            }}
            firstAidFile={tutor?.firstAidFilePath || null}
          />
          <TutorPoliceCheckInfo
            formData={{
              pcName: tutor?.pcName || "",
              pcIsNational: tutor?.pcIsNational || "",
              pcAddress: tutor?.pcAddress || "",
              pcResult: tutor?.pcResult || "",
              pcAPPRef: tutor?.pcAPPRef || "",
            }}
            policeCheckFile={tutor?.policeCheckFilePath || null}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4}}>
        <Stack spacing={2}>
          <Typography variant="h4">Availability</Typography>
          <AvailabilitySelector onAvailabilityChange={() => {}} initialAvailability={availability} isEdit={false} />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Unavailability</Typography>
          <UnavailabilitySelector isEdit={false} unavailability={unavailability} />
        </Stack>
      </Paper>
    </LocalizationProvider>
  );
};

export default TutorProfile;
