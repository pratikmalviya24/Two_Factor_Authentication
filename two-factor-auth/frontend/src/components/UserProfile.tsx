import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Container, Paper, Typography, Box, CircularProgress, IconButton, AppBar, Toolbar, Button, Dialog, DialogTitle, DialogContent, DialogActions, Switch, Fade, Grow, Avatar, useTheme, alpha, Snackbar, Alert, Card, CardContent, Divider, Grid, Chip } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack, Security, DeleteForever, Person, Shield, VpnKey, CheckCircle, QrCode2, Email, AccountCircle, Verified, Warning } from '@mui/icons-material';
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
  const [disableTfaDialogOpen, setDisableTfaDialogOpen] = useState(false);

  // Memoized function to load TFA settings
  const loadSettings = useCallback(async () => {
    // Prevent duplicate API calls
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    setTfaLoading(true);
    
    try {
      const settings = await getTfaSettings();
      setTfaEnabled(settings.enabled);
    } catch (error) {
      setError('Failed to load 2FA settings');
    } finally {
      setTfaLoading(false);
      loadingRef.current = false;
    }
  }, [setError]);

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
    
    if (user && !loadingRef.current) {
      loadSettings();
    }
    
    return () => {
      // Reset for next mount
      locationStateProcessedRef.current = false;
    };
  }, [user, setUser, loadSettings, location.state]);

  const handleTfaToggle = () => {
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
    
    // Show confirmation dialog when disabling 2FA
    setDisableTfaDialogOpen(true);
  };

  const handleConfirmDisableTfa = async () => {
    // Close the dialog and set loading state
    setDisableTfaDialogOpen(false);
    setTfaLoading(true);
    
    try {      
      // Disabling TFA
      await updateTfaSettings(false);
      
      // Immediately update UI state
      setTfaEnabled(false);
      
      // Update user context
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
      
      // Force a re-render with a new key to refresh the component
      setRenderKey(Date.now());
    } catch (error) {
      console.error("Error updating TFA settings:", error);
      setError('Failed to update 2FA settings');
      setAlertMessage("Failed to disable two-factor authentication");
      setAlertSeverity('error');
      setAlertOpen(true);
    } finally {
      // Ensure loading state is reset
      setTimeout(() => {
        setTfaLoading(false);
      }, 100);
    }
  };

  const handleCancelDisableTfa = () => {
    setDisableTfaDialogOpen(false);
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

  // Memoize the TFA card to prevent unnecessary re-renders
  const renderTfaCard = useCallback(() => {
    const cardStyle = {
      mb: 3,
      borderRadius: 2,
      boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
      border: '1px solid',
      borderColor: tfaEnabled ? theme.palette.success.light : alpha(theme.palette.primary.main, 0.2),
      position: 'relative',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      transform: tfaEnabled ? 'translateY(-4px)' : 'none',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
      }
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
              ? 'radial-gradient(circle, rgba(76,175,80,0.12) 0%, rgba(76,175,80,0) 70%)'
              : 'radial-gradient(circle, rgba(63,81,181,0.12) 0%, rgba(63,81,181,0) 70%)',
            top: '-75px',
            right: '-75px',
            zIndex: 0,
            transition: 'background 0.3s ease-in-out'
          }}
        />
        <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
          <Box display="flex" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <Security 
                color={tfaEnabled ? "success" : "action"} 
                sx={{ 
                  mr: 1.5, 
                  fontSize: 32,
                  transition: 'color 0.3s ease-in-out',
                  filter: tfaEnabled ? 'drop-shadow(0 2px 4px rgba(76,175,80,0.4))' : 'none'
                }} 
              />
              <Typography variant="h6" fontWeight={600} color="text.primary">
                Two-Factor Authentication
              </Typography>
            </Box>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>
            {tfaEnabled
              ? "Your account is protected with two-factor authentication. Each time you sign in, you'll need to provide a one-time code from your authenticator app."
              : "Enable two-factor authentication to add an extra layer of security to your account. You'll need an authenticator app on your phone."}
          </Typography>

          {!tfaEnabled && (
            <Button
              startIcon={<QrCode2 />}
              variant="contained"
              color="primary"
              onClick={handleTfaToggle}
              sx={{ 
                mt: 1,
                borderRadius: '8px',
                textTransform: 'none',
                px: 3,
                py: 1,
                boxShadow: '0 4px 12px rgba(63,81,181,0.2)',
                '&:hover': {
                  boxShadow: '0 6px 16px rgba(63,81,181,0.3)',
                }
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
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.success.light, 0.15), 
                color: theme.palette.success.dark,
                mb: 2,
                border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`
              }}>
                <CheckCircle sx={{ mr: 1.5, color: theme.palette.success.main }} />
                <Typography variant="body2" fontWeight={500}>
                  Your account is protected with 2FA
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<QrCode2 />}
                  onClick={setupTfa}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: '8px',
                    py: 1
                  }}
                >
                  Reconfigure Two-Factor Authentication
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Warning />}
                  onClick={handleTfaToggle}
                  sx={{ 
                    textTransform: 'none', 
                    borderRadius: '8px',
                    py: 1
                  }}
                >
                  Disable Two-Factor Authentication
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    );
  }, [tfaEnabled, tfaLoading, theme, handleTfaToggle, setupTfa]);

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
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

  return (
    <div>
      <Box sx={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(145deg, #f0f4ff 0%, #f5f5f5 100%)',
        position: 'relative',
        overflow: 'hidden',
        pb: 6
      }}>
        {/* Background decorative elements */}
        <Box sx={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(121,134,203,0.15) 0%, rgba(121,134,203,0) 70%)',
          top: '-150px',
          right: '-150px',
          zIndex: 0
        }} />
        
        <Box sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(63,81,181,0.1) 0%, rgba(63,81,181,0) 70%)',
          bottom: '50px',
          left: '-100px',
          zIndex: 0
        }} />
        
        <Box sx={{
          position: 'absolute',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(63,81,181,0.08) 0%, rgba(63,81,181,0) 70%)',
          top: '30%',
          left: '15%',
          zIndex: 0
        }} />
        
        {/* Header */}
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(90deg, #3f51b5 0%, #5c6bc0 100%)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            mb: 4,
            position: 'relative',
            overflow: 'hidden',
            height: 'auto',
            borderRadius: {xs: '0 0 16px 16px', sm: '0 0 24px 24px'}
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
          
          <Box 
            sx={{ 
              position: 'absolute', 
              bottom: -60, 
              left: '30%', 
              width: 150, 
              height: 150, 
              borderRadius: '50%', 
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)', 
            }} 
          />
          
          <Toolbar sx={{ px: {xs: 2, sm: 3}, py: {xs: 1.5, sm: 2}, display: 'flex', alignItems: 'center' }}>
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
            
            <Chip
              icon={<Verified sx={{ fontSize: 16, color: 'white !important' }} />}
              label={user.role || 'User'}
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 500,
                border: '1px solid rgba(255,255,255,0.3)',
                '& .MuiChip-icon': {
                  color: 'white'
                }
              }}
            />
          </Toolbar>
        </AppBar>

        <Container maxWidth="md" sx={{ py: {xs: 2, sm: 4}, position: 'relative', zIndex: 1 }}>
          {/* Profile Card */}
          <Paper 
            elevation={0}
            sx={{ 
              p: {xs: 2.5, sm: 3}, 
              borderRadius: {xs: 3, sm: 4},
              border: '1px solid',
              borderColor: alpha(theme.palette.primary.main, 0.1),
              mb: 4,
              boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 12px 36px rgba(0,0,0,0.12)',
                transform: 'translateY(-4px)'
              }
            }}
          >
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} sm={4} sx={{display: 'flex', justifyContent: {xs: 'center', sm: 'flex-start'}}}>
                <Avatar 
                  sx={{ 
                    width: {xs: 100, sm: 120}, 
                    height: {xs: 100, sm: 120}, 
                    bgcolor: theme.palette.primary.main,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    fontSize: {xs: '2rem', sm: '2.5rem'},
                    fontWeight: 'bold',
                    border: '4px solid white'
                  }}
                >
                  {getInitials(user.username || '')}
                </Avatar>
              </Grid>
              <Grid item xs={12} sm={8}>
                <Box sx={{textAlign: {xs: 'center', sm: 'left'}}}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    {user.username}
                  </Typography>
                  
                  <Box sx={{display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, gap: 2, mt: 2}}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        p: 1,
                        px: 1.5,
                        borderRadius: 2,
                      }}
                    >
                      <Email fontSize="small" color="primary" />
                      <Typography 
                        variant="body2" 
                        fontWeight={500}
                      >
                        {user.email || 'No email provided'}
                      </Typography>
                    </Box>
                    
                    {user.createdAt && (
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          p: 1,
                          px: 1.5,
                          borderRadius: 2,
                        }}
                      >
                        <AccountCircle fontSize="small" color="primary" />
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                        >
                          Member since {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          {/* Security Settings Section */}
          <Box>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 3, 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5,
                color: theme.palette.text.primary,
                fontWeight: 700,
                pb: 1,
                borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`
              }}
            >
              <Shield fontSize="medium" color="primary" />
              Security Settings
            </Typography>
            
            {/* TFA Card - the key forces a complete re-render when it changes */}
            <div key={`tfa-card-${tfaEnabled}-${renderKey}`}>
              {renderTfaCard()}
            </div>
            
            {/* Password Card */}
            <Card 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)'
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <VpnKey color="primary" sx={{ mr: 1.5, fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600}>
                    Password Management
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{lineHeight: 1.6}} gutterBottom>
                  Change your password to keep your account secure. We recommend using a strong, unique password that includes a mix of letters, numbers, and special characters.
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handlePasswordReset}
                  disabled={passwordResetRequested}
                  sx={{ 
                    mt: 2,
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    boxShadow: '0 4px 12px rgba(63,81,181,0.2)',
                    '&:hover': {
                      boxShadow: '0 6px 16px rgba(63,81,181,0.3)',
                    },
                    bgcolor: passwordResetRequested ? alpha(theme.palette.primary.main, 0.7) : theme.palette.primary.main
                  }}
                >
                  {passwordResetRequested ? 'Password Reset Email Sent' : 'Reset Password'}
                </Button>
              </CardContent>
            </Card>
            
            {/* Danger Zone Card */}
            <Card 
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                border: '1px solid',
                borderColor: alpha(theme.palette.error.main, 0.2),
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" mb={2}>
                  <DeleteForever color="error" sx={{ mr: 1.5, fontSize: 32 }} />
                  <Typography variant="h6" fontWeight={600} color="error.main">
                    Danger Zone
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{lineHeight: 1.6}} gutterBottom>
                  Once you delete your account, all of your data will be permanently removed. This action cannot be undone. Please make sure you want to proceed.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                  sx={{ 
                    mt: 2,
                    borderRadius: '8px',
                    textTransform: 'none',
                    px: 3,
                    py: 1,
                    borderWidth: '1.5px'
                  }}
                >
                  Delete My Account
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Container>

        {/* Delete Account Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          aria-labelledby="delete-dialog-title"
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1
            }
          }}
        >
          <DialogTitle id="delete-dialog-title" sx={{fontWeight: 600}}>
            Delete your account?
          </DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{mb: 1}}>
              This action cannot be undone. Are you absolutely sure?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              All of your data, including profile information, settings, and activity history will be permanently deleted.
            </Typography>
          </DialogContent>
          <DialogActions sx={{px: 3, pb: 2}}>
            <Button 
              onClick={() => setDeleteDialogOpen(false)} 
              color="primary" 
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
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
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(211,47,47,0.2)'
              }}
            >
              Delete Permanently
            </Button>
          </DialogActions>
        </Dialog>

        {/* 2FA Disable Confirmation Dialog */}
        <Dialog
          open={disableTfaDialogOpen}
          onClose={handleCancelDisableTfa}
          aria-labelledby="disable-tfa-dialog-title"
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1
            }
          }}
        >
          <DialogTitle id="disable-tfa-dialog-title" sx={{fontWeight: 600}}>
            Disable Two-Factor Authentication?
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 2 }}>
              <Warning color="warning" sx={{ fontSize: 32 }} />
              <Typography variant="body1" color="warning.dark" fontWeight={500}>
                This will reduce the security of your account.
              </Typography>
            </Box>
            <Typography variant="body2" sx={{mb: 1}}>
              Without two-factor authentication, you'll only need your password to sign in, making your account more vulnerable to security threats.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to disable two-factor authentication?
            </Typography>
          </DialogContent>
          <DialogActions sx={{px: 3, pb: 2}}>
            <Button 
              onClick={handleCancelDisableTfa} 
              color="primary" 
              variant="outlined"
              sx={{
                borderRadius: 2,
                textTransform: 'none'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDisableTfa} 
              color="error"
              variant="contained"
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(211,47,47,0.2)'
              }}
              startIcon={<Security />}
            >
              Disable 2FA
            </Button>
          </DialogActions>
        </Dialog>

        {/* Custom Alert */}
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
                bgcolor: alertSeverity === 'success' ? theme.palette.success.main : theme.palette.error.main,
                color: 'white',
                p: 2,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'fadeInUp 0.3s ease-out'
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
