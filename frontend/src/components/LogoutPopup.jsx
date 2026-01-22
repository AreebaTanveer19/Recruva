// import React, { useState } from "react";
// import Button from "@mui/material/Button";
// import Dialog from "@mui/material/Dialog";
// import DialogActions from "@mui/material/DialogActions";
// import DialogContent from "@mui/material/DialogContent";
// import DialogContentText from "@mui/material/DialogContentText";
// import DialogTitle from "@mui/material/DialogTitle";

// const LogoutPopup = ({ onConfirm }) => {
//   const [open, setOpen] = useState(false);

//   const handleOpen = () => setOpen(true);
//   const handleClose = () => setOpen(false);

//   const handleConfirm = () => {
//     onConfirm(); // execute logout
//     handleClose();
//   };

//   return (
//     <>
//       <Button
//         variant="contained"
//         color="error"
//         onClick={handleOpen}
//         fullWidth
//       >
//         Logout
//       </Button>

//       <Dialog open={open} onClose={handleClose}>
//         <DialogTitle>Confirm Logout</DialogTitle>
//         <DialogContent>
//           <DialogContentText>
//             Are you sure you want to logout? You will be redirected to the login page.
//           </DialogContentText>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={handleClose} color="primary">Cancel</Button>
//           <Button onClick={handleConfirm} color="error">Logout</Button>
//         </DialogActions>
//       </Dialog>
//     </>
//   );
// };

// export default LogoutPopup;
import React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const LogoutPopup = ({ open, onConfirm, onCancel }) => {

  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Confirm Logout</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to logout? You will be redirected to the login page.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">Cancel</Button>
        <Button onClick={onConfirm} color="error">Logout</Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutPopup;
