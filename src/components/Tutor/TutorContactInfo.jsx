import React from "react";
import {
  Typography,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import usePermissions from "../../hooks/usePermissions";
import { tokens } from "../../theme";
import { useParams } from "react-router-dom";

const TutorContactInfo = ({ formData, setFormData, isEdit }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { tutorId } = useParams();
  const { canViewEditAddress } = usePermissions();
  const canSeeAddress = canViewEditAddress(tutorId);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h4">Contact Information</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={2}>
          {isEdit ? (
            <>
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
              {canSeeAddress && (
                <TextField
                  name="address"
                  label="Address"
                  value={formData.address}
                  onChange={handleChange}
                />
              )}
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
                  Personal Email
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.personalEmail}
                </Typography>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Typography
                  variant="h5"
                  color={colors.orangeAccent[400]}
                  fontWeight="bold"
                  sx={{ mb: "5px" }}
                >
                  Phone Number
                </Typography>
                <Typography variant="h6" color={colors.grey[100]}>
                  {formData.phone}
                </Typography>
              </div>
              {canSeeAddress && (
                <div style={{ display: "flex", gap: "10px" }}>
                  <Typography
                    variant="h5"
                    color={colors.orangeAccent[400]}
                    fontWeight="bold"
                    sx={{ mb: "5px" }}
                  >
                    Address
                  </Typography>
                  <Typography variant="h6" color={colors.grey[100]}>
                    {formData.address}
                  </Typography>
                </div>
              )}
            </>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
};

export default TutorContactInfo;
