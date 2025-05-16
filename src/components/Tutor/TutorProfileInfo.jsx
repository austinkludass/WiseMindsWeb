import { React, useState } from "react";
import {
  Avatar,
  Stack,
  Box,
  IconButton,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditIcon from "@mui/icons-material/Edit";
import { Saturation, Hue } from "react-color-palette";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "react-color-palette/css";
import { tokens } from "../../theme";

const TutorProfileInfo = ({
  formData,
  setFormData,
  color,
  setColor,
  profilePicFile,
  setProfilePicFile,
  touched,
  setTouched,
  isEdit,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [profilePicUrl, setProfilePicUrl] = useState(null);
  const [hover, setHover] = useState(false);

  const isInvalid = (field) => touched[field] && !formData[field].trim();

  const handleAvatarClick = () => {
    document.getElementById("profilePicInput").click();
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePicFile(file);
      setProfilePicUrl(imageUrl);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const handleDateChange = (name) => (date) => {
    setFormData({ ...formData, [name]: date });
  };

  return (
    <Grid container spacing={2} alignItems="center">
      <Grid item size={4} sx={{ display: "flex", justifyContent: "center" }}>
        <Stack spacing={2}>
          <Box
            style={{
              position: "relative",
              width: "140px",
              height: "140px",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
          >
            <Avatar
              src={isEdit ? profilePicUrl : profilePicFile}
              sx={{
                width: 140,
                height: 140,
                bgcolor: color.hex,
                position: "absolute",
                border: `4px solid ${color.hex}`,
              }}
            />
            {hover && isEdit && (
              <IconButton
                onClick={handleAvatarClick}
                sx={[
                  {
                    width: 140,
                    height: 140,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  },
                  {
                    "&:hover": {
                      backgroundColor: "rgba(0, 0, 0, 0.5)",
                    },
                  },
                ]}
              >
                <EditIcon sx={{ width: 40, height: 40 }} />
              </IconButton>
            )}
            <input
              type="file"
              id="profilePicInput"
              hidden
              accept="image/*"
              onChange={handleProfilePicChange}
            />
          </Box>
          {isEdit && (
            <Stack spacing={1}>
              <Saturation height={70} color={color} onChange={setColor} />
              <Hue color={color} onChange={setColor} />
            </Stack>
          )}
        </Stack>
      </Grid>
      <Grid item size={8}>
        <Stack spacing={2}>
          {isEdit ? (
            <>
              <TextField
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                label="First Name"
                error={isInvalid("firstName")}
              />
              <TextField
                name="middleName"
                value={formData.middleName}
                onChange={handleChange}
                label="Middle Name"
              />
              <TextField
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                label="Last Name"
              />
              <DatePicker
                value={formData.dateOfBirth}
                onChange={handleDateChange("dateOfBirth")}
                label="Date of Birth"
              />
            </>
          ) : (
            <>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  First Name
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.firstName}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Middle Name
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.middleName}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Last Name
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.lastName}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Date of Birth
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.dateOfBirth
                    ? dayjs(formData.dateOfBirth).format("MMMM D, YYYY")
                    : "N/A"}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Wise Minds Email
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.wiseMindsEmail}
                </Typography>
              </div>
            </>
          )}
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TutorProfileInfo;
