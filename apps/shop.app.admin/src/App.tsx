import React from 'react';
import { Box, Typography, Container } from '@mui/material';

function App() {
  return (
    <Container>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Shop Admin Portal
        </Typography>
        <Typography variant="body1">
          Welcome to the administrative interface. Full functionality coming soon.
        </Typography>
      </Box>
    </Container>
  );
};

export default App;
