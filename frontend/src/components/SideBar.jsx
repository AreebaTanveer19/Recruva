import React, { useState } from "react";
import { MdLogout } from "react-icons/md";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const Sidebar = ({ brandName = "Recruva", panelName, navItems = [], onLogout }) => {
  const [openLogout, setOpenLogout] = useState(false);

  const handleOpenLogout = () => setOpenLogout(true);
  const handleCloseLogout = () => setOpenLogout(false);

  const handleConfirmLogout = () => {
    if (onLogout) onLogout();
    handleCloseLogout();
  };

  return (
   <div className="bg-gradient-to-b from-black to-gray-800 text-white flex flex-col items-center justify-start p-8 shadow-lg h-screen overflow-y-auto fixed">
      {/* Branding */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-2">{brandName}</h1>
        <p className="text-xl font-medium mb-1">{panelName}</p>
        <p className="text-gray-300 text-sm">
          Manage your team's tasks and jobs
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col w-full gap-1">
        {navItems.map((item) => (
          <button
            key={item.name}
            onClick={item.onClick}
            className="w-full flex items-center gap-2 px-4 py-2 rounded hover:bg-gray-700 transition-colors"
          >
            {item.icon && <span>{item.icon}</span>}
            <span>{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="mt-auto w-full text-center">
        <button
          onClick={handleOpenLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
        >
          <MdLogout size={20} />
          Logout
        </button>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={openLogout} onClose={handleCloseLogout}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to logout? You will be redirected to the login page.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLogout} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirmLogout} color="primary" autoFocus>
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Sidebar;
