import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  CircularProgress, 
  Alert, 
  IconButton,
  InputAdornment,
  Fade
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import apiService from '../services/api';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [username, setUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Extract token from URL query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    
    if (!token) {
      setError('No reset token provided');
      setValidating(false);
      return;
    }

    // Validate the token
    const validateToken = async () => {
      try {
        const response = await apiService.validatePasswordResetToken(token);
        setIsTokenValid(true);
        setUsername(response.data.username);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Invalid or expired token');
        }
        setIsTokenValid(false);
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setLoading(true);
    
    try {
      const params = new URLSearchParams(location.search);
      const token = params.get('token') || '';
      
      await apiService.resetPassword(token, newPassword);
      setSuccess(true);
      
      // Redirect to login page after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to reset password');
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  if (validating) {
    return (
      <Container maxWidth="sm" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        alignItems: 'center',
        py: 5 
      }}>
        <CircularProgress size={60} />
        <Typography variant="h6" mt={3}>
          Validating your reset token...
        </Typography>
      </Container>
    );
  }

  if (!isTokenValid && !validating) {
    return (
      <Container maxWidth="sm" sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center',
        py: 5 
      }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Invalid or expired password reset token'}
          </Alert>
          <Typography variant="body1" gutterBottom>
            The password reset link is invalid or has expired. Please request a new password reset link.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/login')}
            fullWidth
            sx={{ mt: 2 }}
          >
            Back to Login
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      justifyContent: 'center',
      py: 5 
    }}>
      <Fade in={true} timeout={800}>
        <Paper elevation={3} sx={{ 
          p: 4, 
          borderRadius: 3,
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        }}>
          {success ? (
            <Box sx={{ textAlign: 'center' }}>
              <LockReset sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Password Reset Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your password has been updated. You will be redirected to the login page shortly.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                fullWidth
              >
                Go to Login
              </Button>
            </Box>
          ) : (
            <>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography variant="h5" component="h1" gutterBottom fontWeight="600">
                  Reset Your Password
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please enter your new password below
                </Typography>
              </Box>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <TextField
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  label="Confirm New Password"
                  type={showPassword ? "text" : "password"}
                  fullWidth
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={toggleShowPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  sx={{ 
                    mt: 3, 
                    py: 1.5,
                    borderRadius: 2,
                    boxShadow: '0 4px 12px rgba(63, 81, 181, 0.2)',
                    background: 'linear-gradient(45deg, #3f51b5 30%, #5677fc 90%)',
                  }}
                >
                  {loading ? <CircularProgress size={24} /> : "Reset Password"}
                </Button>
              </form>
            </>
          )}
        </Paper>
      </Fade>
    </Container>
  );
};

export default ResetPassword; 