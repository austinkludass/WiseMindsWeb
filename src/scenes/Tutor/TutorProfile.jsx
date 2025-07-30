import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../data/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { Typography, Box, Button, CircularProgress } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { ToastContainer, toast } from "react-toastify";
import { ColorService, useColor } from "react-color-palette";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import dayjs from "dayjs";
import Header from "../../components/Global/Header";
import Section from "../../components/Global/Section";
import TutorProfileInfo from "../../components/Tutor/TutorProfileInfo";
import TutorContactInfo from "../../components/Tutor/TutorContactInfo";
import TutorPersonalInfo from "../../components/Tutor/TutorPersonalInfo";
import TutorEmergencyInfo from "../../components/Tutor/TutorEmergencyInfo";
import TutorBankInfo from "../../components/Tutor/TutorBankInfo";
import TutorWWVPInfo from "../../components/Tutor/TutorWWVPInfo";
import TutorFirstAidInfo from "../../components/Tutor/TutorFirstAidInfo";
import TutorPoliceCheckInfo from "../../components/Tutor/TutorPoliceCheckInfo";
import AvailabilitySelector from "../../components/Tutor/AvailabilitySelector";
import UnavailabilitySelector from "../../components/Tutor/UnavailabilitySelector";
import TutorCapabilities from "../../components/Tutor/TutorCapabilities";
import TutorBlockedStudents from "../../components/Tutor/TutorBlockedStudents";
import "dayjs/locale/en-gb";

