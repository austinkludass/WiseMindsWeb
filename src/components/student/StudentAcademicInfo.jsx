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

  useEffect(() => {
    const fetchSubjectsWithCurriculums = async () => {
      try {
        const response = await fetch(
          "https://australia-southeast1-wisemindsadmin.cloudfunctions.net/api/subjects",
          {
            headers: {
              "x-api-key": "apples",
            },
          }
        );
        const data = await response.json();
        const rawSubjects = Array.isArray(data)
          ? data
          : Array.isArray(data?.subjects)
            ? data.subjects
            : [];
        const allSubjects = rawSubjects.map((subject, index) => ({
          id:
            subject.id ||
            subject._id ||
            subject.subjectId ||
            `subject-${index}`,
          name: subject.name || subject.subject || "Unknown",
          curriculumName:
            subject.curriculumName ||
            subject.curriculum?.name ||
            "Unknown",
        }));
        setSubjectOptions(allSubjects);
      } catch (error) {
        setSubjectOptions([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjectsWithCurriculums();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index] = { ...newSubjects[index], [field]: value };
    setSubjects(newSubjects);
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

  const addSubject = () => {
    const newSubject = {
      name: "",
      hours: "",
      ...(allowTutoringToggle ? { selected: false } : {}),
    };
    setSubjects([...subjects, newSubject]);
  };

  const removeSubject = (index) => {
    const newSubjects = subjects.filter((_, i) => i !== index);
    setSubjects(newSubjects);
  };

  const getSubjectDisplay = (subjectId) => {
    const match = subjectOptions.find((s) => s.id === subjectId);
    return match
      ? `${match.name} (${match.curriculumName})`
      : "Unknown Subject";
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
          {subjects.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, fontStyle: "italic" }}
            >
              No subjects added yet. Click the button above to add subjects.
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
                <Autocomplete
                  loading={loadingSubjects}
                  sx={{ flex: 2 }}
                  disableListWrap
                  ListboxComponent={ListboxComponent}
                  options={subjectOptions}
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
                    `${option.name} (${option.curriculumName})`
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={
                    subjectOptions.find((s) => s.id === subject.id) || null
                  }
                  onChange={(_, newValue) => {
                    const updatedSubjects = [...subjects];
                    const selected = allowTutoringToggle
                      ? typeof subjects[index]?.selected === "boolean"
                        ? subjects[index].selected
                        : false
                      : subjects[index]?.selected;
                    updatedSubjects[index] = {
                      id: newValue?.id || "",
                      hours: subjects[index].hours || "",
                      ...(allowTutoringToggle ? { selected } : {}),
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
                    sx={{ minWidth: 120 }}
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
              </Paper>
            ))}
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
            {subjects.map((subject, index) => {
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
