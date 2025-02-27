import React, { useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  FormGroup,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Divider,
} from "@mui/material";

const NewStudent = () => {
  const [subjects, setSubjects] = useState([
    { name: "Mathematics", selected: false },
    { name: "English", selected: false },
    { name: "Science", selected: false },
    { name: "History", selected: false },
    { name: "Geography", selected: false },
    { name: "Physical Education", selected: false },
    { name: "Art", selected: false },
    { name: "Music", selected: false },
  ]);

  const handleSubjectToggle = (index) => {
    const newSubjects = [...subjects];
    newSubjects[index].selected = !newSubjects[index].selected;
    setSubjects(newSubjects);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted");
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={4}>
          <Typography variant="h4" component="h1" fontWeight="bold">
            Student Registration Form
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          {/* Personal Information */}
          <Box mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6">Personal Information</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Middle Name" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Date of Birth"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Medical Information */}
          <Box mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6">Medical Information</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Allergies (Anaphylactic)"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Allergies (Non-anaphylactic)"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormGroup row>
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Carries Epi pen"
                  />
                  <FormControlLabel
                    control={<Checkbox />}
                    label="Can self-administer Epi pen"
                  />
                </FormGroup>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Family Contact */}
          <Box mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6">Family Contact Information</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type="tel"
                  label="Family Phone"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type="email"
                  label="Family Email"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={3}
                  label="Family Address"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Emergency Contact */}
          <Box mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6">Emergency Contact</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Relationship"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  type="tel"
                  label="Phone"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Academic Information */}
          <Box mb={4}>
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="h6">Academic Information</Typography>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="School"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Year Level</InputLabel>
                  <Select label="Year Level" defaultValue="">
                    <MenuItem value="">Select Year Level</MenuItem>
                    {[...Array(12)].map((_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        Year {i + 1}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Subjects
                </Typography>
                <Grid container spacing={2}>
                  {subjects.map((subject, index) => (
                    <Grid item xs={12} sm={4} key={subject.name}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={subject.selected}
                            onChange={() => handleSubjectToggle(index)}
                          />
                        }
                        label={subject.name}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  type="date"
                  label="Preferred Start Date"
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>

          <Box display="flex" justifyContent="flex-end" gap={2}>
            <Button variant="outlined" color="inherit">
              Cancel
            </Button>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewStudent;
