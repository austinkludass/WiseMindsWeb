import { useEffect, useState } from "react";
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
  Chip,
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
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { toast, ToastContainer } from "react-toastify";

const lessonTypes = ["Normal", "Postpone", "Cancelled", "Trial", "Unconfirmed"];

const initialState = {
  date: dayjs(),
  tutor: null,
  selectedStudents: [],
  subjectGroup: null,
  location: null,
  type: "Normal",
  repeat: false,
  frequency: "weekly",
  notes: "",
  startTime: dayjs().hour(12).minute(0),
  endTime: dayjs().hour(13).minute(0),
};

// const typeColors = {
//   Normal: "success",
//   Trial: "primary",
//   Postpone: "warning",
//   Unconfirmed: "info",
//   Cancelled: "error",
// };

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
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [subjectGroup, setSubjectGroup] = useState(null);
  const [locationList, setLocationList] = useState([]);
  const [location, setLocation] = useState(initialState.location);
  const [type, setType] = useState(initialState.type);
  const [repeat, setRepeat] = useState(initialState.repeat);
  const [frequency, setFrequency] = useState(initialState.frequency);
  const [notes, setNotes] = useState(initialState.notes);
  const [startTime, setStartTime] = useState(initialState.startTime);
  const [endTime, setEndTime] = useState(initialState.endTime);
  const [errors, setErrors] = useState({});
  // const [lessons, setLessons] = useState([]);

  const validate = () => {
    const newErrors = {};
    if (!date) newErrors.date = "Date is required";
    if (!tutor) newErrors.tutor = "Tutor is required";
    if (selectedStudents.length === 0)
      newErrors.selectedStudents = "At least 1 student is required";
    if (!subjectGroup) newErrors.subject = "Subject Group is required";
    if (!location) newErrors.location = "Location is required";
    if (!type) newErrors.type = "Type is required";
    if (!startTime) newErrors.startTime = "Start time is required";
    if (!endTime) newErrors.endTime = "End time is required";
    if (startTime >= endTime)
      newErrors.endTime = "End time needs to be after start time";
    else if (endTime.diff(startTime, "hour") < 1)
      newErrors.endTime = "Lesson needs to be at least 1 hour long";
    return newErrors;
  };

  const handleCreate = async () => {
    const newErrors = validate();
    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const tutorObj = tutorsList.find((t) => t.id === tutor);
    const studentObjs = studentOptions.filter((s) =>
      selectedStudents.includes(s.id)
    );
    const subjectGroupObj = subjectGroups.find((g) => g.id === subjectGroup);
    const locationObj = locationList.find((l) => l.id === location);

    const lessonData = {
      startTime: startTime.format("HH:mm"),
      endTime: endTime.format("HH:mm"),
      type,
      notes,
      tutorId: tutor,
      studentIds: selectedStudents,
      subjectGroupId: subjectGroup,
      locationId: location,
      tutorName: tutorObj ? tutorObj.name : "",
      tutorColor:
        tutorObj && tutorObj.tutorColor ? tutorObj.tutorColor : "#888888",
      studentNames: studentObjs.map((s) => s.name),
      subjectGroupName: subjectGroupObj ? subjectGroupObj.name : "",
      locationName: locationObj ? locationObj.name : "",
    };

    try {
      if (repeat) {
        await addDoc(collection(db, "lessonTemplates"), {
          ...lessonData,
          frequency,
          startDate: date.format("YYYY-MM-DD"),
        });
      } else {
        const lessonsCol = collection(db, "lessons");

        const startDateTime = dayjs(
          `${date.format("YYYY-MM-DD")}T${startTime.format("HH:mm")}`,
        ).toISOString();
        const endDateTime = dayjs(
          `${date.format("YYYY-MM-DD")}T${endTime.format("HH:mm")}`,
        ).toISOString();

        const singleLessonData = {
          type,
          notes,
          tutorId: tutor,
          studentIds: selectedStudents,
          subjectGroupId: subjectGroup,
          locationId: location,
          tutorName: tutorObj ? tutorObj.name : "",
          tutorColor: tutorObj ? tutorObj.tutorColor : "#888888",
          studentNames: studentObjs.map((s) => s.name),
          subjectGroupName: subjectGroupObj ? subjectGroupObj.name : "",
          locationName: locationObj ? locationObj.name : "",
          templateId: null,
          startDateTime,
          endDateTime,
          students: studentObjs.map((s) => ({
            studentId: s.id,
            studentName: s.name,
            attendance: null,
            report: "",
          })),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(lessonsCol, singleLessonData);
      }

      toast.success("Lesson created");
      handleReset();
    } catch (error) {
      toast.error("Error creating lesson: " + error.message);
    }
  };

  const handleReset = () => {
    setDate(initialState.date);
    setTutor(initialState.tutor);
    setSelectedStudents(initialState.selectedStudents);
    setSubjectGroup(initialState.subjectGroup);
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
          tutorColor: doc.data().tutorColor,
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
                name: bay.name,
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

  useEffect(() => {
    const fetchSubjectGroups = async () => {
      try {
        const snapshot = await getDocs(collection(db, "subjectGroups"));
        const groups = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          subjectIds: doc.data().subjectIds || [],
        }));
        setSubjectGroups(groups);
      } catch (error) {
        toast.error("Error fetching subject groups: ", error.message);
      }
    };

    fetchSubjectGroups();
  }, []);

  const getSubjectGroupLabel = (group) => {
    if (!group) return "";
    const subjectNames = group.subjectIds
      .map((id) => subjectsList.find((s) => s.id === id)?.name)
      .filter(Boolean);
    return `${group.name}${
      subjectNames.length !== 0 ? ` (${subjectNames.join(", ")})` : ""
    }`;
  };

  // const columns = [
  //   {
  //     field: "startDate",
  //     headerName: "Date",
  //     flex: 1,
  //     renderCell: (params) => {
  //       if (!params.value) return "";
  //       return dayjs(params.value).format("DD MMM YY");
  //     },
  //   },
  //   { field: "startTime", headerName: "Start", flex: 0.5 },
  //   { field: "endTime", headerName: "End", flex: 0.5 },
  //   { field: "tutorName", headerName: "Tutor", flex: 1 },
  //   {
  //     field: "studentNames",
  //     headerName: "Students",
  //     flex: 1.5,
  //     renderCell: (params) => {
  //       const students = params.value;
  //       if (!Array.isArray(students)) return "";
  //       return students.join(", ");
  //     },
  //   },
  //   { field: "subjectGroupName", headerName: "Subject Group", flex: 1 },
  //   { field: "locationName", headerName: "Location", flex: 1 },
  //   {
  //     field: "type",
  //     headerName: "Type",
  //     flex: 1,
  //     renderCell: (params) => {
  //       const type = params.value;
  //       const color = typeColors[type] || "default";
  //       return <Chip label={type} color={color} size="small" />;
  //     },
  //   },
  // ];

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
                  options={subjectGroups}
                  getOptionLabel={getSubjectGroupLabel}
                  value={
                    subjectGroups.find((g) => g.id === subjectGroup) || null
                  }
                  onChange={(e, val) => setSubjectGroup(val ? val.id : null)}
                  renderOption={(props, option) => {
                    const subjectNames = option.subjectIds
                      .map((id) => subjectsList.find((s) => s.id === id)?.name)
                      .filter(Boolean);

                    return (
                      <li {...props}>
                        <Box>
                          <Typography variant="body1" fontWeight="bold">
                            {option.name}
                          </Typography>
                          <Box
                            sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                          >
                            {subjectNames.slice(0, 4).map((name) => (
                              <Chip key={name} label={name} size="small" />
                            ))}
                            {subjectNames.length > 4 && (
                              <Chip
                                label={`+${subjectNames.length - 4} more`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </Box>
                      </li>
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Subject Group"
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
        {/* <DataGrid
          rows={lessons}
          columns={columns}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: { paginationModel: { pageSize: 10 } },
          }}
          filterMode="client"
        /> */}
      </Paper>
      <ToastContainer position="top-right" autoClose={3000} />
    </LocalizationProvider>
  );
};

export default LessonList;
