import {
  Box,
  Grid2 as Grid,
  Typography,
  Button,
  Paper,
  TextField,
  IconButton,
  Divider,
  Chip,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";
import { tokens } from "../../theme";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleMap } from "../../components/Global/GoogleMap";
import Header from "../../components/Global/Header";
import { db } from "../../data/firebase";
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  getDoc,
  getDocs,
} from "firebase/firestore";

const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
});

const tutorBaySchema = z.object({
  name: z.string().min(1, "Bay name is required"),
});

const TutoringBayList = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [locations, setLocations] = useState([]);
  const [editingLocation, setEditingLocation] = useState(null);
  const [showAddLocationForm, setShowAddLocationForm] = useState(false);
  const [editingBay, setEditingBay] = useState({ locationId: "", bay: null });
  const [showAddBayForm, setShowAddBayForm] = useState(null);
  const [locationToDelete, setLocationToDelete] = useState(null);

  useEffect(() => {
    const fetchLocations = async () => {
      const snapshot = await getDocs(collection(db, "locations"));
      const fetched = snapshot.docs.map((doc) => doc.data());
      setLocations(fetched);
    };

    fetchLocations();
  }, []);

  const locationForm = useForm({
    resolver: zodResolver(locationSchema),
    defaultValues: { name: "", address: "" },
  });

  const bayForm = useForm({
    resolver: zodResolver(tutorBaySchema),
    defaultValues: { name: "" },
  });

  const addLocation = async (data) => {
    const id = crypto.randomUUID();
    const newLocation = {
      id,
      name: data.name,
      address: data.address,
      tutorBays: [],
    };

    await setDoc(doc(db, "locations", id), newLocation);

    setLocations((prev) => [...prev, newLocation]);
    locationForm.reset();
    setShowAddLocationForm(false);
  };

  const updateLocation = async (data) => {
    if (!editingLocation) return;

    const updated = {
      ...editingLocation,
      name: data.name,
      address: data.address,
    };

    await setDoc(doc(db, "locations", editingLocation.id), updated);

    setLocations((prev) =>
      prev.map((loc) => (loc.id === editingLocation.id ? updated : loc))
    );

    setEditingLocation(null);
    locationForm.reset();
  };

  const deleteLocation = async (id) => {
    await deleteDoc(doc(db, "locations", id));
    setLocations((prev) => prev.filter((loc) => loc.id !== id));
  };

  const startEditingLocation = (location) => {
    setEditingLocation(location);
    locationForm.setValue("name", location.name);
    locationForm.setValue("address", location.address);
  };

  const cancelEditingLocation = () => {
    setEditingLocation(null);
    locationForm.reset();
  };

  const addTutorBay = async (locationId, data) => {
    const newBay = { id: crypto.randomUUID(), name: data.name };

    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === locationId
          ? { ...loc, tutorBays: [...loc.tutorBays, newBay] }
          : loc
      )
    );

    const locationDoc = doc(db, "locations", locationId);
    const locationSnap = await getDoc(locationDoc);
    if (locationSnap.exists()) {
      const updatedTutorBays = [...locationSnap.data().tutorBays, newBay];
      await updateDoc(locationDoc, { tutorBays: updatedTutorBays });
    }

    bayForm.reset();
    setShowAddBayForm(null);
  };

  const updateTutorBay = async (locationId, data) => {
    if (!editingBay.bay) return;

    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === locationId
          ? {
              ...loc,
              tutorBays: loc.tutorBays.map((bay) =>
                bay.id === editingBay.bay.id ? { ...bay, name: data.name } : bay
              ),
            }
          : loc
      )
    );

    const locationDoc = doc(db, "locations", locationId);
    const locationSnap = await getDoc(locationDoc);
    if (locationSnap.exists()) {
      const updatedTutorBays = locationSnap
        .data()
        .tutorBays.map((bay) =>
          bay.id === editingBay.bay.id ? { ...bay, name: data.name } : bay
        );
      await updateDoc(locationDoc, { tutorBays: updatedTutorBays });
    }

    setEditingBay({ locationId: "", bay: null });
    bayForm.reset();
  };

  const deleteTutorBay = async (locationId, bayId) => {
    setLocations((prev) =>
      prev.map((loc) =>
        loc.id === locationId
          ? {
              ...loc,
              tutorBays: loc.tutorBays.filter((bay) => bay.id !== bayId),
            }
          : loc
      )
    );

    const locationDoc = doc(db, "locations", locationId);
    const locationSnap = await getDoc(locationDoc);
    if (locationSnap.exists()) {
      const updatedTutorBays = locationSnap
        .data()
        .tutorBays.filter((bay) => bay.id !== bayId);
      await updateDoc(locationDoc, { tutorBays: updatedTutorBays });
    }
  };

  const startEditingBay = (locationId, bay) => {
    setEditingBay({ locationId, bay });
    bayForm.setValue("name", bay.name);
  };

  const cancelEditingBay = () => {
    setEditingBay({ locationId: "", bay: null });
    bayForm.reset();
  };

  return (
    <Box p={4}>
      <Box
        sx={{
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Header
            title="LOCATIONS & TUTOR BAYS"
            subtitle="Manage locations and tutor bays"
          />
          <Button
            variant="contained"
            onClick={() => setShowAddLocationForm(true)}
          >
            Add Location
          </Button>
        </Box>

        {/* Add Location Form */}
        {showAddLocationForm && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Add New Location
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Enter details for the new location
            </Typography>
            <form onSubmit={locationForm.handleSubmit(addLocation)}>
              <Grid container spacing={2} sx={{ paddingTop: "10px" }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Location Name"
                    {...locationForm.register("name")}
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <TextField
                    fullWidth
                    label="Address"
                    {...locationForm.register("address")}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                <Button type="submit" variant="contained">
                  Add
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => {
                    setShowAddLocationForm(false);
                    locationForm.reset();
                  }}
                >
                  Cancel
                </Button>
              </Box>
            </form>
          </Paper>
        )}

        {/* Location Cards */}
        {locations.map((location) => (
          <Paper key={location.id} elevation={2} sx={{ p: 3 }}>
            {editingLocation?.id === location.id ? (
              <form onSubmit={locationForm.handleSubmit(updateLocation)}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Location Name"
                      {...locationForm.register("name")}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      fullWidth
                      label="Address"
                      {...locationForm.register("address")}
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                  <Button type="submit" variant="contained" size="small">
                    Update
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={cancelEditingLocation}
                    size="small"
                  >
                    Cancel
                  </Button>
                </Box>
              </form>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <LocationOnIcon fontSize="medium" />
                    <Typography variant="h4">{location.name}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {location.address}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton onClick={() => startEditingLocation(location)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    onClick={() => setLocationToDelete(location)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Tutor Bays Section */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h5">Tutor Bays</Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setShowAddBayForm(location.id)}
                  >
                    Add Bay
                  </Button>
                </Box>

                {showAddBayForm === location.id && (
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <form
                      onSubmit={bayForm.handleSubmit((data) =>
                        addTutorBay(location.id, data)
                      )}
                    >
                      <TextField
                        fullWidth
                        label="Bay Name"
                        sx={{ mb: 2 }}
                        {...bayForm.register("name")}
                      />
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Button type="submit" variant="contained" size="small">
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => {
                            setShowAddBayForm(null);
                            bayForm.reset();
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </form>
                  </Paper>
                )}

                {location.tutorBays.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No tutor bays added yet
                  </Typography>
                ) : (
                  location.tutorBays.map((bay) => (
                    <Paper key={bay.id} variant="outlined" sx={{ p: 1, mb: 1 }}>
                      {editingBay.bay?.id === bay.id &&
                      editingBay.locationId === location.id ? (
                        <form
                          onSubmit={bayForm.handleSubmit((data) =>
                            updateTutorBay(location.id, data)
                          )}
                        >
                          <TextField
                            fullWidth
                            label="Bay Name"
                            sx={{ mb: 1 }}
                            {...bayForm.register("name")}
                          />
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              type="submit"
                              size="small"
                              variant="contained"
                            >
                              <CheckIcon fontSize="small" />
                            </Button>
                            <Button
                              onClick={cancelEditingBay}
                              size="small"
                              color="error"
                              variant="outlined"
                            >
                              <CloseIcon fontSize="small" />
                            </Button>
                          </Box>
                        </form>
                      ) : (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              flex: 1,
                              minWidth: 0,
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <Chip label={bay.name} sx={{ maxWidth: "100%" }} />
                          </Box>
                          <Box
                            sx={{
                              display: "flex",
                              ml: 1,
                              gap: 1,
                              flexShrink: 0,
                            }}
                          >
                            <IconButton
                              onClick={() => startEditingBay(location.id, bay)}
                              size="small"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              onClick={() =>
                                deleteTutorBay(location.id, bay.id)
                              }
                              size="small"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      )}
                    </Paper>
                  ))
                )}
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <Box sx={{ height: "256px" }}>
                  <GoogleMap
                    address={location.address}
                    color={colors.orangeAccent[700]}
                  />
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}

        {locations.length === 0 && (
          <Paper elevation={2} sx={{ textAlign: "center", py: 6 }}>
            <LocationOnIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              No locations added yet
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Start by adding your first location
            </Typography>
            <Button
              variant="contained"
              onClick={() => setShowAddLocationForm(true)}
            >
              Add Your First Location
            </Button>
          </Paper>
        )}
      </Box>

      {/* Dialog Box */}
      <Dialog
        open={Boolean(locationToDelete)}
        onClose={() => setLocationToDelete(null)}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will delete the location{" "}
            <strong>{locationToDelete?.name}</strong>. This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="text"
            color="error"
            onClick={() => setLocationToDelete(null)}
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              deleteLocation(locationToDelete.id);
              setLocationToDelete(null);
            }}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TutoringBayList;
