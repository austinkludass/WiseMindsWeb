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
  const [color, setColor] = useColor("#6e6e6e");
  const [showPassword, setShowPassword] = useState(false);
  const [hover, setHover] = useState(false);
  const [image, setImage] = useState("");
  const [profilePicFile, setProfilePicFile] = useState(null);
  const [specificUnavailability, setSpecificUnavailability] = useState([]);
  const [minMaxValue, setMinMaxValue] = useState([0, 20]);

  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: null,
    wiseMindsEmail: "",
    password: "",
    secondPassword: "",
    personalEmail: "",
    phone: "",
    address: "",
    career: "",
    degree: "",
    position: "",
    homeLocation: "",
    role: "tutor",
    hours: minMaxValue,
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
    emergencyEmail: "",
    bankName: "",
    accountName: "",
    bsb: "",
    accountNumber: "",
    tfn: "",
    superCompany: "",
    wwvpName: "",
    wwvpRegNumber: "",
    wwvpCardNumber: "",
    wwvpExpiry: null,
    faCourseDate: null,
    faProvider: "",
    faNumber: "",
    faCourseType: "",
    faCourseCode: "",
    faExpiry: null,
    pcName: "",
    pcIsNational: false,
    pcAddress: "",
    pcResult: "",
    pcAPPRef: "",
  });

  const [touched, setTouched] = useState({
    firstName: false,
    wiseMindsEmail: false,
    password: false,
    secondPassword: false,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDateChange = (name) => (date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSwitchChange = (e) => {
    setFormData({ ...formData, pcIsNational: e.target.checked });
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({ ...touched, [name]: true });
  };

  const isInvalid = (field) => touched[field] && !formData[field].trim();

  const isFormValid = () => {
    return formData.firstName && formData.wiseMindsEmail && formData.password;
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
      setTouched({
        firstName: true,
        wiseMindsEmail: true,
        password: true,
        secondPassword: true,
      });
      toast.error("Complete all required fields");
      return;
    }

    if (formData.password !== formData.secondPassword) {
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
        avatar: avatarUrl,
        tutorColor: color.hex,
        firstName: formData.firstName,
        middleName: formData.middleName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth?.toISOString() || null,
        wiseMindsEmail: formData.wiseMindsEmail,
        personalEmail: formData.personalEmail,
        phone: formData.phone,
        address: formData.address,
        career: formData.career,
        degree: formData.degree,
        position: formData.position,
        homeLocation: formData.homeLocation,
        role: formData.role,
        hours: formData.hours,
        emergencyName: formData.emergencyName,
        emergencyRelationship: formData.emergencyRelationship,
        emergencyPhone: formData.emergencyPhone,
        emergencyEmail: formData.emergencyEmail,
        bankName: formData.bankName,
        accountName: formData.accountName,
        bsb: formData.bsb,
        accountNumber: formData.accountNumber,
        tfn: formData.tfn,
        superCompany: formData.superCompany,
        wwvpName: formData.wwvpName,
        wwvpRegNumber: formData.wwvpRegNumber,
        wwvpCardNumber: formData.wwvpCardNumber,
        wwvpExpiry: formData.wwvpExpiry?.toISOString() || null,
        // wwvp File Path
        faCourseDate: formData.faCourseDate?.toISOString() || null,
        faProvider: formData.faProvider,
        faNumber: formData.faNumber,
        faCourseType: formData.faCourseType,
        faCourseCode: formData.faCourseCode,
        faExpiry: formData.faExpiry?.toISOString() || null,
        // fa File Path
        pcName: formData.pcName,
        pcIsNational: formData.pcIsNational,
        pcAddress: formData.pcAddress,
        pcResult: formData.pcResult,
        pcAPPRef: formData.pcAPPRef,
        // pc File Path
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
      </Paper>

      {/* Login Information */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Login Information</Typography>
          <TextField
            name="wiseMindsEmail"
            value={formData.wiseMindsEmail}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            type="email"
            label="Wise Minds Email"
            error={isInvalid("wiseMindsEmail")}
          />
          <TextField
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={isInvalid("password")}
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
                      tabIndex={-1}
                    >
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <TextField
            name="secondPassword"
            value={formData.secondPassword}
            onChange={handleChange}
            label="Re-enter Password"
            autoComplete="new-password"
            onBlur={handleBlur}
            error={isInvalid("secondPassword")}
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
                      tabIndex={-1}
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
                <TextField
                  name="personalEmail"
                  label="Personal Email"
                  value={formData.personalEmail}
                  onChange={handleChange}
                />
                <TextField
                  name="phone"
                  label="Phone Number"
                  value={formData.phone}
                  onChange={handleChange}
                />
                <TextField
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
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
                <TextField
                  name="career"
                  label="Career"
                  value={formData.career}
                  onChange={handleChange}
                />
                <TextField
                  name="degree"
                  label="Degree"
                  value={formData.degree}
                  onChange={handleChange}
                />
                <TextField
                  name="position"
                  label="Position"
                  value={formData.position}
                  onChange={handleChange}
                />
                <FormControl disabled fullWidth>
                  <InputLabel id="location-select-label">
                    Home Location
                  </InputLabel>
                  <Select
                    name="homeLocation"
                    label="Home Location"
                    labelId="location-select-label"
                    value={formData.homeLocation}
                    onChange={handleChange}
                  ></Select>
                </FormControl>
                <FormControl disabled fullWidth>
                  <InputLabel id="role-select-label">Role</InputLabel>
                  <Select
                    name="role"
                    label="Role"
                    labelId="role-select-label"
                    value={formData.role}
                    onChange={handleChange}
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
                <TextField
                  name="emergencyName"
                  label="Full Name"
                  value={formData.emergencyName}
                  onChange={handleChange}
                />
                <FormControl fullWidth>
                  <InputLabel id="relationship-select-label">
                    Relationship
                  </InputLabel>
                  <Select
                    name="emergencyRelationship"
                    label="Relationship"
                    labelId="relationship-select-label"
                    value={formData.emergencyRelationship}
                    onChange={handleChange}
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
                <TextField
                  name="emergencyPhone"
                  label="Phone Number"
                  value={formData.emergencyPhone}
                  onChange={handleChange}
                />
                <TextField
                  name="emergencyEmail"
                  label="Email"
                  value={formData.emergencyEmail}
                  onChange={handleChange}
                />
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
                <TextField
                  name="bankName"
                  label="Bank Name"
                  value={formData.bankName}
                  onChange={handleChange}
                />
                <TextField
                  name="accountName"
                  label="Account Name"
                  value={formData.accountName}
                  onChange={handleChange}
                />
                <TextField
                  name="bsb"
                  label="BSB"
                  value={formData.bsb}
                  onChange={handleChange}
                />
                <TextField
                  name="accountNumber"
                  label="Account Number"
                  value={formData.accountNumber}
                  onChange={handleChange}
                />
                <TextField
                  name="tfn"
                  label="Tax File Number"
                  value={formData.tfn}
                  onChange={handleChange}
                />
                <TextField
                  name="superCompany"
                  label="Super Company"
                  value={formData.superCompany}
                  onChange={handleChange}
                />
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
                <TextField
                  name="wwvpName"
                  label="Name"
                  value={formData.wwvpName}
                  onChange={handleChange}
                />
                <TextField
                  name="wwvpRegNumber"
                  label="Registration Number"
                  value={formData.wwvpRegNumber}
                  onChange={handleChange}
                />
                <TextField
                  name="wwvpCardNumber"
                  label="Card Number"
                  value={formData.wwvpCardNumber}
                  onChange={handleChange}
                />
                <DatePicker
                  label="Expiry"
                  onChange={handleDateChange("wwvpExpiry")}
                  value={formData.wwvpExpiry}
                />
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
                <DatePicker
                  label="Course Date"
                  onChange={handleDateChange("faCourseDate")}
                  value={formData.faCourseDate}
                />
                <TextField
                  name="faProvider"
                  label="Provider"
                  value={formData.faProvider}
                  onChange={handleChange}
                />
                <TextField
                  name="faNumber"
                  label="Number"
                  value={formData.faNumber}
                  onChange={handleChange}
                />
                <TextField
                  name="faCourseType"
                  label="Course Type"
                  value={formData.faCourseType}
                  onChange={handleChange}
                />
                <TextField
                  name="faCourseCode"
                  label="Course Code"
                  value={formData.faCourseCode}
                  onChange={handleChange}
                />
                <DatePicker
                  label="Expiry"
                  onChange={handleDateChange("faExpiry")}
                  value={formData.faExpiry}
                />
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
                <TextField
                  name="pcName"
                  label="Name"
                  value={formData.pcName}
                  onChange={handleChange}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.pcIsNational}
                      onChange={handleSwitchChange}
                    />
                  }
                  label="National Police Check"
                />
                <TextField
                  name="pcAddress"
                  label="Address"
                  value={formData.pcAddress}
                  onChange={handleChange}
                />
                <TextField
                  name="pcResult"
                  label="Result"
                  value={formData.pcResult}
                  onChange={handleChange}
                />
                <TextField
                  name="pcAPPRef"
                  label="APP Reference"
                  value={formData.pcAPPRef}
                  onChange={handleChange}
                />
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
