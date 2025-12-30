import { Box, Button, CircularProgress, Container, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from '@mui/material';
import './App.css'
import { useState } from 'react'
import axios from 'axios';

function App() {

  const [emailContent, setEmailContent] = useState('');
  const [tone, setTone] = useState('');
  const [generatedReply, setGeneratedReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("http://localhost:8080/api/email/generate",{
        emailContent,
        tone
      });
      setGeneratedReply(typeof response.data === "string" ? response.data : JSON.stringify(response.data));
    } catch (error) {
      setError("Failed to generate reply: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Email Reply Writer
      </Typography>

      <Box sx={{ mx: 4 }}>
        <TextField
          label="Email Content"
          multiline
          rows={6}
          variant="outlined"
          fullWidth
          value={emailContent || ''}
          onChange={(e) => setEmailContent(e.target.value)}
          sx={{ mb: 2 }}
        />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>
            Tone (Optional)
          </InputLabel>
          <Select
            value={tone || ''}
            onChange={(e) => setTone(e.target.value)}
            displayEmpty
          >
            <MenuItem value="none"><em>None</em></MenuItem>
            <MenuItem value="formal">Formal</MenuItem>
            <MenuItem value="casual">Casual</MenuItem>
            <MenuItem value="friendly">Friendly</MenuItem>
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!emailContent || loading}>
          {loading ? <CircularProgress size={24} /> : 'Generate Reply'}
        </Button>
      </Box>

      {error && (<Typography color="error" sx={{ mb: 2 }}>{error}</Typography>)}

      {generatedReply && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Generated Reply:
          </Typography>
          <TextField
            value={generatedReply || ''}
            multiline
            rows={6}
            variant="outlined"
            fullWidth
            InputProps={{
              readOnly: true,
            }}
          />

          {/* default method to copy contents to clipboard */}
          <Button variant="contained" color="secondary" sx={{ mt: 2 }} onClick={() => navigator.clipboard.writeText(generatedReply)}>
            Copy to Clipboard
          </Button> 
        </Box>
      )}
    </Container>
  )
}

export default App
