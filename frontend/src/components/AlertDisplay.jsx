import React from "react";
import { Alert, AlertTitle, Stack } from "@mui/material";

const alertDisplay = ({ type = "success", title, message, color }) => {
  if (!message) return null;

  return (
    <Stack sx={{ width: "100%" }} spacing={2} className="mb-4">
      <Alert severity={type} sx={color ? { backgroundColor: color } : {}}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
    </Stack>
  );
};

export default alertDisplay;
