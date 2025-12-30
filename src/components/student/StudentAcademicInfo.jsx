import React, { useEffect, useState } from "react";
// TODO:
// - Restore fuzzy matching for subject search.
// - Family scheduling: only show this option if we send >1 student or they add a second.
// - Add common subjects per year level to subject search.
import {
  TextField,
  Typography,
  Box,
  Paper,
  IconButton,
  Button,
  Stack,
  useTheme,
  CircularProgress,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  MenuItem,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../data/firebase";
import { tokens } from "../../theme";
import { FixedSizeList } from "react-window";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";

const renderRow = (props) => {
  const { data, index, style } = props;
  const item = data[index];

  return React.cloneElement(item, {
    style: {
      ...style,
      top: style.top + 8,
    },
  });
};

const ListboxComponent = React.forwardRef(function ListboxComponent(
  props,
  ref
) {
  const { children, ...other } = props;
  const itemData = React.Children.toArray(children);
  const itemCount = itemData.length;
  const itemSize = 46;
  const height = Math.min(8, itemCount) * itemSize + 2 * 8;

  return (
    <div ref={ref} {...other}>
      <FixedSizeList
        height={height}
        itemCount={itemCount}
        itemSize={itemSize}
        itemData={itemData}
        overscanCount={5}
        outerElementType={React.forwardRef((props, ref) => (
          <ul {...props} ref={ref} style={{ margin: 0, padding: 0 }} />
        ))}
      >
        {renderRow}
      </FixedSizeList>
    </div>
  );
});

const StudentAcademicInfo = ({
  formData,
  setFormData,
  isEdit,
  subjects,
  setSubjects,
  allowTutoringToggle = false,
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [curriculums, setCurriculums] = useState([]);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [tutorOptions, setTutorOptions] = useState([]);
  const [loadingTutors, setLoadingTutors] = useState(true);
  const subjectList = Array.isArray(subjects) ? subjects : [];

  useEffect(() => {
    let isMounted = true;

    const fetchSubjectsWithCurriculums = async () => {
      try {
        const subjectSnap = await getDocs(collection(db, "subjects"));
        const curriculumSnap = await getDocs(collection(db, "curriculums"));
        if (!isMounted) return;
        const curriculumList = curriculumSnap.docs.map((docSnap) => ({
          id: docSnap.id,
          name: docSnap.data()?.name || "Unnamed curriculum",
        }));
        const curriculumMap = new Map(
          curriculumList.map((curriculum) => [curriculum.id, curriculum.name])
        );
        console.info(
          "[StudentAcademicInfo] cirriculums:",
          curriculumList.length,
          curriculumList.map((curriculum) => curriculum.name)
        );
        const curriculumNameToId = new Map(
          curriculumList.map((curriculum) => [
            curriculum.name.toLowerCase(),
            curriculum.id,
          ])
        );
        setCurriculums(curriculumList);

        const allSubjects = subjectSnap.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          const rawCurriculum =
            data.cirriculumId ||
            data.curriculumId ||
            data.cirriculum ||
            data.curriculum ||
            "";
          let curriculumId = "";
          let curriculumName = "";

          if (typeof rawCurriculum === "string") {
            const trimmed = rawCurriculum.trim();
            if (trimmed) {
              const lower = trimmed.toLowerCase();
              const pathId = trimmed.includes("/")
                ? trimmed.split("/").pop()
                : trimmed;
              curriculumId = curriculumMap.has(pathId)
                ? pathId
                : curriculumNameToId.get(lower) || trimmed;
            }
          } else if (rawCurriculum && typeof rawCurriculum.id === "string") {
            curriculumId = rawCurriculum.id;
          }

          if (curriculumId && curriculumMap.has(curriculumId)) {
            curriculumName = curriculumMap.get(curriculumId);
          } else if (typeof rawCurriculum === "string" && rawCurriculum.trim()) {
            curriculumName = rawCurriculum.trim();
          }

          return {
            id: docSnap.id,
            name: data.name || data.subject || "Unknown",
            curriculumId,
            curriculumName:
              data.cirriculumName ||
              data.curriculumName ||
              data.curriculum?.name ||
              data.cirriculum?.name ||
              curriculumName ||
              "",
          };
        });
        console.info(
          "[StudentAcademicInfo] subjects:",
          allSubjects.length,
          allSubjects.slice(0, 5).map((subject) => ({
            id: subject.id,
            name: subject.name,
            curriculumId: subject.curriculumId,
          }))
        );
        setSubjectOptions(allSubjects);
      } catch (error) {
        console.error(
          "[StudentAcademicInfo] Failed to load cirriculums/subjects:",
          error
        );
        if (isMounted) {
          setSubjectOptions([]);
          setCurriculums([]);
        }
      } finally {
        if (isMounted) setLoadingSubjects(false);
      }
    };

    fetchSubjectsWithCurriculums();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchTutors = async () => {
      try {
        const tutorSnap = await getDocs(collection(db, "tutors"));
        if (!isMounted) return;
        const tutors = tutorSnap.docs.map((docSnap) => {
          const data = docSnap.data() || {};
          const firstName = data.firstName || "";
          const lastName = data.lastName || "";
          const name = [firstName, lastName].filter(Boolean).join(" ");
          return {
            id: docSnap.id,
            name: name || data.name || "Unnamed tutor",
          };
        });
        setTutorOptions(tutors);
      } catch (error) {
        if (isMounted) setTutorOptions([]);
      } finally {
        if (isMounted) setLoadingTutors(false);
      }
    };

    fetchTutors();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjectList];
    const updated = { ...newSubjects[index], [field]: value };
    if (field === "selected" && !value) {
      updated.preferredTutorIds = [];
      updated.blockedTutorIds = [];
    }
    newSubjects[index] = updated;
    setSubjects(newSubjects);
  };

  const normalizeTutorIds = (value) => {
    if (!value || !Array.isArray(value)) return [];
    const ids = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") return item.id || item.tutorId || "";
        return "";
      })
      .filter(Boolean);
    return Array.from(new Set(ids));
  };

  const getTutorIdsForSubject = (subject, field) => {
    const raw =
      subject?.[field] ||
      (field === "preferredTutorIds" ? subject?.preferredTutors : subject?.blockedTutors) ||
      [];
    return normalizeTutorIds(raw);
  };

  const getTutorOptionsFromIds = (ids) =>
    tutorOptions.filter((tutor) => ids.includes(tutor.id));

  const setSubjectTutorIds = (index, field, selectedOptions = []) => {
    const ids = Array.from(
      new Set(selectedOptions.map((tutor) => tutor.id))
    );
    const nextSubjects = subjectList.map((subject, i) => {
      if (i !== index) return subject;
      const next = { ...subject, [field]: ids };
      if (field === "preferredTutorIds") {
        next.blockedTutorIds = normalizeTutorIds(next.blockedTutorIds).filter(
          (id) => !ids.includes(id)
        );
      }
      if (field === "blockedTutorIds") {
        next.preferredTutorIds = normalizeTutorIds(
          next.preferredTutorIds
        ).filter((id) => !ids.includes(id));
      }
      return next;
    });
    setSubjects(nextSubjects);
  };

  const yearLevelOptions = [
    "Pre-Kindergarten",
    "Kindergarten",
    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5",
    "Year 6",
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10",
    "Year 11",
    "Year 12",
    "Tertiary",
    "Other",
  ];

  const availableSubjectOptions = selectedCurriculumId
    ? subjectOptions.filter(
        (subject) => subject.curriculumId === selectedCurriculumId
      )
    : subjectOptions;

  useEffect(() => {
    if (!selectedCurriculumId || subjectOptions.length === 0) return;
    const validIds = new Set(
      subjectOptions
        .filter((subject) => subject.curriculumId === selectedCurriculumId)
        .map((subject) => subject.id)
    );
    let hasChanges = false;
    const nextSubjects = subjectList.map((subject) => {
      if (!subject.id || validIds.has(subject.id)) return subject;
      hasChanges = true;
      return { ...subject, id: "" };
    });
    if (hasChanges) setSubjects(nextSubjects);
  }, [selectedCurriculumId, subjectOptions, subjectList, setSubjects]);

  const addSubject = () => {
    const newSubject = {
      name: "",
      hours: "",
      preferredTutorIds: [],
      blockedTutorIds: [],
      ...(allowTutoringToggle ? { selected: false } : {}),
    };
    setSubjects([...subjectList, newSubject]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjectList.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const getSubjectDisplay = (subjectId) => {
    const match = subjectOptions.find((s) => s.id === subjectId);
    if (!match) return "Unknown Subject";
    return match.curriculumName
      ? `${match.name} (${match.curriculumName})`
      : match.name;
  };

  return (
    <Stack spacing={2}>
      {isEdit ? (
        <>
          <TextField
            fullWidth
            label="School"
            name="school"
            value={formData.school}
            onChange={handleInputChange}
            variant="outlined"
          />
          <TextField
            fullWidth
            label="Year Level"
            name="yearLevel"
            value={formData.yearLevel}
            onChange={handleInputChange}
            variant="outlined"
            select
          >
            {yearLevelOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Curriculum"
            name="curriculum"
            value={selectedCurriculumId}
            onChange={(e) => setSelectedCurriculumId(e.target.value)}
            variant="outlined"
            select
            disabled={curriculums.length === 0}
          >
            <MenuItem value="">All Curriculums</MenuItem>
            {curriculums.map((curriculum) => (
              <MenuItem key={curriculum.id} value={curriculum.id}>
                {curriculum.name}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
            {allowTutoringToggle
              ? "Please list all of the subjects that the student is currently taking at school and tick what subjects you would like tutoring for. Our sessions run for 1 hour each per subject."
              : "Please list all subjects being undertaken and add the desired tutoring hours:"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addSubject}
          >
            Add Subject
          </Button>
          {subjectList.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: "italic" }}
            >
              No subjects added yet. Click the button above to add subjects.
            </Typography>
          )}
          <Box sx={{ mb: 2 }}>
          {subjectList.map((subject, index) => {
            const preferredTutorIds = getTutorIdsForSubject(
              subject,
              "preferredTutorIds"
            );
            const blockedTutorIds = getTutorIdsForSubject(
              subject,
              "blockedTutorIds"
            );
            const overlapTutorIds = preferredTutorIds.filter((id) =>
              blockedTutorIds.includes(id)
            );
            const preferredTutors = getTutorOptionsFromIds(preferredTutorIds);
            const blockedTutors = getTutorOptionsFromIds(blockedTutorIds);

            return (
            <Paper
              key={index}
              elevation={1}
              sx={{
                p: 2,
                mb: 1,
              }}
            >
              <Stack spacing={2}>
                <Box
                  display="flex"
                  alignItems="center"
                  gap={2}
                  flexWrap="wrap"
                >
                  <Autocomplete
                    loading={loadingSubjects}
                    sx={{ flex: 2, minWidth: 240 }}
                    disableListWrap
                    ListboxComponent={ListboxComponent}
                    options={availableSubjectOptions}
                    filterOptions={(options, { inputValue }) => {
                      if (!inputValue) return options;
                      const term = inputValue.toLowerCase();
                      return options.filter((option) => {
                        const name = option.name?.toLowerCase() || "";
                        const curriculum =
                          option.curriculumName?.toLowerCase() || "";
                        return name.includes(term) || curriculum.includes(term);
                      });
                    }}
                    getOptionLabel={(option) =>
                      option.curriculumName
                        ? `${option.name} (${option.curriculumName})`
                        : option.name
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    value={
                      availableSubjectOptions.find((s) => s.id === subject.id) ||
                      null
                    }
                    onChange={(_, newValue) => {
                      const updatedSubjects = [...subjectList];
                      const existing = subjectList[index] || {};
                      const selected = allowTutoringToggle
                        ? typeof subjectList[index]?.selected === "boolean"
                          ? subjectList[index].selected
                          : false
                        : subjectList[index]?.selected;
                      const preferredTutorIds = normalizeTutorIds(
                        existing.preferredTutorIds || existing.preferredTutors
                      );
                      const blockedTutorIds = normalizeTutorIds(
                        existing.blockedTutorIds || existing.blockedTutors
                      );
                      updatedSubjects[index] = {
                        id: newValue?.id || "",
                        hours: subjectList[index]?.hours || "",
                        ...(allowTutoringToggle ? { selected } : {}),
                        preferredTutorIds,
                        blockedTutorIds,
                      };
                      setSubjects(updatedSubjects);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Subject name"
                        sx={{ flex: 2 }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {loadingSubjects ? (
                                <CircularProgress color="inherit" size={16} />
                              ) : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />
                  {allowTutoringToggle && (
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={Boolean(subject.selected)}
                          onChange={(e) =>
                            handleSubjectChange(
                              index,
                              "selected",
                              e.target.checked
                            )
                          }
                        />
                      }
                      label="Request tutoring?"
                      sx={{ minWidth: 160 }}
                    />
                  )}
                  <TextField
                    size="small"
                    label="Hours/week"
                    type="number"
                    inputProps={{ min: 0, step: 1 }}
                    value={subject.hours}
                    onChange={(e) =>
                      handleSubjectChange(index, "hours", e.target.value)
                    }
                    sx={{ width: 120 }}
                    disabled={allowTutoringToggle && !subject.selected}
                  />
                  <IconButton
                    color="error"
                    onClick={() => removeSubject(index)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                {allowTutoringToggle &&
                  (Boolean(subject.selected) ||
                    preferredTutorIds.length > 0 ||
                    blockedTutorIds.length > 0) && (
                  <Stack spacing={1}>
                    {overlapTutorIds.length > 0 && (
                      <Typography variant="body2" color="error">
                        A tutor cannot be both preferred and blocked. Please
                        remove duplicates.
                      </Typography>
                    )}
                    <Autocomplete
                      multiple
                      options={tutorOptions}
                      loading={loadingTutors}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      value={preferredTutors}
                      onChange={(_, value) =>
                        setSubjectTutorIds(index, "preferredTutorIds", value)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Preferred tutors"
                          placeholder="Select preferred tutors"
                        />
                      )}
                    />
                    <Autocomplete
                      multiple
                      options={tutorOptions}
                      loading={loadingTutors}
                      disableCloseOnSelect
                      getOptionLabel={(option) => option.name}
                      isOptionEqualToValue={(option, value) =>
                        option.id === value.id
                      }
                      value={blockedTutors}
                      onChange={(_, value) =>
                        setSubjectTutorIds(index, "blockedTutorIds", value)
                      }
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Blocked tutors"
                          placeholder="Select blocked tutors"
                        />
                      )}
                    />
                  </Stack>
                )}
              </Stack>
              </Paper>
            );
          })}
          </Box>
          <TextField
            fullWidth
            label="Additional notes about tutoring hours (optional)"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            multiline
            rows={2}
            variant="outlined"
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
              School
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.school}
            </Typography>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Year Level
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.yearLevel}
            </Typography>
          </div>
          <div
            style={{ display: "flex", gap: "10px", flexDirection: "column" }}
          >
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Subject Tutor Hours (subject / hours)
            </Typography>
            {subjectList.map((subject, index) => {
              return (
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
                  <Typography sx={{ flex: 2 }}>
                    {getSubjectDisplay(subject.id)}
                  </Typography>
                  <Typography sx={{ width: 120 }}>{subject.hours}</Typography>
                </Paper>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Typography
              variant="h5"
              color={colors.orangeAccent[400]}
              fontWeight="bold"
              sx={{ mb: "5px" }}
            >
              Additional Notes
            </Typography>
            <Typography variant="h6" color={colors.grey[100]}>
              {formData.notes}
            </Typography>
          </div>
        </>
      )}
    </Stack>
  );
};

export default StudentAcademicInfo;
