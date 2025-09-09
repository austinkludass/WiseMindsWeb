import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Stack,
  Autocomplete,
  Typography,
  MenuItem,
  Switch,
  RadioGroup,
  FormControlLabel,
  Radio,
  Chip,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { db } from "../../data/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { toast } from "react-toastify";

const lessonTypes = ["Normal", "Postpone", "Cancelled", "Trial", "Unconfirmed"];

const LessonForm = ({ initialValues, onCreated, onUpdated, edit }) => {
  const [date, setDate] = useState(initialValues.date || dayjs());
  const [startTime, setStartTime] = useState(
    initialValues.startTime || dayjs()
  );
  const [endTime, setEndTime] = useState(
    initialValues.endTime || dayjs().add(1, "hour")
  );
  const [subjectsList, setSubjectsList] = useState([]);
  const [subjectGroups, setSubjectGroups] = useState([]);
  const [locationList, setLocationList] = useState([]);
  const [tutor, setTutor] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [tutorsList, setTutorsList] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [subjectGroup, setSubjectGroup] = useState(null);
  const [location, setLocation] = useState(null);
  const [type, setType] = useState("Normal");
  const [repeat, setRepeat] = useState(false);
  const [frequency, setFrequency] = useState("weekly");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});
  const [editConfirmOpen, setEditConfirmOpen] = useState(false);

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

  // Fetch Students
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

  // Fetch Tutors
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

  // Fetch Subjects
  useEffect(() => {
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

    fetchSubjects();
  }, []);

  // Fetch Locations
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

  // Fetch Subject Groups
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

  const handleSubmit = () => {
    if (edit) {
      if (initialValues.frequency) {
        setEditConfirmOpen(true);
      } else {
        handleEdit(false);
      }
    } else {
      handleCreate();
    }
  };

  const handleEdit = async (applyToFuture = false) => {
    try {
      const tutorObj = tutorsList.find((t) => t.id === tutor);
      const studentObjs = studentOptions.filter((s) =>
        selectedStudents.includes(s.id)
      );
      const subjectGroupObj = subjectGroups.find((g) => g.id === subjectGroup);
      const locationObj = locationList.find((l) => l.id === location);

      const updatedFields = {
        startTime: startTime.format("HH:mm"),
        endTime: endTime.format("HH:mm"),
        type,
        notes,
        tutorId: tutor,
        studentIds: selectedStudents,
        subjectGroupId: subjectGroup,
        locationId: location,
        tutorName: tutorObj ? tutorObj.name : "",
        tutorColor: tutorObj?.tutorColor || "#888888",
        studentNames: studentObjs.map((s) => s.name),
        subjectGroupName: subjectGroupObj ? subjectGroupObj.name : "",
        locationName: locationObj ? locationObj.name : "",
      };

      if (applyToFuture && initialValues.templateId) {
        const templateRef = doc(
          db,
          "lessonTemplates",
          initialValues.templateId
        );
        const templateSnap = await getDoc(templateRef);
        if (!templateSnap.exists()) return;

        const oldTemplate = templateSnap.data();

        await updateDoc(templateRef, {
          endDate: dayjs(initialValues.startDateTime)
            .subtract(1, "day")
            .format("YYYY-MM-DD"),
          updatedAt: serverTimestamp(),
        });

        const newTemplate = {
          ...oldTemplate,
          ...updatedFields,
          startDate: dayjs(initialValues.startDateTime).format("YYYY-MM-DD"),
          endDate: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(collection(db, "lessonTemplates"), newTemplate);
      } else {
        const lessonRef = doc(db, "lessons", initialValues.id);
        await updateDoc(lessonRef, {
          ...updatedFields,
          isException: true,
          updatedAt: serverTimestamp(),
        });
      }

      toast.success("Lesson updated");
      onUpdated?.({
        ...updatedFields,
        id: initialValues.id,
        templateId: initialValues.templateId,
      });
    } catch (error) {
      toast.error("Error updating lesson: " + error.message);
    }
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
          endDate: null,
        });
      } else {
        const lessonsCol = collection(db, "lessons");

        const startDateTime = dayjs(
          `${date.format("YYYY-MM-DD")}T${startTime.format("HH:mm")}`
        ).toISOString();
        const endDateTime = dayjs(
          `${date.format("YYYY-MM-DD")}T${endTime.format("HH:mm")}`
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
          isException: false,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        await addDoc(lessonsCol, singleLessonData);
      }

      toast.success("Lesson created");
      onCreated?.();
      handleReset();
    } catch (error) {
      toast.error("Error creating lesson: " + error.message);
    }
  };

  const handleReset = () => {
    setDate(initialValues.date);
    setTutor(initialValues.tutor);
    setSelectedStudents(initialValues.selectedStudents);
    setSubjectGroup(initialValues.subjectGroup);
    setLocation(initialValues.location);
    setType(initialValues.type);
    setRepeat(initialValues.repeat);
    setFrequency(initialValues.frequency);
    setNotes(initialValues.notes);
    setStartTime(initialValues.startTime);
    setEndTime(initialValues.endTime);
    setErrors({});
  };

  useEffect(() => {
    if (initialValues.tutor && tutorsList.length > 0) {
      setTutor(initialValues.tutor);
    }
  }, [initialValues.tutor, tutorsList]);

  useEffect(() => {
    if (initialValues.selectedStudents && studentOptions.length > 0) {
      setSelectedStudents(initialValues.selectedStudents);
    }
  }, [initialValues.selectedStudents, studentOptions]);

  useEffect(() => {
    if (initialValues.subjectGroup && subjectGroups.length > 0) {
      setSubjectGroup(initialValues.subjectGroup);
    }
  }, [initialValues.subjectGroup, subjectGroups]);

  useEffect(() => {
    if (initialValues.location && locationList.length > 0) {
      setLocation(initialValues.location);
    }
  }, [initialValues.location, locationList]);

  useEffect(() => {
    if (initialValues.notes) {
      setNotes(initialValues.notes);
    }
  }, [initialValues.notes]);

  return (
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
        value={studentOptions.filter((s) => selectedStudents.includes(s.id))}
        onChange={(e, val) => {
          if (val.length <= 3) setSelectedStudents(val.map((s) => s.id));
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
        <Typography color="error">Limit reached (3 students)</Typography>
      )}

      <Stack direction="row" spacing={2}>
        <Autocomplete
          options={subjectGroups}
          getOptionLabel={getSubjectGroupLabel}
          value={subjectGroups.find((g) => g.id === subjectGroup) || null}
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
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
          value={locationList.find((bay) => bay.id === location) || null}
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

      {!edit && (
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
      )}

      <TextField
        label="Notes"
        multiline
        minRows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        fullWidth
      />

      <Stack direction="row" spacing={2}>
        <Button variant="contained" onClick={handleSubmit}>
          {edit ? "Edit Lesson" : "Create Lesson"}
        </Button>
        <Button variant="outlined" onClick={handleReset}>
          Reset
        </Button>
      </Stack>

      <Dialog open={editConfirmOpen} onClose={() => setEditConfirmOpen(false)}>
        <DialogTitle>Apply changes to...</DialogTitle>
        <DialogActions>
          <Button
            onClick={() => {
              setEditConfirmOpen(false);
              handleEdit(false);
            }}
          >
            Only this lesson
          </Button>
          <Button
            onClick={() => {
              setEditConfirmOpen(false);
              handleEdit(true);
            }}
          >
            This and future lessons
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default LessonForm;
