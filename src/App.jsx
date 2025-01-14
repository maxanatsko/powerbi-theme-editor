import React from 'react';
import { Container, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ThemeEditor from './components/ThemeEditor';

const theme = createTheme({
  palette: {
    mode: 'light',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ThemeEditor />
      </Container>
    </ThemeProvider>
  );
}

export default App;