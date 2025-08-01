import {
  Dialog,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

export default function AddToGroupDialog({
  open,
  onClose,
  subject,
  groups,
  onSelectGroup,
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Select a group to add <strong>{subject?.name}</strong></DialogTitle>
      <List>
        {groups.map((group) => (
          <ListItemButton
            key={group.id}
            onClick={() => onSelectGroup(group.id)}
          >
            <ListItemText primary={group.name} />
          </ListItemButton>
        ))}
      </List>
    </Dialog>
  );
}
