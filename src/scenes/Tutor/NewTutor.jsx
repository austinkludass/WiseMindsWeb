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
  Switch
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Grid from "@mui/material/Grid2";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";

const NewTutor = () => {
  const [color, setColor] = useColor("#6e6e6e");
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };
  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Profile Information */}
      <Paper sx={{ p: 3, maxWidth: 1600, minWidth: 600, m: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid
            item
            size={4}
            sx={{ display: "flex", justifyContent: "center" }}
          >
            <Stack spacing={2}>
              <Avatar sx={{ width: 140, height: 140, bgcolor: color.hex }} />
              <ColorPicker height={50} color={color} onChange={setColor} hideAlpha="true" hideInput={["rgb", "hsv", "hex"]} />
            </Stack>
          </Grid>
          <Grid item size={8}>
            <Stack spacing={2}>
              <TextField required label="First Name" />
              <TextField label="Middle Name" />
              <TextField required label="Last Name" />
              <DatePicker label="Date of Birth" />
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Login Information */}
      <Paper sx={{ p: 3, maxWidth: 1600, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
          <Typography variant="h4">Login Information</Typography>
          <TextField required type="email" label="Wise Minds Email" />
          <TextField
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

      <Paper sx={{ p: 3, maxWidth: 1600, minWidth: 600, m: 4 }}>
        <Stack spacing={2}>
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

          {/* Emergency Contact */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h4">Emergency Contact</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                <TextField required label="Full Name" />
                <FormControl fullWidth>
                  <InputLabel required id="relationship-select-label">
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
                <TextField required label="Phone Number" />
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
                  control={
                    <Switch
                      checked="true"
                    />
                  }
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

      {/* Submit Button */}
      <Grid container justifyContent="flex-end" sx={{ m: 4 }}>
          <Button variant="contained" color="primary">
            <Typography variant="h5">Submit</Typography>
          </Button>
        </Grid>
    </LocalizationProvider>
  );
};

export default NewTutor;
