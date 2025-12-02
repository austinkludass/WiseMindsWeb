import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Stack,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import { DatePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";

const EditInvoiceDialog = ({ open, invoice, onClose, onSave }) => {
  const [form, setForm] = useState(null);
  const [editingCell, setEditingCell] = useState(null);

  useEffect(() => {
    if (invoice) {
      setForm({
        familyName: invoice.familyName,
        familyEmail: invoice.parentEmail,
        lineItems: invoice.lineItems.map((li) => ({
          ...li,
          date: li.date ? dayjs(li.date) : null,
        })),
      });
    }
  }, [invoice]);

  if (!form) return null;

  const invoiceTotal = form.lineItems.reduce(
    (sum, li) => sum + Number(li.price || 0),
    0
  );

  const updateLineItem = (index, field, value) => {
    const updated = [...form.lineItems];
    updated[index] = { ...updated[index], [field]: value };
    setForm((f) => ({ ...f, lineItems: updated }));
  };

  const handleSave = () => {
    onSave({
      ...invoice,
      ...form,
      total: invoiceTotal,
      editedSinceGeneration: true,
      lineItems: form.lineItems.map((li) => ({
        ...li,
        date: li.date?.toISOString() ?? null,
      })),
    });
  };

  const renderCell = (rowIndex, field, value) => {
    const isEditing =
      editingCell &&
      editingCell.rowIndex === rowIndex &&
      editingCell.field === field;

    if (field === "date") {
      if (!isEditing) {
        return (
          <Typography
            sx={{ cursor: "pointer" }}
            onClick={() => setEditingCell({ rowIndex, field })}
          >
            {value ? value.format("MMM D, YYYY") : ""}
          </Typography>
        );
      }

      return (
        <DatePicker
          autoFocus
          value={value}
          onChange={(newVal) => updateLineItem(rowIndex, "date", newVal)}
          onClose={() => setEditingCell(null)}
          slotProps={{
            textField: {
              variant: "standard",
              size: "small",
              sx: { width: "120px" },
            },
          }}
        />
      );
    }

    if (field === "duration" && isEditing) {
      return (
        <TextField
          variant="standard"
          size="small"
          autoFocus
          value={value}
          onChange={(e) =>
            updateLineItem(rowIndex, "duration", Number(e.target.value))
          }
          onBlur={() => setEditingCell(null)}
          sx={{ width: 80 }}
          slotProps={{
            htmlInput: {
              type: "number",
              step: 0.5,
              min: 1,
            },
          }}
        />
      );
    }

    if (field === "price" && isEditing) {
      return (
        <TextField
          variant="standard"
          size="small"
          autoFocus
          value={value}
          onChange={(e) =>
            updateLineItem(rowIndex, "price", Number(e.target.value))
          }
          onBlur={() => setEditingCell(null)}
          sx={{ width: 50 }}
          slotProps={{
            htmlInput: {
              type: "number",
              step: 0.5,
              min: 0,
            },
          }}
        />
      );
    }

    if (isEditing) {
      return (
        <TextField
          autoFocus
          variant="standard"
          size="small"
          value={value}
          onChange={(e) => updateLineItem(rowIndex, field, e.target.value)}
          onBlur={() => setEditingCell(null)}
        />
      );
    }

    return (
      <Typography
        sx={{ cursor: "pointer" }}
        onClick={() => setEditingCell({ rowIndex, field })}
      >
        {value}
      </Typography>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Invoice</DialogTitle>

      <DialogContent dividers>
        <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">
              Family Name
            </Typography>
            <Typography variant="h4">{form.familyName}</Typography>
          </Box>

          <Box flex={1}>
            <Typography variant="caption" color="text.secondary">
              Email
            </Typography>
            <Typography variant="h4">{form.familyEmail}</Typography>
          </Box>
        </Stack>

        <Typography variant="caption">Total Amount</Typography>
        <Typography variant="h3" color="primary" sx={{ mb: 2 }}>
          ${invoiceTotal.toFixed(2)}
        </Typography>

        <Paper variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Student</TableCell>
                <TableCell>Duration (hrs)</TableCell>
                <TableCell>Tutor</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Subject</TableCell>
                <TableCell>Total ($)</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {form.lineItems.map((li, idx) => (
                <TableRow key={idx} sx={{ height: "50px" }}>
                  <TableCell>{li.studentName}</TableCell>

                  <TableCell>
                    {renderCell(idx, "duration", li.duration)}
                  </TableCell>

                  <TableCell>
                    {renderCell(idx, "tutorName", li.tutorName)}
                  </TableCell>

                  <TableCell>{renderCell(idx, "date", li.date)}</TableCell>

                  <TableCell>
                    {renderCell(idx, "subject", li.subject)}
                  </TableCell>

                  <TableCell>{renderCell(idx, "price", li.price)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInvoiceDialog;
