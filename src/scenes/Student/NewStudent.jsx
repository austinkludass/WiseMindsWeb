import { useCallback, useState } from "react";
import { Paper, Typography, Stack, Button, Box, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { tokens } from "../../theme";
import Header from "../../components/Global/Header";
import StudentGeneralInfo from "../../components/student/StudentGeneralInfo";
import "dayjs/locale/en-gb";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import StudentFamilyInfo from "../../components/student/StudentFamilyInfo";
import StudentEmergencyInfo from "../../components/student/StudentEmergencyInfo";

const NewStudent = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [formData, setFormData] = useState({
    // General Student Information
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: null,
    anaphylacticAllergies: "",
    carriesEpiPen: "",
    canAdministerEpiPen: "",
    nonAnaphylacticAllergies: "",

    // Family Contact Details
    familyPhone: "",
    familyEmail: "",
    familyAddress: "",

    // Emergency Contact
    emergencyFirstName: "",
    emergencyLastName: "",
    emergencyRelationship: "",
    emergencyPhone: "",

    // Academic Information
    school: "",
    yearLevel: "",
    hoursPerWeek: "",

    // Trial Session
    trialAvailability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
    preferredStartDate: null,

    // Regular Availability
    sameAsTrialAvailability: false,
    regularAvailability: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },

    // Additional Information
    acceptsSnacks: "",
    restrictedFoods: "",
    questionsOrConcerns: "",
    referralSource: "",
  });

  const [subjects, setSubjects] = useState([]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "sameAsTrialAvailability") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleDateChange = (name) => (date) => {
    setFormData((prev) => ({
      ...prev,
      [name]: date,
    }));
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", selected: false, hours: "" }]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const addTimeSlot = (type, day) => {
    const newSlot = {
      start: new Date(new Date().setHours(9, 0, 0, 0)),
      end: new Date(new Date().setHours(17, 0, 0, 0)),
    };
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [day]: [...(prev[type][day] || []), newSlot],
      },
    }));
  };

  const removeTimeSlot = (type, day, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [day]: prev[type][day].filter((_, i) => i !== index),
      },
    }));
  };

  const updateTimeSlot = (type, day, index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [day]: prev[type][day].map((slot, i) =>
          i === index ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // firebase api send to DB
    console.log("Form Data:", formData);
    console.log("Subjects:", subjects);
  };

  const days = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const dayLabels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const [touched, setTouched] = useState({
    firstName: false,
    familyPhone: false,
    familyEmail: false,
  });

  const [generalInfo, setGeneralInfo] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    dateOfBirth: null,
    alergiesAna: "",
    allergiesNonAna: "",
    doesCarryEpi: false,
    doesAdminEpi: false,
  });

  const [familyInfo, setFamilyInfo] = useState({
    familyPhone: "",
    familyEmail: "",
    familyAddress: "",
  });

  const [emergencyInfo, setEmergencyInfo] = useState({
    emergencyFirst: "",
    emergencyLast: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  });

  const setGeneralInfoCallback = useCallback(
    (info) => setGeneralInfo(info),
    []
  );

  const setFamilyInfoCallback = useCallback((info) => setFamilyInfo(info), []);
  const setEmergencyInfoCallback = useCallback(
    (info) => setEmergencyInfo(info),
    []
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header title="NEW STUDENT" subtitle="Enter details for new student" />
      </Box>

      {/* General Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">General Student Information</Typography>
          <StudentGeneralInfo
            formData={generalInfo}
            setFormData={setGeneralInfoCallback}
            touched={touched}
            setTouched={setTouched}
            isEdit={true}
          />
        </Stack>
      </Paper>

      {/* Family Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Family Information</Typography>
          <StudentFamilyInfo
            formData={familyInfo}
            setFormData={setFamilyInfoCallback}
            touched={touched}
            setTouched={setTouched}
            isEdit={true}
          />
        </Stack>
      </Paper>

      {/* Emergency Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Emergency Contact</Typography>
          <StudentEmergencyInfo
            formData={emergencyInfo}
            setFormData={setEmergencyInfoCallback}
            touched={touched}
            setTouched={setTouched}
            isEdit={true}
          />
        </Stack>
      </Paper>

      {/* Academic Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Academic Information</Typography>
        </Stack>
      </Paper>

      {/* Trial Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Trial Session</Typography>
        </Stack>
      </Paper>

      {/* Availability Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Regular Availability</Typography>
        </Stack>
      </Paper>

      {/* Additional Info */}
      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Additional Information</Typography>
        </Stack>
      </Paper>

      {/* <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h2"
              component="h1"
              color={colors.orangeAccent[400]}
              gutterBottom
            >
              Wise Minds Tutoring
            </Typography>
            <Typography variant="h5" component="h2" color="text.secondary">
              New Student Information
            </Typography>
          </Box>

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              sx={{ mb: 3 }}
            >
              General Student Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  name="middleName"
                  value={formData.middleName}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.dateOfBirth}
                  onChange={handleDateChange("dateOfBirth")}
                  renderInput={(params) => (
                    <TextField {...params} fullWidth required />
                  )}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Allergies (Anaphylactic)"
                  name="anaphylacticAllergies"
                  value={formData.anaphylacticAllergies}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Does the student carry an Epi Pen?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="carriesEpiPen"
                    value={formData.carriesEpiPen}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Can the student administer THEIR Epi Pen?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="canAdministerEpiPen"
                    value={formData.canAdministerEpiPen}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Allergies (non-anaphylactic)"
                  name="nonAnaphylacticAllergies"
                  value={formData.nonAnaphylacticAllergies}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              sx={{ mb: 3 }}
            >
              Family Contact Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="familyPhone"
                  value={formData.familyPhone}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="familyEmail"
                  value={formData.familyEmail}
                  onChange={handleInputChange}
                  type="email"
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  name="familyAddress"
                  value={formData.familyAddress}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              sx={{ mb: 3 }}
            >
              Emergency Contact
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="emergencyFirstName"
                  value={formData.emergencyFirstName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="emergencyLastName"
                  value={formData.emergencyLastName}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Relationship"
                  name="emergencyRelationship"
                  value={formData.emergencyRelationship}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="emergencyPhone"
                  value={formData.emergencyPhone}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              sx={{ mb: 3 }}
            >
              Academic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="School"
                  name="school"
                  value={formData.school}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Year Level"
                  name="yearLevel"
                  value={formData.yearLevel}
                  onChange={handleInputChange}
                  required
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
                  Please list all subjects being undertaken and tick which
                  subjects you would like tutoring for:
                </Typography>
                {subjects.length === 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2, fontStyle: "italic" }}
                  >
                    No subjects added yet. Click the button below to add
                    subjects.
                  </Typography>
                )}
                <Box sx={{ mb: 2 }}>
                  {subjects.map((subject, index) => (
                    <Paper
                      key={index}
                      elevation={1}
                      sx={{
                        p: 2,
                        mb: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                      }}
                    >
                      <TextField
                        size="small"
                        label="Subject name"
                        value={subject.name}
                        onChange={(e) =>
                          handleSubjectChange(index, "name", e.target.value)
                        }
                        sx={{ flex: 2 }}
                      />
                      <TextField
                        size="small"
                        label="Hours/week"
                        type="number"
                        inputProps={{ min: 0, step: 0.5 }}
                        value={subject.hours}
                        onChange={(e) =>
                          handleSubjectChange(index, "hours", e.target.value)
                        }
                        sx={{ width: 120 }}
                      />
                      <IconButton
                        color="error"
                        onClick={() => removeSubject(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addSubject}
                >
                  Add Subject
                </Button>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Additional notes about tutoring hours (optional)"
                  name="hoursPerWeek"
                  value={formData.hoursPerWeek}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              sx={{ mb: 3 }}
            >
              Trial Session
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              When is your child available for their FREE trial session in the{" "}
              <strong>next two weeks</strong>? Please list the days and time
              that works best for you and note any preference.
            </Typography>

            <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Day</TableCell>
                    <TableCell>Available Time Slots</TableCell>
                    <TableCell width={60}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {days.map((day, dayIndex) => (
                    <TableRow key={day}>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {dayLabels[dayIndex]}
                      </TableCell>
                      <TableCell>
                        {formData.trialAvailability[day].length === 0 ? (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontStyle: "italic" }}
                          >
                            No time slots added
                          </Typography>
                        ) : (
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 1,
                            }}
                          >
                            {formData.trialAvailability[day].map(
                              (slot, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                  }}
                                >
                                  <TimePicker
                                    label="Start Time"
                                    value={slot.start}
                                    onChange={(newValue) =>
                                      updateTimeSlot(
                                        "trialAvailability",
                                        day,
                                        index,
                                        "start",
                                        newValue
                                      )
                                    }
                                    renderInput={(params) => (
                                      <TextField {...params} size="small" />
                                    )}
                                  />
                                  <Typography>to</Typography>
                                  <TimePicker
                                    label="End Time"
                                    value={slot.end}
                                    onChange={(newValue) =>
                                      updateTimeSlot(
                                        "trialAvailability",
                                        day,
                                        index,
                                        "end",
                                        newValue
                                      )
                                    }
                                    renderInput={(params) => (
                                      <TextField {...params} size="small" />
                                    )}
                                  />
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() =>
                                      removeTimeSlot(
                                        "trialAvailability",
                                        day,
                                        index
                                      )
                                    }
                                  >
                                    <RemoveCircleIcon />
                                  </IconButton>
                                </Box>
                              )
                            )}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <IconButton
                          color={colors.orangeAccent[400]}
                          onClick={() => addTimeSlot("trialAvailability", day)}
                        >
                          <AddCircleIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Grid item xs={12} md={6}>
              <DatePicker
                label="Preferred Start Date"
                value={formData.preferredStartDate}
                onChange={handleDateChange("preferredStartDate")}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              sx={{ mb: 3 }}
            >
              Regular Availability
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              When is your child available for tutoring? Please list the days
              and time that works best for you and note any preference.
            </Typography>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.sameAsTrialAvailability}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sameAsTrialAvailability: e.target.checked,
                    }))
                  }
                  name="sameAsTrialAvailability"
                />
              }
              label="If same availability as the Trial session, please check this box"
              sx={{ mb: 2 }}
            />
            {!formData.sameAsTrialAvailability && (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Day</TableCell>
                      <TableCell>Available Time Slots</TableCell>
                      <TableCell width={60}></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {days.map((day, dayIndex) => (
                      <TableRow key={day}>
                        <TableCell sx={{ fontWeight: 500 }}>
                          {dayLabels[dayIndex]}
                        </TableCell>
                        <TableCell>
                          {formData.regularAvailability[day].length === 0 ? (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              No time slots added
                            </Typography>
                          ) : (
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              {formData.regularAvailability[day].map(
                                (slot, index) => (
                                  <Box
                                    key={index}
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 2,
                                    }}
                                  >
                                    <TimePicker
                                      label="Start Time"
                                      value={slot.start}
                                      onChange={(newValue) =>
                                        updateTimeSlot(
                                          "regularAvailability",
                                          day,
                                          index,
                                          "start",
                                          newValue
                                        )
                                      }
                                      renderInput={(params) => (
                                        <TextField {...params} size="small" />
                                      )}
                                    />
                                    <Typography>to</Typography>
                                    <TimePicker
                                      label="End Time"
                                      value={slot.end}
                                      onChange={(newValue) =>
                                        updateTimeSlot(
                                          "regularAvailability",
                                          day,
                                          index,
                                          "end",
                                          newValue
                                        )
                                      }
                                      renderInput={(params) => (
                                        <TextField {...params} size="small" />
                                      )}
                                    />
                                    <IconButton
                                      color="error"
                                      size="small"
                                      onClick={() =>
                                        removeTimeSlot(
                                          "regularAvailability",
                                          day,
                                          index
                                        )
                                      }
                                    >
                                      <RemoveCircleIcon />
                                    </IconButton>
                                  </Box>
                                )
                              )}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="success"
                            onClick={() =>
                              addTimeSlot("regularAvailability", day)
                            }
                          >
                            <AddCircleIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h5"
              gutterBottom
              color="primary"
              sx={{ mb: 3 }}
            >
              Additional Information
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: "italic", mb: 3 }}>
              At wise minds, we usually provide students with light food and
              drinks during lessons. This is perfectly complementary and comes
              at no additional cost.
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">
                    Do you mind if your child is provided with tea, coffee
                    and/or snacks?
                  </FormLabel>
                  <RadioGroup
                    row
                    name="acceptsSnacks"
                    value={formData.acceptsSnacks}
                    onChange={handleInputChange}
                  >
                    <FormControlLabel
                      value="yes"
                      control={<Radio />}
                      label="Yes"
                    />
                    <FormControlLabel
                      value="no"
                      control={<Radio />}
                      label="No"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Is there any foods or drinks that you would like to not be provided? If so, please list."
                  name="restrictedFoods"
                  value={formData.restrictedFoods}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Do you have any other questions or concerns regarding tutoring?"
                  name="questionsOrConcerns"
                  value={formData.questionsOrConcerns}
                  onChange={handleInputChange}
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="How did you hear about us? (We really appreciate it if you can let us know!)"
                  name="referralSource"
                  value={formData.referralSource}
                  onChange={handleInputChange}
                  multiline
                  rows={2}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Paper
            elevation={0}
            sx={{ p: 3, backgroundColor: "grey.100", mb: 4 }}
          >
            <Typography variant="body2">
              By initiating a first tutoring session and any subsequent lessons,
              you agree to the Wise Minds terms and conditions which are
              available at WiseMindsCanberra.com
            </Typography>
          </Paper>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              size="large"
              onClick={handleSubmit}
              sx={{ px: 6, py: 1.5 }}
            >
              Submit Application
            </Button>
          </Box>
        </Paper>
      </Container> */}
    </LocalizationProvider>
  );
};

export default NewStudent;