const TutorProfile = () => {
  const { tutorId } = useParams();
  const [tutor, setTutor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [forms, setForms] = useState({});
  const [editState, setEditState] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [tutorColor, setTutorColor] = useColor("hex", "#6E6E6E");
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [availability, setAvailability] = useState({});
  const [unavailability, setUnavailability] = useState({});
  const [capabilityIds, setCapabilityIds] = useState([]);
  const [blockedStudentIds, setBlockedStudentIds] = useState([]);
  const dateFields = ["dateOfBirth", "wwvpExpiry"];
  const [isSaving, setIsSaving] = useState(false);

  const setForm = (key, value) =>
    setForms((prev) => ({ ...prev, [key]: value }));
  const toggleEdit = (key, state) =>
    setEditState((prev) => ({ ...prev, [key]: state }));

  const formConfigs = {
    profile: {
      title: "",
      component: TutorProfileInfo,
      fields: [
        "firstName",
        "middleName",
        "lastName",
        "dateOfBirth",
        "wiseMindsEmail",
      ],
      extraProps: {
        tutorColor,
        setTutorColor,
        profilePic,
        setProfilePic,
        profilePicPreview,
        setProfilePicPreview,
      },
    },
    contact: {
      title: "",
      component: TutorContactInfo,
      fields: ["personalEmail", "phone", "address"],
    },
    personal: {
      title: "",
      component: TutorPersonalInfo,
      fields: ["career", "degree", "position", "homeLocation", "role", "hours"],
    },
    emergency: {
      title: "",
      component: TutorEmergencyInfo,
      fields: [
        "emergencyName",
        "emergencyRelationship",
        "emergencyPhone",
        "emergencyEmail",
      ],
    },
    bank: {
      title: "",
      component: TutorBankInfo,
      fields: [
        "bankName",
        "accountName",
        "bsb",
        "accountNumber",
        "tfn",
        "superCompany",
      ],
    },
    wwvp: {
      title: "",
      component: TutorWWVPInfo,
      fields: [
        "wwvpName",
        "wwvpRegNumber",
        "wwvpCardNumber",
        "wwvpExpiry",
        "wwvpFilePath",
      ],
    },
    firstaid: {
      title: "",
      component: TutorFirstAidInfo,
      fields: [
        "faCourseDate",
        "faProvider",
        "faNumber",
        "faCourseType",
        "faCourseCode",
        "faExpiry",
        "firstAidFilePath",
      ],
    },
    policecheck: {
      title: "",
      component: TutorPoliceCheckInfo,
      fields: [
        "pcName",
        "pcIsNational",
        "pcAddress",
        "pcResult",
        "pcAPPRef",
        "policeCheckFilePath",
      ],
    },
    availability: {
      title: "Availability",
      component: AvailabilitySelector,
      fields: [],
      extraProps: { availability, setAvailability },
    },
    unavailability: {
      title: "Unavailability",
      component: UnavailabilitySelector,
      fields: [],
      extraProps: { unavailability, setUnavailability },
    },
    capabilities: {
      title: "Capabilities",
      component: TutorCapabilities,
      fields: [],
      extraProps: { capabilityIds, setCapabilityIds },
    },
    blockedstudents: {
      title: "Blocked Students",
      component: TutorBlockedStudents,
      fields: [],
      extraProps: { blockedStudentIds, setBlockedStudentIds },
    },
  };

  useEffect(() => {
    // Get logged-in user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(storedUser);

    // Fetch tutor details from Firestore
    const fetchTutor = async () => {
      if (!tutorId) return;
      const tutorRef = doc(db, "tutors", tutorId);
      const tutorSnap = await getDoc(tutorRef);
      if (!tutorSnap.exists()) return;

      const data = tutorSnap.data();
      setTutor(data);
      setTutorColor(ColorService.convert("hex", data.tutorColor));
      setProfilePic(data.avatar);
      setAvailability(data.availability);
      setUnavailability(data.unavailability);
      setCapabilityIds(data.capabilities);
      setBlockedStudentIds(data.blockedStudents);

      const initialForms = {};
      for (const key in formConfigs) {
        initialForms[key] = {};
        formConfigs[key].fields.forEach((f) => {
          const value = data[f];
          initialForms[key][f] =
            f.toLowerCase().includes("date") && value
              ? dayjs(value)
              : value ?? "";
        });
      }
      setForms(initialForms);
    };

    fetchTutor();
  }, [tutorId]);

  const handleSave = async (key) => {
    setIsSaving(true);

    const tutorRef = doc(db, "tutors", tutorId);
    const payload = { ...forms[key] };

    if (payload.dateOfBirth)
      payload.dateOfBirth = payload.dateOfBirth.toISOString();
    if (payload.wwvpExpiry)
      payload.wwvpExpiry = payload.wwvpExpiry.toISOString();

    if (key === "profile") {
      payload.tutorColor = tutorColor.hex;

      if (profilePic instanceof File) {
        const storage = getStorage();
        const storageRef = ref(storage, `profilePictures/${tutorId}`);
        await uploadBytes(storageRef, profilePic);
        const downloadURL = await getDownloadURL(storageRef);
        payload.avatar = downloadURL;
        setProfilePic(downloadURL);
      } else {
        payload.avatar = profilePic;
      }
    } else if (key === "availability") {
      payload.availability = availability;
    } else if (key === "unavailability") {
      payload.unavailability = unavailability;
    } else if (key === "capabilities") {
      payload.capabilities = capabilityIds;
    } else if (key === "blockedstudents") {
      payload.blockedStudents = blockedStudentIds;
    }

    try {
      await updateDoc(tutorRef, payload);
      toast.success("Successfully updated tutor");
    } catch (error) {
      toast.error("Error updating tutor: " + error.message);
    }
    setTutor((prev) => ({ ...prev, ...payload }));
    toggleEdit(key, false);
    setIsSaving(false);
  };

  const handleCancel = (key) => {
    const resetData = {};
    formConfigs[key].fields.forEach((f) => {
      const value = tutor[f];
      resetData[f] =
        dateFields.includes(f) && value ? dayjs(value) : value ?? "";
    });
    setForm(key, resetData);
    toggleEdit(key, false);

    if (key === "profile") {
      if (tutor?.tutorColor) {
        const originalColor = ColorService.convert("hex", tutor.tutorColor);
        setTutorColor(originalColor);
      }
      if (tutor?.avatar) {
        setProfilePic(tutor.avatar);
        setProfilePicPreview(null);
      }
    }
  };

  if (!tutor) return <Typography>Loading...</Typography>;

  // const isSelf = currentUser?.uid === tutorId;
  // const isAdmin = currentUser?.role === "admin";

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header
          title={`${tutor.firstName} ${tutor.lastName}`}
          subtitle={tutor.role[0].toUpperCase() + tutor.role.slice(1)}
        />
      </Box>

      {Object.entries(formConfigs).map(([key, config]) => {
        const Component = config.component;
        const isEdit = editState[key];

        return (
          <Section
            key={key}
            title={config.title}
            actions={
              isEdit ? (
                <Box display="flex" gap={1}>
                  <Button
                    variant="contained"
                    onClick={() => handleSave(key)}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <CircularProgress size={20} sx={{ color: "white" }} />
                    ) : (
                      "Save"
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleCancel(key)}
                  >
                    Cancel
                  </Button>
                </Box>
              ) : (
                <Button
                  variant="outlined"
                  onClick={() => toggleEdit(key, true)}
                >
                  Edit
                </Button>
              )
            }
          >
            <Component
              formData={forms[key]}
              setFormData={(v) => setForm(key, v)}
              isEdit={!!isEdit}
              touched={touchedFields}
              setTouched={setTouchedFields}
              {...(config.extraProps || {})}
            />
          </Section>
        );
      })}
      <ToastContainer position="top-right" autoClose={3000} />
    </LocalizationProvider>
  );
};

export default TutorProfile;
