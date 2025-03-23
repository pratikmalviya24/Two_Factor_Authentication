import React, { useState, useEffect, useRef } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, IconButton, AppBar, Toolbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, Switch, Fade, Grow, Avatar, useTheme, alpha, Snackbar, Alert, Card, CardContent, Divider } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, Security, DeleteForever, Person, Shield, VpnKey, CheckCircle, QrCode2 } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useApiError } from '../hooks/useApiError';
import apiService from '../services/api';
import { getTfaSettings, updateTfaSettings } from '../services/profileService';

const UserProfile = () => {
  const { user, logout, setUser } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const { error, loading, setError } = useApiError();
  const navigate = useNavigate();
  const location = useLocation();
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [tfaLoading, setTfaLoading] = useState(true);
  const theme = useTheme();
  const [passwordResetRequested, setPasswordResetRequested] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success');
  const loadingRef = useRef(false);
  const [renderKey, setRenderKey] = useState(Date.now());
  const locationStateProcessedRef = useRef(false);

  useEffect(() => {
    // Only process the location state once to prevent infinite loop
    if (location.state?.message && !locationStateProcessedRef.current) {
      locationStateProcessedRef.current = true;
      setAlertMessage(location.state.message);
      setAlertSeverity(location.state.severity || 'success');
      setAlertOpen(true);
      
      // If we've just enabled TFA, update the local state
      if (location.state.message.includes('enabled successfully')) {
        setTfaEnabled(true);
        setTfaLoading(false);
        
        // Only update user state if user exists and tfaEnabled isn't already true
        if (user && !user.tfaEnabled) {
          setUser({
            ...user,
            tfaEnabled: true
          });
        }
        
        // Skip loading settings from API
        loadingRef.current = true;
      }
      
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
    
    // Load TFA settings if not set from navigation state
    const loadSettings = async () => {
      // Prevent duplicate API calls
      if (loadingRef.current) return;
      
      loadingRef.current = true;
      try {
        const settings = await getTfaSettings();
        setTfaEnabled(settings.enabled);
      } catch (error) {
        setError('Failed to load 2FA settings');
      } finally {
        setTfaLoading(false);
      }
    };

    if (user && !loadingRef.current) {
      loadSettings();
    }
    
    return () => {
      // Reset for next mount
      loadingRef.current = false;
      locationStateProcessedRef.current = false;
    };
  }, [user, setUser, setError, location.state]);

  const handleTfaToggle = async () => {
    console.log("TFA toggle clicked, current state:", tfaEnabled);
    
    // Don't set loading state if we're just navigating to setup page
    if (!tfaEnabled) {
      navigate('/verify-2fa', { 
        state: { 
          username: user.username,
          setupMode: true,
          tfaType: 'APP',
          selectedMethod: 'APP',
          fromProfile: true
        } 
      });
      return;
    }
    
    // Only set loading state when actually performing an API call
    setTfaLoading(true);
    
    try {      
      // Disabling TFA
      console.log("Disabling TFA...");
      const updatedSettings = await updateTfaSettings(false);
      console.log("TFA disable API response:", updatedSettings);
      
      // Update local state first
      setTfaEnabled(false);
      
      // Then update user context once with all changes
      if (user) {
        setUser({
          ...user,
          tfaEnabled: false
        });
      }
      
      // Show success message
      setAlertMessage("Two-factor authentication has been disabled");
      setAlertSeverity('success');
      setAlertOpen(true);
      
      console.log("TFA disabled, new state:", false);
      
      // Force a re-render
      setRenderKey(Date.now());
    } catch (error) {
      console.error("Error updating TFA settings:", error);
      setError('Failed to update 2FA settings');
      setAlertMessage("Failed to disable two-factor authentication");
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      setTfaLoading(false);
    }
  };

  const setupTfa = () => {
    navigate('/verify-2fa', { 
      state: { 
        username: user.username,
        setupMode: true,
        tfaType: 'APP',
        selectedMethod: 'APP',
        reconfigure: true,
        fromProfile: true
      } 
    });
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

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const renderTfaCard = () => {
    const cardStyle = {
      mb: 3,
      borderRadius: 2,
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid',
      borderColor: tfaEnabled ? theme.palette.success.light : alpha(theme.palette.primary.main, 0.2),
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    };

    if (tfaLoading) {
      return (
        <Card sx={cardStyle}>
          <CardContent sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            py: 4,
            flexDirection: 'column', 
            gap: 1.5
          }}>
            <CircularProgress size={28} />
            <Typography variant="body2" color="text.secondary">
              Updating 2FA settings...
            </Typography>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={cardStyle}>
        <Box
          sx={{
            position: 'absolute',
            width: '150px',
            height: '150px',
            borderRadius: '50%',
            background: tfaEnabled
              ? 'radial-gradient(circle, rgba(76,175,80,0.08) 0%, rgba(76,175,80,0) 70%)'
              : 'radial-gradient(circle, rgba(63,81,181,0.08) 0%, rgba(63,81,181,0) 70%)',
            top: '-75px',
            right: '-75px',
            zIndex: 0,
            transition: 'background 0.3s ease-in-out'
          }}
        />
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <Security 
                color={tfaEnabled ? "success" : "action"} 
                sx={{ 
                  mr: 1.5, 
                  fontSize: 28,
                  transition: 'color 0.3s ease-in-out' 
                }} 
              />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Two-Factor Authentication
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {tfaEnabled
              ? "Your account is protected with two-factor authentication. Each time you sign in, you'll need to provide a one-time code from your authenticator app."
              : "Enable two-factor authentication to add an extra layer of security to your account. You'll need an authenticator app on your phone."}
          </Typography>

          {!tfaEnabled && (
            <Button
              startIcon={<QrCode2 />}
              variant="outlined"
              onClick={handleTfaToggle}
              sx={{ 
                mt: 1,
                borderRadius: '8px',
                textTransform: 'none',
                px: 2
              }}
            >
              Enable Two-Factor Authentication
            </Button>
          )}

          {tfaEnabled && (
            <>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                p: 1.5, 
                borderRadius: 1.5, 
                bgcolor: 'success.light', 
                color: 'white',
                mb: 2
              }}>
                <CheckCircle sx={{ mr: 1 }} />
                <Typography variant="body2" fontWeight={500}>
                  Your account is protected with 2FA
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={setupTfa}
                  sx={{ textTransform: 'none', borderRadius: '8px' }}
                >
                  Reconfigure Two-Factor Authentication
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleTfaToggle}
                  sx={{ textTransform: 'none', borderRadius: '8px' }}
                >
                  Disable Two-Factor Authentication
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(145deg, #f0f4ff 0%, #f5f5f5 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
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
            <div>
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
            </div>
            <div>
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
            </div>
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <div>
            <Paper 
              elevation={0}
              sx={{ 
                p: 3, 
                borderRadius: 4,
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.1),
                mb: 3
              }}
            >
              <Box display="flex" alignItems="center" mb={3}>
                <Avatar 
                  sx={{ 
                    width: 80, 
                    height: 80, 
                    bgcolor: theme.palette.primary.main,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    fontSize: '1.8rem',
                    fontWeight: 'bold'
                  }}
                >
                  {getInitials(user.username || '')}
                </Avatar>
                <Box ml={3}>
                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {user.username}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="textSecondary"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5
                    }}
                  >
                    <Person fontSize="small" />
                    {user.email || 'No email provided'}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </div>

          <div>
            <Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: theme.palette.text.primary,
                  fontWeight: 600
                }}
              >
                <Shield fontSize="small" />
                Security Settings
              </Typography>
              
              <div key={`tfa-card-${tfaEnabled}`}>
                {renderTfaCard()}
              </div>
              
              <Card 
                sx={{ 
                  mb: 3, 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.primary.main, 0.2)
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <VpnKey color="primary" sx={{ mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Password Management
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Change your password to keep your account secure. We recommend using a strong, unique password.
                  </Typography>
                  <Button
                    variant="outlined"
                    onClick={handlePasswordReset}
                    disabled={passwordResetRequested}
                    sx={{ 
                      mt: 2,
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}
                  >
                    {passwordResetRequested ? 'Password Reset Email Sent' : 'Reset Password'}
                  </Button>
                </CardContent>
              </Card>
              
              <Card 
                sx={{ 
                  borderRadius: 2,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.error.main, 0.2)
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <DeleteForever color="error" sx={{ mr: 1.5, fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600} color="error.main">
                      Danger Zone
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Once you delete your account, all of your data will be permanently removed. This action cannot be undone.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialogOpen(true)}
                    sx={{ 
                      mt: 2,
                      borderRadius: '8px',
                      textTransform: 'none'
                    }}
                  >
                    Delete My Account
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </div>
        </Container>

        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
        >
          <DialogTitle id="delete-dialog-title">
            Delete your account?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              This action cannot be undone. All of your data will be permanently deleted.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                try {
                  await apiService.deleteAccount();
                  logout();
                  navigate('/login', { state: { message: 'Your account has been deleted successfully.' } });
                } catch (error) {
                  setError('Failed to delete account');
                  setDeleteDialogOpen(false);
                }
              }} 
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Replace Snackbar with a custom alert implementation */}
        {alertOpen && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 9999,
              minWidth: '300px',
              maxWidth: '90%'
            }}
          >
            <Box
              sx={{
                bgcolor: alertSeverity === 'success' ? 'success.main' : 'error.main',
                color: 'white',
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography variant="body2">
                {alertMessage}
              </Typography>
              <IconButton 
                size="small" 
                onClick={handleAlertClose}
                sx={{ color: 'white', ml: 2 }}
              >
                <ArrowBack style={{ transform: 'rotate(45deg)' }} />
              </IconButton>
            </Box>
          </Box>
        )}
      </Box>
    </div>
  );
};

export default UserProfile;
