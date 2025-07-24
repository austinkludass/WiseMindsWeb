import React, { useEffect, useState } from "react";
import { FixedSizeList as List } from "react-window";
import { VirtualizedAutoComplete } from "../../components/Global/VirtualizedAutoComplete";
import {
  Box,
  Tabs,
  Tab,
  Card,
  Typography,
  TextField,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
  Autocomplete,
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  CollectionsBookmark as GroupIcon,
  LibraryBooks as BookIcon,
} from "@mui/icons-material";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../data/firebase";
import "./SubjectList.css"; // create this CSS file for custom styles
import Header from "../../components/Global/Header";

const SubjectList = () => {
  const [tab, setTab] = useState(0);
  const [curriculums, setCurriculums] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);
  const [subjectInput, setSubjectInput] = useState({});
  const [groupSubjectSelect, setGroupSubjectSelect] = useState({});
  const [newCurriculum, setNewCurriculum] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [editCurriculumId, setEditCurriculumId] = useState(null);
  const [editGroupId, setEditGroupId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteType, setDeleteType] = useState("");
  const [showSubjectsMap, setShowSubjectsMap] = useState({});

  const fetchData = async () => {
    const [curSnap, subSnap, grpSnap] = await Promise.all([
      getDocs(collection(db, "curriculums")),
      getDocs(collection(db, "subjects")),
      getDocs(collection(db, "subjectGroups")),
    ]);
    setCurriculums(curSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setSubjects(subSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setGroups(grpSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleShowSubjects = (curriculumId) => {
    setShowSubjectsMap((prev) => ({
      ...prev,
      [curriculumId]: !prev[curriculumId],
    }));
  };

  const handleTabChange = (_, val) => setTab(val);

  const handleAddCurriculum = async () => {
    if (!newCurriculum.trim()) return;
    const docRef = await addDoc(collection(db, "curriculums"), {
      name: newCurriculum,
    });
    setCurriculums((prev) => [...prev, { id: docRef.id, name: newCurriculum }]);
    setNewCurriculum("");
  };

  const handleDeleteCurriculum = async (curriculumId) => {
    const toDelete = subjects.filter((s) => s.curriculumId === curriculumId);

    for (let s of toDelete) {
      await deleteDoc(doc(db, "subjects", s.id));
    }

    await deleteDoc(doc(db, "curriculums", curriculumId));

    setSubjects((prev) => prev.filter((s) => s.curriculumId !== curriculumId));
    setCurriculums((prev) => prev.filter((c) => c.id !== curriculumId));
  };

  const handleAddSubject = async (curriculumId) => {
    const name = subjectInput[curriculumId];
    if (!name) return;

    const docRef = await addDoc(collection(db, "subjects"), {
      name,
      curriculumId,
    });

    setSubjects((prev) => [...prev, { id: docRef.id, name, curriculumId }]);

    setSubjectInput((prev) => ({ ...prev, [curriculumId]: "" }));
  };

  const handleDeleteSubject = async (subjectId) => {
    await deleteDoc(doc(db, "subjects", subjectId));
    setSubjects((prev) => prev.filter((s) => s.id !== subjectId));
  };

  const handleAddGroup = async () => {
    if (!newGroup.trim()) return;

    const docRef = await addDoc(collection(db, "subjectGroups"), {
      name: newGroup,
      subjectIds: [],
    });

    setGroups((prev) => [
      ...prev,
      { id: docRef.id, name: newGroup, subjectIds: [] },
    ]);
    setNewGroup("");
  };

  const handleDeleteGroup = async (groupId) => {
    await deleteDoc(doc(db, "subjectGroups", groupId));
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleAddSubjectToGroup = async (groupId) => {
    const subjectId = groupSubjectSelect[groupId];
    if (!subjectId) return;

    const group = groups.find((g) => g.id === groupId);
    const updated = [...new Set([...(group.subjectIds || []), subjectId])];

    await updateDoc(doc(db, "subjectGroups", groupId), {
      subjectIds: updated,
    });

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, subjectIds: updated } : g))
    );
  };

  const handleRemoveSubjectFromGroup = async (groupId, subjectId) => {
    const group = groups.find((g) => g.id === groupId);
    const updated = group.subjectIds.filter((id) => id !== subjectId);

    await updateDoc(doc(db, "subjectGroups", groupId), {
      subjectIds: updated,
    });

    setGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, subjectIds: updated } : g))
    );
  };

  const startEdit = (id, type, name) => {
    setEditedName(name);
    if (type === "curriculum") setEditCurriculumId(id);
    if (type === "group") setEditGroupId(id);
  };

  const saveEdit = async (id, type) => {
    const ref = doc(
      db,
      type === "curriculum" ? "curriculums" : "subjectGroups",
      id
    );
    await updateDoc(ref, { name: editedName });

    if (type === "curriculum") {
      setCurriculums((prev) =>
        prev.map((c) => (c.id === id ? { ...c, name: editedName } : c))
      );
      setEditCurriculumId(null);
    }

    if (type === "group") {
      setGroups((prev) =>
        prev.map((g) => (g.id === id ? { ...g, name: editedName } : g))
      );
      setEditGroupId(null);
    }

    setEditedName("");
  };

  const openDeleteDialog = (type, item) => {
    setDeleteType(type);
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteType === "curriculum")
      await handleDeleteCurriculum(deleteTarget.id);
    if (deleteType === "group") await handleDeleteGroup(deleteTarget.id);
    setDeleteTarget(null);
    setDeleteType("");
  };

  return (
    <Box p={4}>
      <Header
        title="SUBJECTS"
        subtitle="Manage subjects, groups and curricula"
      />

      <Tabs value={tab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Curriculums" />
        <Tab label="Subject Groups" />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Card className="create-card">
            <TextField
              label="Enter curriculum name..."
              value={newCurriculum}
              onChange={(e) => setNewCurriculum(e.target.value)}
              fullWidth
              sx={{ mr: 2 }}
            />
            <Button variant="contained" onClick={handleAddCurriculum}>
              Add Curriculum
            </Button>
          </Card>

          <Box display="flex" flexWrap="wrap" gap={2} mt={2}>
            {curriculums.map((cur) => (
              <Card key={cur.id} className="curriculum-card">
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <BookIcon />
                    {editCurriculumId === cur.id ? (
                      <TextField
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                    ) : (
                      <Typography variant="h6">{cur.name}</Typography>
                    )}
                    <Chip
                      label={`${
                        subjects.filter((s) => s.curriculumId === cur.id).length
                      } subjects`}
                    />
                  </Box>
                  <Box>
                    {editCurriculumId === cur.id ? (
                      <IconButton
                        onClick={() => saveEdit(cur.id, "curriculum")}
                      >
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() =>
                          startEdit(cur.id, "curriculum", cur.name)
                        }
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton
                      onClick={() => openDeleteDialog("curriculum", cur)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Stack direction="row" mt={2}>
                  <TextField
                    fullWidth
                    placeholder="Add new subject..."
                    value={subjectInput[cur.id] || ""}
                    onChange={(e) =>
                      setSubjectInput((prev) => ({
                        ...prev,
                        [cur.id]: e.target.value,
                      }))
                    }
                  />
                  <Button onClick={() => handleAddSubject(cur.id)}>Add</Button>
                </Stack>

                <Button size="small" onClick={() => toggleShowSubjects(cur.id)}>
                  {showSubjectsMap[cur.id] ? "Hide Subjects" : "Show Subjects"}
                </Button>

                {showSubjectsMap[cur.id] && (
                  <List
                    height={400} // Set to your desired height
                    itemCount={
                      subjects.filter((s) => s.curriculumId === cur.id).length
                    }
                    itemSize={50} // Height of each item in px
                    width="100%"
                  >
                    {({ index, style }) => {
                      const filtered = subjects
                        .filter((s) => s.curriculumId === cur.id)
                        .sort((a, b) => a.name.localeCompare(b.name));
                      const subject = filtered[index];

                      return (
                        <Box
                          key={subject.id}
                          className="subject-item"
                          style={style}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          px={2}
                        >
                          <Typography>{subject.name}</Typography>
                          <IconButton
                            onClick={() => handleDeleteSubject(subject.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      );
                    }}
                  </List>
                )}
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {tab === 1 && (
        <Box>
          <Card className="create-card">
            <TextField
              label="Enter group name..."
              value={newGroup}
              onChange={(e) => setNewGroup(e.target.value)}
              fullWidth
              sx={{ mr: 2 }}
            />
            <Button variant="contained" onClick={handleAddGroup}>
              Add Group
            </Button>
          </Card>

          <Stack spacing={2} mt={2}>
            {groups.map((g) => (
              <Card key={g.id} className="group-card">
                <Box display="flex" justifyContent="space-between">
                  <Box display="flex" alignItems="center" gap={1}>
                    <GroupIcon />
                    {editGroupId === g.id ? (
                      <TextField
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                      />
                    ) : (
                      <Typography variant="h6">{g.name}</Typography>
                    )}
                    <Chip
                      label={`${g.subjectIds.length} subjects`}
                      color="success"
                    />
                  </Box>
                  <Box>
                    {editGroupId === g.id ? (
                      <IconButton onClick={() => saveEdit(g.id, "group")}>
                        <SaveIcon />
                      </IconButton>
                    ) : (
                      <IconButton
                        onClick={() => startEdit(g.id, "group", g.name)}
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    <IconButton onClick={() => openDeleteDialog("group", g)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Stack direction="row" mt={2} spacing={2}>
                  <Autocomplete
                    fullWidth
                    disableListWrap
                    value={
                      subjects.find((s) => s.id === groupSubjectSelect[g.id]) ||
                      null
                    }
                    options={subjects
                      .filter((s) => !g.subjectIds.includes(s.id))
                      .sort((a, b) => a.name.localeCompare(b.name))}
                    getOptionLabel={(option) =>
                      `${option.name} (${
                        curriculums.find((c) => c.id === option.curriculumId)
                          ?.name || "Unknown"
                      })`
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select subject..."
                        variant="outlined"
                      />
                    )}
                    onChange={(_, value) => {
                      setGroupSubjectSelect((prev) => ({
                        ...prev,
                        [g.id]: value?.id || "",
                      }));
                    }}
                    isOptionEqualToValue={(option, value) =>
                      option.id === value.id
                    }
                    slotProps={{
                      listbox: {
                        component: VirtualizedAutoComplete,
                      },
                    }}
                  />
                  <Button
                    disabled={!groupSubjectSelect[g.id]}
                    onClick={() => {
                      handleAddSubjectToGroup(g.id);
                      setGroupSubjectSelect((prev) => ({
                        ...prev,
                        [g.id]: "",
                      }));
                    }}
                  >
                    Add
                  </Button>
                </Stack>

                <Box mt={1}>
                  {g.subjectIds.map((id) => {
                    const sub = subjects.find((s) => s.id === id);
                    const cur = curriculums.find(
                      (c) => c.id === sub?.curriculumId
                    );
                    return (
                      <Box className="subject-item" key={id}>
                        <Typography>
                          {sub?.name} <Chip size="small" label={cur?.name} />
                        </Typography>
                        <IconButton
                          onClick={() => handleRemoveSubjectFromGroup(g.id, id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    );
                  })}
                </Box>
              </Card>
            ))}
          </Stack>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          This will permanently delete <strong>{deleteTarget?.name}</strong>
          {deleteType === "curriculum" && " and all its subjects."}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SubjectList;
