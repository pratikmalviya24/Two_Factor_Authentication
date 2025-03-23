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
  Fade,
  Grow,
  useTheme,
  alpha,
  Avatar
} from '@mui/material';
import { Visibility, VisibilityOff, LockReset, Key, CheckCircle } from '@mui/icons-material';
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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

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

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        py: 5
      }}
    >
      {/* Decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, rgba(0,0,0,0) 70%)`,
          top: '-200px',
          right: '-100px',
          zIndex: 0
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, rgba(0,0,0,0) 70%)`,
          bottom: '-100px',
          left: '-100px',
          zIndex: 0
        }}
      />

      <Fade in={true} timeout={800}>
        <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Grow in={true} timeout={800} style={{ transformOrigin: '50% 0%' }}>
            <Paper 
              elevation={10} 
              sx={{ 
                p: { xs: 3, sm: 4 }, 
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              {validating ? (
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  py: 4
                }}>
                  <CircularProgress size={60} sx={{ mb: 3 }} />
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'medium',
                    color: 'text.secondary'
                  }}>
                    Validating your reset token...
                  </Typography>
                </Box>
              ) : !isTokenValid ? (
                <>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.error.main, 0.1),
                      p: 2,
                      borderRadius: '50%',
                      mb: 3
                    }}
                  >
                    <LockReset sx={{ fontSize: 40, color: theme.palette.error.main }} />
                  </Box>
                
                  <Typography 
                    variant="h5" 
                    textAlign="center" 
                    fontWeight="700" 
                    mb={3}
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Invalid Reset Link
                  </Typography>
                
                  <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                    {error || 'Invalid or expired password reset token'}
                  </Alert>
                
                  <Typography variant="body1" gutterBottom textAlign="center" mb={3}>
                    The password reset link is invalid or has expired. Please request a new password reset link.
                  </Typography>
                
                  <Button
                    variant="contained"
                    onClick={() => navigate('/login')}
                    fullWidth
                    disableElevation
                    sx={{ 
                      mt: 2, 
                      py: 1.5,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontWeight: 'bold',
                      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                      },
                    }}
                  >
                    Back to Login
                  </Button>
                </>
              ) : success ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      justifyContent: 'center',
                      mb: 3 
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                      }}
                    >
                      <CheckCircle sx={{ fontSize: 50 }} />
                    </Avatar>
                  </Box>
                  
                  <Typography 
                    variant="h5" 
                    gutterBottom 
                    fontWeight="700"
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 2
                    }}
                  >
                    Password Reset Successful!
                  </Typography>
                  
                  <Typography variant="body1" paragraph sx={{ maxWidth: '400px', mx: 'auto', mb: 3 }}>
                    Your password has been reset successfully. You will be redirected to the login page in a moment.
                  </Typography>
                  
                  <CircularProgress size={24} thickness={5} sx={{ mt: 2 }} />
                </Box>
              ) : (
                <>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      p: 2,
                      borderRadius: '50%',
                      mb: 3
                    }}
                  >
                    <Key sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  </Box>
                
                  <Typography 
                    variant="h5" 
                    textAlign="center" 
                    fontWeight="700" 
                    sx={{
                      background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      mb: 1
                    }}
                  >
                    Reset Your Password
                  </Typography>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary" 
                    textAlign="center" 
                    sx={{ mb: 4 }}
                  >
                    Please create a new password for your account
                  </Typography>
                
                  {error && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                      {error}
                    </Alert>
                  )}
                
                  <Box component="form" onSubmit={handleSubmit} noValidate>
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      name="newPassword"
                      label="New Password"
                      type={showPassword ? 'text' : 'password'}
                      id="newPassword"
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={toggleShowPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 2,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                    <TextField
                      variant="outlined"
                      margin="normal"
                      required
                      fullWidth
                      name="confirmPassword"
                      label="Confirm Password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={toggleShowConfirmPassword}
                              edge="end"
                            >
                              {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: theme.palette.primary.main,
                          },
                        },
                      }}
                    />
                    
                    <Typography variant="caption" color="text.secondary" display="block" mb={3}>
                      Password must be at least 8 characters long and include a combination of letters, numbers, and special characters.
                    </Typography>
                    
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      disabled={loading}
                      disableElevation
                      sx={{ 
                        mt: 1, 
                        mb: 2, 
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 'bold',
                        boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-3px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.15)',
                        },
                      }}
                    >
                      {loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
                    </Button>
                    
                    <Button
                      fullWidth
                      variant="outlined"
                      color="primary"
                      onClick={() => navigate('/login')}
                      sx={{ 
                        mt: 1,
                        py: 1.5,
                        borderRadius: 3,
                        textTransform: 'none',
                        fontWeight: 'medium',
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </>
              )}
            </Paper>
          </Grow>
        </Container>
      </Fade>
    </Box>
  );
};

export default ResetPassword; 