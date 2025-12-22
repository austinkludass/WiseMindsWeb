import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Stack,
  Button,
  Typography,
  Alert,
  LinearProgress,
} from "@mui/material";

const IntakeLayout = ({
  steps,
  currentStep,
  errors,
  children,
  onNext,
  onBack,
  onSubmit,
  isSubmitting,
  isLastStep,
}) => {
  return (
    <Box sx={{ px: { xs: 2, md: 6 }, py: { xs: 3, md: 5 } }}>
      <Stack spacing={3} sx={{ maxWidth: 980, mx: "auto" }}>
        <Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Student Intake Form
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tell us about your child and preferred tutoring schedule. We'll use
            this to match the best tutor and timetable.
          </Typography>
        </Box>

        <Stepper activeStep={currentStep} alternativeLabel>
          {steps.map((step) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {isSubmitting && <LinearProgress />}

        {errors.length > 0 && (
          <Alert severity="error">
            <Typography variant="subtitle1" fontWeight="bold">
              Please review the following:
            </Typography>
            <ul>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Paper sx={{ p: { xs: 2, md: 4 } }}>{children}</Paper>

        <Box display="flex" justifyContent="space-between" gap={2}>
          <Button
            variant="outlined"
            onClick={onBack}
            disabled={currentStep === 0 || isSubmitting}
          >
            Back
          </Button>
          {isLastStep ? (
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={onNext}
              disabled={isSubmitting}
            >
              Next
            </Button>
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default IntakeLayout;
