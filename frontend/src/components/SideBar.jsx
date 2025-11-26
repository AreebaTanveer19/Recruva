import React, { useState } from "react";
import { MdLogout } from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const Sidebar = ({
  brandName = "Recruva",
  panelName,
  navItems = [],
  onLogout,
}) => {
  const [openLogout, setOpenLogout] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const location = useLocation();

  const handleOpenLogout = () => setOpenLogout(true);
  const handleCloseLogout = () => setOpenLogout(false);

  const handleConfirmLogout = () => {
    if (onLogout) onLogout();
    handleCloseLogout();
  };

  return (
    <>
      {!openSidebar && (
        <button
          className="md:hidden fixed top-4 left-4 z-40 bg-black text-white p-2 rounded shadow-lg"
          onClick={() => setOpenSidebar(true)}
        >
          <FiMenu size={24} />
        </button>
      )}

      {/* Sidebar */}
      <div
        className={`bg-gradient-to-b from-black to-gray-800 text-white flex flex-col items-start justify-start 
        p-4 md:p-8 shadow-lg min-h-screen overflow-y-auto fixed top-0 left-0 transition-transform duration-300
        ${openSidebar ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:w-[272px] lg:w-72`}
      >
        <button
          onClick={() => setOpenSidebar(false)}
          className="absolute top-6 right-6 md:hidden"
        >
          <FiX size={26} className="text-white" />
        </button>

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
          {navItems.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.name}
                onClick={() => {
                  if (link.onClick) link.onClick(); 
                  setOpenSidebar(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xl transition-colors text-white
                  ${
                    isActive
                      ? "bg-gray-700  shadow-sm"
                      : "text-gray-400 hover:bg-gray-700 "
                  }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </button>
            );
          })}
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

        {/* Logout Modal */}
        <Dialog open={openLogout} onClose={handleCloseLogout}>
          <DialogTitle>Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to logout? You will be redirected to the
              login page.
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
    </>
  );
};

export default Sidebar;
