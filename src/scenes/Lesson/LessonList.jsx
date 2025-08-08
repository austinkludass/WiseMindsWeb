import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Autocomplete,
  MenuItem,
  Switch,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from "@mui/material";
import {
  DatePicker,
  TimePicker,
  LocalizationProvider,
} from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { db } from "../../data/firebase";
import dayjs from "dayjs";
import Header from "../../components/Global/Header";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { collection, getDocs } from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";

// Hardcoded lists
const tutors = ["Brian Smith", "Jane Doe", "Michael Brown"];
const subjects = ["English", "Math", "Science", "History"];
const locations = ["Room 101", "Room 102", "Library", "Online"];
const lessonTypes = ["Normal", "Postpone", "Cancelled", "Trial", "Unconfirmed"];

// Helper for initial state
const initialState = {
  date: dayjs(),
  tutor: null,
  selectedStudents: [],
  subject: null,
  location: null,
  type: "Normal",
  repeat: false,
  frequency: "weekly",
  notes: "",
  startTime: dayjs().hour(12).minute(0),
  endTime: dayjs().hour(13).minute(0),
};

const LessonList = () => {
  const [date, setDate] = useState(initialState.date);
  const [tutor, setTutor] = useState(initialState.tutor);
  const [studentOptions, setStudentOptions] = useState([]);
  const [tutorsList, setTutorsList] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState(
    initialState.selectedStudents
  );
  const [curriculums, setCurriculums] = useState([]);
  const [subjectsList, setSubjectsList] = useState([]);
  const [subject, setSubject] = useState(initialState.subject);
  const [locationList, setLocationList] = useState([]);
  const [location, setLocation] = useState(initialState.location);
  const [type, setType] = useState(initialState.type);
  const [repeat, setRepeat] = useState(initialState.repeat);
  const [frequency, setFrequency] = useState(initialState.frequency);
  const [notes, setNotes] = useState(initialState.notes);
  const [startTime, setStartTime] = useState(initialState.startTime);
  const [endTime, setEndTime] = useState(initialState.endTime);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!date) newErrors.date = "Date is required";
    if (!tutor) newErrors.tutor = "Tutor is required";
    if (selectedStudents.length === 0)
      newErrors.selectedStudents = "At least 1 student is required";
    if (!subject) newErrors.subject = "Subject is required";
    if (!location) newErrors.location = "Location is required";
    if (!type) newErrors.type = "Type is required";
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!endTime) newErrors.endTime = "End time is required";
    return newErrors;
  };

  const handleCreate = () => {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const newLesson = {
      date: date.format("YYYY-MM-DD"),
      tutor,
      students: selectedStudents,
      subject,
      location,
      type,
      repeat,
      frequency: repeat ? frequency : null,
      notes,
      startTime: startTime.format("HH:mm"),
      endTime: endTime.format("HH:mm"),
    };
    console.log("Lesson Created:", newLesson);
  };

  const handleReset = () => {
    setDate(initialState.date);
    setTutor(initialState.tutor);
    setSelectedStudents(initialState.selectedStudents);
    setSubject(initialState.subject);
    setLocation(initialState.location);
    setType(initialState.type);
    setRepeat(initialState.repeat);
    setFrequency(initialState.frequency);
    setNotes(initialState.notes);
    setStartTime(initialState.startTime);
    setEndTime(initialState.endTime);
    setErrors({});
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snapshot = await getDocs(collection(db, "students"));
        const studentList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().lastName}`,
        }));
        setStudentOptions(studentList);
      } catch (error) {
        toast.error("Error fetching students: ", error.message);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "tutors"));
        const tutorsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: `${doc.data().firstName} ${doc.data().lastName}`,
        }));
        setTutorsList(tutorsData);
      } catch (error) {
        toast.error("Error fetching tutors: ", error.message);
      }
    };

    fetchTutors();
  }, []);

  useEffect(() => {
    const fetchCurriculums = async () => {
      try {
        const snapshot = await getDocs(collection(db, "curriculums"));
        const curriculumData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setCurriculums(curriculumData);
      } catch (error) {
        toast.error("Error fetching subjects: ", error.message);
      }
    };

    const fetchSubjects = async () => {
      try {
        const snapshot = await getDocs(collection(db, "subjects"));
        const subjectData = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          curriculumId: doc.data().curriculumId,
        }));

        subjectData.sort((a, b) => a.name.localeCompare(b.name));
        
        setSubjectsList(subjectData);
      } catch (error) {
        toast.error("Error fetching subjects: ", error.message);
      }
    };

    fetchCurriculums();
    fetchSubjects();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const snapshot = await getDocs(collection(db, "locations"));
        const bays = [];
        snapshot.docs.forEach((doc) => {
          const loc = doc.data();
          if (loc.tutorBays && Array.isArray(loc.tutorBays)) {
            loc.tutorBays.forEach((bay) => {
              bays.push({
                id: bay.id,
                name: `${bay.name} (${loc.name})`,
              });
            });
          }
        });
        setLocationList(bays);
      } catch (error) {
        toast.error("Error fetching locations: ", error.message);
      }
    };

    fetchLocations();
  }, []);

  const getSubjectLabel = (subject) => {
    if (!subject) return "";

    const curriculum = curriculums.find((c) => c.id === subject.curriculumId);
    const curriculumName = curriculum ? curriculum.name : "Unknown Curriculum";
    return `${subject.name} (${curriculumName})`;
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
      <Box display="flex" m="20px">
        <Header title="LESSONS" subtitle="Manage all lessons" />
      </Box>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h4">Create Lesson</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2}>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={setDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date,
                    },
                  }}
                />
                <Autocomplete
                  options={tutorsList}
                  getOptionLabel={(option) => option.name}
                  value={tutorsList.find((t) => t.id === tutor) || null}
                  onChange={(e, val) => setTutor(val ? val.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Tutor"
                      error={!!errors.tutor}
                      helperText={errors.tutor}
                    />
                  )}
                  fullWidth
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <TimePicker
                  label="Start Time"
                  minutesStep={30}
                  value={startTime}
                  onChange={setStartTime}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.startTime,
                      helperText: errors.startTime,
                    },
                  }}
                />
                <TimePicker
                  label="End Time"
                  minutesStep={30}
                  value={endTime}
                  onChange={setEndTime}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endTime,
                      helperText: errors.endTime,
                    },
                  }}
                />
              </Stack>

              <Autocomplete
                multiple
                options={studentOptions}
                getOptionLabel={(option) => option.name}
                value={studentOptions.filter((s) =>
                  selectedStudents.includes(s.id)
                )}
                onChange={(e, val) => {
                  if (val.length <= 3)
                    setSelectedStudents(val.map((s) => s.id));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Students (max 3)"
                    error={!!errors.selectedStudents}
                    helperText={errors.selectedStudents}
                  />
                )}
              />
              {selectedStudents.length >= 3 && (
                <Typography color="error">
                  Limit reached (3 students)
                </Typography>
              )}

              <Stack direction="row" spacing={2}>
                <Autocomplete
                  options={subjectsList}
                  getOptionLabel={getSubjectLabel}
                  value={subjectsList.find((s) => s.id === subject) || null}
                  onChange={(e, val) => setSubject(val ? val.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Subject"
                      error={!!errors.subject}
                      helperText={errors.subject}
                    />
                  )}
                  fullWidth
                />
              </Stack>

              <Stack direction="row" spacing={2}>
                <Autocomplete
                  options={locationList}
                  getOptionLabel={(option) => option.name}
                  value={
                    locationList.find((bay) => bay.id === location) || null
                  }
                  onChange={(e, val) => setLocation(val ? val.id : null)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      error={!!errors.location}
                      helperText={errors.location}
                    />
                  )}
                  fullWidth
                />
                <TextField
                  select
                  label="Type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  error={!!errors.type}
                  helperText={errors.type}
                  fullWidth
                >
                  {lessonTypes.map((t) => (
                    <MenuItem key={t} value={t}>
                      {t}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography>Repeat</Typography>
                <Switch
                  checked={repeat}
                  onChange={(e) => setRepeat(e.target.checked)}
                />
                {repeat && (
                  <RadioGroup
                    row
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                  >
                    <FormControlLabel
                      value="weekly"
                      control={<Radio />}
                      label="Weekly"
                    />
                    <FormControlLabel
                      value="fortnightly"
                      control={<Radio />}
                      label="Fortnightly"
                    />
                  </RadioGroup>
                )}
              </Stack>

              <TextField
                label="Notes"
                multiline
                minRows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                fullWidth
              />

              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={handleCreate}>
                  Create Lesson
                </Button>
                <Button variant="outlined" onClick={handleReset}>
                  Reset
                </Button>
              </Stack>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Paper>

      <Paper sx={{ p: 3, maxWidth: 1000, minWidth: 600, m: 4 }}>
        <Typography variant="h5" gutterBottom>
          Lessons
        </Typography>
      </Paper>
      <ToastContainer position="top-right" autoClose={3000} />
    </LocalizationProvider>
  );
};

export default LessonList;
