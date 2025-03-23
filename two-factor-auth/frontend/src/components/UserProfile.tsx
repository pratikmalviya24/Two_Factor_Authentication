import React, { useState, useEffect } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, IconButton, AppBar, Toolbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, Switch, Fade, Grow, Avatar, useTheme, alpha, Snackbar, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { ArrowBack, Security, DeleteForever, Person, Shield, VpnKey, CheckCircle } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useApiError } from '../hooks/useApiError';
import apiService from '../services/api';
import { getTfaSettings, updateTfaSettings } from '../services/profileService';

const UserProfile = () => {
  const { user, logout, setUser } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { error, loading, setError } = useApiError();
  const navigate = useNavigate();
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [tfaLoading, setTfaLoading] = useState(true);
  const theme = useTheme();
  const [passwordResetRequested, setPasswordResetRequested] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await getTfaSettings();
        setTfaEnabled(settings.enabled);
      } catch (error) {
        setError('Failed to load 2FA settings');
      } finally {
        setTfaLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user, setError]);

  const handleTfaToggle = async () => {
    setTfaLoading(true);
    try {
      const updatedSettings = await updateTfaSettings(!tfaEnabled);
      setTfaEnabled(updatedSettings.enabled);
      // Update user context
      if (user) {
          setUser({
          ...user,
          tfaEnabled: updatedSettings.enabled
        });
      }
    } catch (error) {
      setError('Failed to update 2FA settings');
    } finally {
      setTfaLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const handlePasswordReset = async () => {
    try {
      const response = await apiService.initiatePasswordReset();
      setAlertMessage("Password reset email has been sent to your registered email address. Please check your inbox and follow the instructions to reset your password.");
      setAlertSeverity('success');
      setAlertOpen(true);
      setPasswordResetRequested(true);
    } catch (error) {
      if (error instanceof Error) {
        setAlertMessage(error.message);
        setAlertSeverity('error');
        setAlertOpen(true);
      } else {
        setAlertMessage('Failed to initiate password reset');
        setAlertSeverity('error');
        setAlertOpen(true);
      }
    }
  };

  const handleAlertClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway' && alertSeverity === 'success' && passwordResetRequested) {
      // Don't close success alerts on clickaway for password reset
      return;
    }
    setAlertOpen(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container component="main" maxWidth="xs">
        <Typography color="error" variant="body1">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!user) {
    return null;
  }

  // Generate avatar initials from username
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Fade in={true} timeout={800}>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(145deg, #f0f4ff 0%, #f5f5f5 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <Box sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(121,134,203,0.2) 0%, rgba(121,134,203,0) 70%)',
          top: '-120px',
          right: '-100px',
          zIndex: 0
        }} />
        
        <Box sx={{
          position: 'absolute',
          width: '250px',
          height: '250px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(63,81,181,0.15) 0%, rgba(63,81,181,0) 70%)',
          bottom: '50px',
          left: '-100px',
          zIndex: 0
        }} />
        
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            mb: 0,
            position: 'relative',
            overflow: 'hidden',
            height: 'auto',
            borderRadius: '0 0 20px 20px'
          }}
        >
          {/* Simplified header decorative element */}
          <Box 
            sx={{ 
              position: 'absolute', 
              top: -100, 
              right: -50, 
              width: 300, 
              height: 300, 
              borderRadius: '50%', 
              background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)', 
            }} 
          />
          
          <Toolbar sx={{ px: 3, py: 2, display: 'flex', alignItems: 'center' }}>
            <Fade in={true} timeout={600} style={{ transitionDelay: '200ms' }}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleBack}
                aria-label="back to dashboard"
                sx={{ 
                  mr: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <ArrowBack />
              </IconButton>
            </Fade>
            <Fade in={true} timeout={800} style={{ transitionDelay: '400ms' }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  flexGrow: 1, 
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                }}
              >
                User Profile
              </Typography>
            </Fade>
          </Toolbar>
        </AppBar>

        {/* Avatar section moved outside of AppBar */}
        <Box 
          sx={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: -3,
            mb: 3,
            position: 'relative',
            zIndex: 2
          }}
        >
          <Grow in={true} timeout={1200} style={{ transformOrigin: '50% 0%' }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                bgcolor: '#3949ab',
                fontSize: '1.8rem',
                boxShadow: '0 6px 15px rgba(0,0,0,0.2)',
                border: '4px solid white',
                mb: 2
              }}
            >
              {getInitials(user.username)}
            </Avatar>
          </Grow>
          <Fade in={true} timeout={1400} style={{ transitionDelay: '600ms' }}>
            <Typography 
              variant="h5" 
              fontWeight="500" 
              align="center"
              gutterBottom
              sx={{
                background: 'linear-gradient(90deg, #3f51b5, #7986cb)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                MozBackgroundClip: 'text',
                MozTextFillColor: 'transparent',
                msBackgroundClip: 'text',
                color: 'transparent'
              }}
            >
              {user.username}
            </Typography>
          </Fade>
          <Fade in={true} timeout={1600} style={{ transitionDelay: '800ms' }}>
            <Typography variant="body1" color="text.secondary" align="center">
              {user.email}
            </Typography>
          </Fade>
        </Box>

        <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1, mb: 6 }}>
          <Grow in={true} timeout={1000} style={{ transformOrigin: '50% 0%' }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 4,
                borderRadius: 3,
                boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease-in-out',
                background: 'rgba(255,255,255,0.9)',
                backdropFilter: 'blur(10px)',
                '&:hover': {
                  boxShadow: '0 12px 48px rgba(0,0,0,0.12)',
                  transform: 'translateY(-5px)'
                }
              }}
            >
              <Fade in={true} timeout={1800} style={{ transitionDelay: '1000ms' }}>
                <Box sx={{ 
                  mt: 4,
                  p: 3,
                  borderRadius: 3,
                  background: 'linear-gradient(145deg, #ffffff, #f0f0f0)',
                  boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.06)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
                  }
                }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 3,
                  }}>
                    <Box 
                      sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        width: 42,
                        height: 42,
                        background: 'linear-gradient(135deg, #3f51b5, #7986cb)',
                        boxShadow: '0 3px 8px rgba(63, 81, 181, 0.3)',
                        mr: 2
                      }}
                    >
                      <Shield fontSize="small" sx={{ color: 'white' }} />
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        background: 'linear-gradient(90deg, #3f51b5, #7986cb)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        MozBackgroundClip: 'text',
                        MozTextFillColor: 'transparent',
                        msBackgroundClip: 'text',
                        color: 'transparent'
                      }}
                    >
                      Security Settings
                    </Typography>
                  </Box>

                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      p: 2,
                      mt: 2,
                      borderRadius: 2,
                      background: passwordResetRequested ? 'rgba(76, 175, 80, 0.08)' : '#ffffff',
                      border: passwordResetRequested ? '1px solid rgba(76, 175, 80, 0.2)' : 'none',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600" sx={{ 
                        color: passwordResetRequested ? '#2e7d32' : 'inherit'
                      }}>
                        Change Password
                      </Typography>
                      <Typography variant="body2" color={passwordResetRequested ? 'success.main' : 'text.secondary'}>
                        {passwordResetRequested 
                          ? 'Check your email for password reset instructions' 
                          : 'Update your account password'}
                      </Typography>
                    </Box>
                    
                    <Button
                      variant={passwordResetRequested ? "contained" : "outlined"}
                      startIcon={passwordResetRequested ? <CheckCircle /> : <VpnKey />}
                      onClick={handlePasswordReset}
                      disabled={passwordResetRequested}
                      color={passwordResetRequested ? "success" : "primary"}
                      sx={{
                        borderRadius: 28,
                        px: 2,
                        py: 1,
                        textTransform: 'none',
                        ...(passwordResetRequested 
                          ? {
                              boxShadow: '0 2px 8px rgba(46, 125, 50, 0.3)',
                            }
                          : {
                              borderColor: '#3f51b5',
                              color: '#3f51b5',
                              '&:hover': {
                                backgroundColor: alpha('#3f51b5', 0.04),
                                borderColor: '#3f51b5',
                              }
                            })
                      }}
                    >
                      {passwordResetRequested ? 'Email Sent' : 'Change Password'}
                    </Button>
                  </Box>

                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      p: 2,
                      borderRadius: 2,
                      background: '#ffffff',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                        transform: 'translateY(-2px)'
                      }
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle1" fontWeight="600">
                        Two-Factor Authentication
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Add an extra layer of security to your account
                      </Typography>
                    </Box>
                    
                    {tfaLoading ? (
                      <CircularProgress size={24} sx={{ color: '#3f51b5' }} />
                    ) : (
                      <Switch
                        checked={tfaEnabled}
                        onChange={handleTfaToggle}
                        inputProps={{ 'aria-label': 'toggle two-factor authentication' }}
                        color="primary"
                        sx={{
                          '& .MuiSwitch-switchBase.Mui-checked': {
                            color: '#3f51b5',
                            '&:hover': {
                              backgroundColor: alpha('#3f51b5', 0.1),
                            },
                          },
                          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                            backgroundColor: '#3f51b5',
                          },
                        }}
                      />
                    )}
                  </Box>
                  
                  <Fade in={tfaEnabled} timeout={500}>
                    <Box sx={{ 
                      mt: 2, 
                      p: 3, 
                      borderRadius: 2,
                      background: 'linear-gradient(145deg, rgba(63, 81, 181, 0.08), rgba(63, 81, 181, 0.04))',
                      border: '1px solid rgba(63, 81, 181, 0.12)',
                      boxShadow: '0 2px 10px rgba(63, 81, 181, 0.1)',
                      display: tfaEnabled ? 'block' : 'none',
                      animation: tfaEnabled ? 'slideDown 0.5s forwards' : 'none',
                      '@keyframes slideDown': {
                        '0%': { opacity: 0, transform: 'translateY(-10px)' },
                        '100%': { opacity: 1, transform: 'translateY(0)' }
                      }
                    }}>
                      <Typography variant="body2" sx={{ color: '#3f51b5', fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                        <Security fontSize="small" sx={{ mr: 1 }} />
                        Two-Factor Authentication is enabled. You will be required to enter a verification code when signing in.
                      </Typography>
                    </Box>
                  </Fade>
                </Box>
              </Fade>

              <Fade in={true} timeout={2000} style={{ transitionDelay: '1200ms' }}>
                <Box sx={{ mt: 5, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    startIcon={<DeleteForever />}
                    sx={{ 
                      borderRadius: 28,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 600,
                      boxShadow: '0 4px 12px rgba(211, 47, 47, 0.3)',
                      background: 'linear-gradient(45deg, #d32f2f 30%, #f44336 90%)',
                      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 8px 20px rgba(211, 47, 47, 0.4)'
                      },
                      '&:active': {
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(211, 47, 47, 0.4)'
                      }
                    }}
                  >
                    Delete Account
                  </Button>
                </Box>
              </Fade>
            </Paper>
          </Grow>
        </Container>

        {/* Delete Account Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          TransitionComponent={Fade}
          transitionDuration={400}
          PaperProps={{
            sx: {
              borderRadius: 3,
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }
          }}
        >
          <DialogTitle sx={{ 
            pb: 1, 
            pt: 3,
            fontWeight: 600,
            color: '#d32f2f'
          }}>
            Delete Account
          </DialogTitle>
          <DialogContent>
            <Typography sx={{ opacity: 0.8 }}>
              Are you sure you want to delete your account? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
              }}
            >
              Cancel
            </Button>
            <Button 
              variant="contained"
              color="error"
              onClick={async () => {
                try {
                  await apiService.deleteAccount();
                  logout();
                } catch (error) {
                  if (error instanceof Error) {
                    setError(error.message);
                  } else {
                    setError('Failed to delete account');
                  }
                  setDeleteDialogOpen(false);
                }
              }}
              sx={{ 
                px: 3,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 6px 14px rgba(211, 47, 47, 0.3)'
                }
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add a Snackbar for showing alerts */}
        <Snackbar 
          open={alertOpen} 
          autoHideDuration={passwordResetRequested ? 10000 : 6000} 
          onClose={handleAlertClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          sx={{
            '& .MuiAlert-filledSuccess': {
              fontSize: '1rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
              borderRadius: 2,
              padding: '12px 24px',
              width: '100%',
              maxWidth: '500px'
            }
          }}
        >
          <Alert 
            onClose={handleAlertClose} 
            severity={alertSeverity} 
            variant="filled"
            sx={{ width: '100%' }}
            action={
              passwordResetRequested && alertSeverity === 'success' ? (
                <Button color="inherit" size="small" onClick={() => setAlertOpen(false)}>
                  DISMISS
                </Button>
              ) : undefined
            }
          >
            {alertMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Fade>
  );
};

export default UserProfile;
