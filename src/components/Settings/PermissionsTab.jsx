import { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Select,
  MenuItem,
  CircularProgress,
  Divider,
} from "@mui/material";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../../data/firebase";

const roleOptions = ["Admin", "Head Tutor", "Tutor", "Minion"];

const PermissionsTab = () => {
  const [tutors, setTutors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTutors = async () => {
      const snap = await getDocs(collection(db, "tutors"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setTutors(list);
      setLoading(false);
    };
    fetchTutors();
  }, []);

  const handleRoleChange = async (id, newRole) => {
    await updateDoc(doc(db, "tutors", id), { role: newRole });
    setTutors((prev) =>
      prev.map((t) => (t.id === id ? { ...t, role: newRole } : t))
    );
  };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: "12px" }}>
      <Typography variant="h5" fontWeight="600" mb={1}>
        Tutor Permissions
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Manage roles and permissions for all tutors in your organisation.
      </Typography>

      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          md: "1fr 1fr 150px",
        }}
        px={1}
        py={1}
        sx={{ opacity: "0.6" }}
      >
        <Typography fontWeight={600}>User</Typography>
        <Typography fontWeight={600}>Email</Typography>
        <Typography fontWeight={600}>Role</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />

      {tutors.map((tutor) => (
        <Box
          key={tutor.id}
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            md: "1fr 1fr 150px",
          }}
          alignItems="center"
          rowGap={1}
          px={1}
          py={1.5}
          sx={{
            borderRadius: "8px",
            "&:hover": { backgroundColor: "action.hover" },
          }}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar
              sx={{ width: 40, height: 40, bgcolor: tutor.tutorColor }}
              src={tutor.avatar ?? ""}
            />
            <Typography fontWeight={500}>
              {tutor.firstName} {tutor.lastName}
            </Typography>
          </Box>

          <Typography color="text.secondary">{tutor.wiseMindsEmail}</Typography>

          <Select
            size="small"
            fullWidth
            disabled
            value={tutor.role || ""}
            onChange={(e) => handleRoleChange(tutor.id, e.target.value)}
            sx={{ borderRadius: "8px" }}
          >
            {roleOptions.map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </Box>
      ))}
    </Paper>
  );
};

export default PermissionsTab;
