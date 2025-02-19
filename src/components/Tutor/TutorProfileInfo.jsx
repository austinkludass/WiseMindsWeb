import { React, useState } from "react";
import { Avatar, Stack, Box, IconButton, TextField } from "@mui/material";
import Grid from "@mui/material/Grid2";
import EditIcon from "@mui/icons-material/Edit";
import { Saturation, Hue } from "react-color-palette";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import "react-color-palette/css";

const TutorProfileInfo = ({
  formData,
  setFormData,
  color,
  setColor,
  profilePicFile,
  setProfilePicFile,
  touched,
  setTouched,
}) => {
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
              src={profilePicUrl}
              sx={{
                width: 140,
                height: 140,
                bgcolor: color.hex,
                position: "absolute",
                border: `4px solid ${color.hex}`,
              }}
            />
            {hover && (
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
          <Stack spacing={1}>
            <Saturation height={70} color={color} onChange={setColor} />
            <Hue color={color} onChange={setColor} />
          </Stack>
        </Stack>
      </Grid>
      <Grid item size={8}>
        <Stack spacing={2}>
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
        </Stack>
      </Grid>
    </Grid>
  );
};

export default TutorProfileInfo;
