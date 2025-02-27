import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../../data/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Button, Typography, Box, Avatar } from "@mui/material";

const TutorProfile = () => {
  const { tutorId } = useParams(); // Get tutorId from the URL
  const [tutor, setTutor] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get logged-in user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setCurrentUser(storedUser);

    // Fetch tutor details from Firestore
    const fetchTutor = async () => {
      const tutorRef = doc(db, "tutors", tutorId);
      const tutorSnap = await getDoc(tutorRef);

      if (tutorSnap.exists()) {
        setTutor(tutorSnap.data());
      }
    };

    fetchTutor();
  }, [tutorId]);

  if (!tutor) return <Typography>Loading...</Typography>;

  const isSelf = currentUser?.uid === tutorId;
  const isAdmin = currentUser?.role === "admin";

  return (
    <Box p={4}>
      <Avatar src={tutor.avatar} sx={{ width: 100, height: 100 }} />
      <Typography variant="h4">
        {tutor.firstName} {tutor.lastName}
      </Typography>
      <Typography variant="body1">Email: {tutor.wiseMindsEmail}</Typography>
      <Typography variant="body1">Role: {tutor.role}</Typography>

      {(isSelf || isAdmin) && (
        <Button variant="contained" color="primary" sx={{ mt: 2 }}>
          Edit Profile
        </Button>
      )}
    </Box>
  );
};

export default TutorProfile;
