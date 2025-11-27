import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useState, useEffect } from "react";

const EditInvoiceDialog = ({ open, invoice, onClose, onSave }) => {
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (invoice) {
      console.log("Invoice: ", invoice);
      setForm({
        total: invoice.total,
        lineItems: invoice.lineItems.map((li) => ({ ...li })),
      });
    }
  }, [invoice]);

  if (!form) return null;

  const handleSave = () => {
    onSave({
      ...invoice,
      ...form,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Edit Invoice</DialogTitle>
      <DialogContent dividers></DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditInvoiceDialog;
