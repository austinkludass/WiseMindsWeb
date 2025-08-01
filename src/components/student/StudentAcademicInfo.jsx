import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { tokens } from "../../theme";
import { FixedSizeList } from "react-window";
import { db } from "../../data/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
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
}) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [subjectOptions, setSubjectOptions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  useEffect(() => {
    const fetchSubjectsWithCurriculums = async () => {
      const curriculumSnap = await getDocs(collection(db, "curriculums"));
      const curriculumMap = {};
      curriculumSnap.forEach((doc) => {
        curriculumMap[doc.id] = doc.data().name;
      });

      const subjectSnap = await getDocs(collection(db, "subjects"));
      const allSubjects = subjectSnap.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          name: data.name,
          curriculumName: curriculumMap[data.curriculumId] || "Unknown",
        };
      });

      setSubjectOptions(allSubjects);
      setLoadingSubjects(false);
    };

    fetchSubjectsWithCurriculums();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubjectChange = (index, field, value) => {
    const newSubjects = [...subjects];
    newSubjects[index][field] = value;
    setSubjects(newSubjects);
  };

  const addSubject = () => {
    setSubjects([...subjects, { name: "", hours: "" }]);
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
          />
          <Typography variant="body1" gutterBottom sx={{ mb: 2 }}>
            Please list all subjects being undertaken and tick which subjects
            you would like tutoring for:
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
                  getOptionLabel={(option) =>
                    `${option.name} (${option.curriculumName})`
                  }
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={
                    subjectOptions.find((s) => s.id === subject.id) || null
                  }
                  onChange={(_, newValue) => {
                    const updatedSubjects = [...subjects];
                    updatedSubjects[index] = {
                      id: newValue?.id || "",
                      hours: subjects[index].hours || "",
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
