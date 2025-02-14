import { React, useState } from "react";
import {
  Avatar,
  Paper,
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  FormControlLabel,
  Switch,
  Box,
  Slider,
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Saturation, Hue, useColor } from "react-color-palette";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, sb } from "../../data/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EditIcon from "@mui/icons-material/Edit";
import "react-toastify/dist/ReactToastify.css";
import "react-color-palette/css";
import "dayjs/locale/en-gb";
import Header from "../../components/Header";
import AvailabilitySelector from "../../components/AvailabilitySelector";
import UnavailabilitySelector from "../../components/UnavailabilitySelector";

const NewTutor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [secondPassword, setSecondPassword] = useState("");
  const [color, setColor] = useColor("#6e6e6e");
  const [showPassword, setShowPassword] = useState(false);
  const [hover, setHover] = useState(false);
  const [image, setImage] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [specificUnavailability, setSpecificUnavailability] = useState([]);
  
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: null,
    lastName: "",
    dateOfBirth: null,
    wiseMindsEmail: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (date) => {
    setFormData({ ...formData, dateOfBirth: date });
  };

  const isFormValid = () => {
    return (
      formData.firstName &&
      formData.lastName &&
      formData.dateOfBirth &&
      formData.wiseMindsEmail &&
      formData.password
    );
  };

  const uploadImage = async (userId) => {
    if (!profilePicFile) return null;

    const storageRef = ref(sb, `profilePictures/${userId}`);
    await uploadBytes(storageRef, profilePicFile);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid()) {
      toast.error("Complete all required fields");
      return;
    }

    if (formData.password !== secondPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.wiseMindsEmail,
        formData.password
      );
      const user = userCredential.user;

      let avatarUrl = "";
      if (profilePicFile) {
        avatarUrl = await uploadImage(user.uid);
      }

      await setDoc(doc(db, "tutors", user.uid), {
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth.toISOString(),
        wiseMindsEmail: formData.wiseMindsEmail,
        avatar: avatarUrl,
      });

      toast.success("Successfully added tutor!");
      navigate("/tutors");
    } catch (error) {
      toast.error("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  const handleAvatarClick = () => {
    document.getElementById("profilePicInput").click();
  };

  const handleProfilePicChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePicFile(file);
      const imageUrl = URL.createObjectURL(file);
      setImage(imageUrl);
    }
  };

  const [minMaxValue, setMinMaxValue] = useState([0, 20]);
  const handleMinMaxChange = (event, newValue, activeThumb) => {
    if (!Array.isArray(newValue)) {
      return;
    }

    if (activeThumb === 0) {
      setMinMaxValue([
        Math.min(newValue[0], minMaxValue[1] - 3),
        minMaxValue[1],
      ]);
    } else {
      setMinMaxValue([
        minMaxValue[0],
        Math.max(newValue[1], minMaxValue[0] + 3),
      ]);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header title="NEW TUTOR" subtitle="Enter details for a new tutor" />
      </Box>
      {/* Profile Information */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid
            item
            size={4}
            sx={{ display: "flex", justifyContent: "center" }}
          >
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
                  src={image}
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
                required
                label="First Name"
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
                required
                label="Last Name"
              />
              <DatePicker
                value={formData.dateOfBirth}
                onChange={handleDateChange}
                label="Date of Birth *"
              />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Login Information */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Login Information</Typography>
          <TextField
            name="wiseMindsEmail"
            value={formData.wiseMindsEmail}
            onChange={handleChange}
            required
            type="email"
            label="Wise Minds Email"
          />
          <TextField
            name="password"
            value={formData.password}
            onChange={handleChange}
            label="Password"
            autoComplete="new-password"
            required
            type={showPassword ? "text" : "password"}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            value={secondPassword}
            onChange={(e) => setSecondPassword(e.target.value)}
            label="Re-enter Password"
            autoComplete="new-password"
            required
            type={showPassword ? "text" : "password"}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      onMouseUp={handleMouseUpPassword}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={4}>
          {/* Contact Information */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">Contact Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField label="Personal Email" />
                <TextField label="Phone Number" />
                <TextField label="Address" />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Personal Information */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">Personal Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField label="Career" />
                <TextField label="Degree" />
                <TextField label="Position" />
                <TextField label="Assigned Location" />
                <FormControl disabled fullWidth>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    defaultValue={"tutor"}
                    label="Role"
                    labelId="role-select-label"
                  >
                    <MenuItem value={"tutor"}>Tutor</MenuItem>
                  </Select>
                </FormControl>
                <Box sx={{ paddingLeft: 2, paddingRight: 2 }}>
                  <Typography gutterBottom>Hours</Typography>
                  <Slider
                    valueLabelDisplay="auto"
                    onChange={handleMinMaxChange}
                    value={minMaxValue}
                    disableSwap
                    max={60}
                    min={0}
                  />
                </Box>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Emergency Contact */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">Emergency Contact</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField label="Full Name" />
                <FormControl fullWidth>
                  <InputLabel id="relationship-select-label">
                    Relationship
                  </InputLabel>
                  <Select
                    label="Relationship"
                    labelId="relationship-select-label"
                  >
                    <MenuItem value={"daughter"}>Daughter</MenuItem>
                    <MenuItem value={"father"}>Father</MenuItem>
                    <MenuItem value={"friend"}>Friend</MenuItem>
                    <MenuItem value={"husband"}>Husband</MenuItem>
                    <MenuItem value={"mother"}>Mother</MenuItem>
                    <MenuItem value={"partner"}>Partner</MenuItem>
                    <MenuItem value={"son"}>Son</MenuItem>
                    <MenuItem value={"wife"}>Wife</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Phone Number" />
                <TextField label="Email" />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Bank Details */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">Banking and Tax</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField label="Bank Name" />
                <TextField label="Account Name" />
                <TextField label="BSB" />
                <TextField label="Account Number" />
                <TextField label="Tax File Number" />
                <TextField label="Super Company" />
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Working With Vulnerable People */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">
                Working With Vulnerable People
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField label="Name" />
                <TextField label="Registration Number" />
                <TextField label="Card Number" />
                <DatePicker label="Expiry" />
                <Button variant="contained" component="label">
                  UPLOAD WORKING WITH VULNERABLE PEOPLE DOCUMENT
                  <input hidden accept="*.pdf" type="file" />
                </Button>
                <Button disabled variant="outlined">
                  VIEW
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* First Aid */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">First Aid</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <DatePicker label="Course Date" />
                <TextField label="Provider" />
                <TextField label="Number" />
                <TextField label="Course Type" />
                <TextField label="Course Code" />
                <DatePicker label="Expiry" />
                <Button variant="contained" component="label">
                  UPLOAD FIRST AID DOCUMENT
                  <input hidden accept="*.pdf" type="file" />
                </Button>
                <Button disabled variant="outlined">
                  VIEW
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Police Check */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">Police Check</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField label="Name" />
                <FormControlLabel
                  control={<Switch />}
                  label="National Police Check"
                />
                <TextField label="Address" />
                <TextField label="Result" />
                <TextField label="APP Reference" />
                <Button variant="contained" component="label">
                  UPLOAD POLICE CHECK DOCUMENT
                  <input hidden accept="*.pdf" type="file" />
                </Button>
                <Button disabled variant="outlined">
                  VIEW
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Availability</Typography>
          <AvailabilitySelector userId="123" />
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
      <ToastContainer position="top-right" autoClose={3000} />
    </LocalizationProvider>
  );
};

export default NewTutor;
