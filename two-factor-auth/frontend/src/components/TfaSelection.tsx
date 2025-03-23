import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  alpha,
  Grow,
  Fade
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Security, NoEncryption, ArrowForward, HowToReg } from '@mui/icons-material';
import { useApiError } from '../hooks/useApiError';

const TfaSelection: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { error, loading, handleError, startLoading, stopLoading } = useApiError();
  
  // Get username and email from location state (passed from registration)
  const username = location.state?.username;
  const email = location.state?.email;
  
  // Redirect to login if no username is provided
  if (!username) {
    navigate('/login');
    return null;
  }
  
  const handleEnableTfa = () => {
    // Redirect to the TFA setup page with APP method pre-selected
    navigate('/verify-2fa', {
      state: {
        username,
        setupMode: true,
        isFirstSetup: true, // Flag to indicate this is the first setup after registration
        tfaType: 'APP', // Pre-select authenticator app method
        selectedMethod: 'APP' // Explicitly set the method
      }
    });
  };
  
  const handleSkipTfa = () => {
    // Redirect to login page with success message
    navigate('/login', {
      state: {
        message: 'Registration successful! Please login to continue.'
      }
    });
  };
  
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        pt: 4,
        pb: 8
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

      <Fade in={true} timeout={800} style={{ transitionDelay: '300ms' }}>
        <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Grow in={true} timeout={800} style={{ transformOrigin: '50% 0%' }}>
            <Paper
              elevation={10}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  p: 2,
                  borderRadius: '50%',
                  mb: 2
                }}
              >
                <HowToReg sx={{ fontSize: 40, color: theme.palette.primary.main }} />
              </Box>

              <Typography
                component="h1"
                variant="h4"
                fontWeight="700"
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  MozBackgroundClip: 'text',
                  MozTextFillColor: 'transparent',
                  msBackgroundClip: 'text',
                  color: 'transparent',
                  mb: 0.5
                }}
              >
                Set Up Two-Factor Authentication
              </Typography>

              <Typography 
                variant="body1" 
                color="text.secondary" 
                sx={{ mb: 4, textAlign: 'center', maxWidth: '600px' }}
              >
                Two-factor authentication adds an extra layer of security to your account using an authenticator app.
                You'll need to provide a verification code from your authenticator app in addition to your password when you log in.
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Grow in={true} timeout={800} style={{ transformOrigin: '50% 50%' }}>
                    <Card
                      elevation={4}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                          border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`
                        }
                      }}
                    >
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.4)} 0%, ${alpha(theme.palette.primary.main, 0.2)} 100%)`,
                      }}>
                        <Security 
                          sx={{ 
                            fontSize: 60, 
                            color: theme.palette.primary.main,
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                          }} 
                        />
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" align="center" fontWeight="600" gutterBottom>
                          Enable Two-Factor Authentication
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                          Enhance your account security with an authenticator app like Google Authenticator, Microsoft Authenticator, or Authy.
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 0 }}>
                        <Button 
                          fullWidth 
                          variant="contained"
                          onClick={handleEnableTfa}
                          sx={{
                            py: 1.5,
                            borderRadius: 0,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                            '&:hover': {
                              background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                            }
                          }}
                        >
                          Enable
                        </Button>
                      </CardActions>
                    </Card>
                  </Grow>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Grow in={true} timeout={800} style={{ transitionDelay: '200ms', transformOrigin: '50% 50%' }}>
                    <Card
                      elevation={4}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        transition: 'all 0.3s ease',
                        border: `1px solid ${alpha(theme.palette.secondary.main, 0.1)}`,
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
                          border: `1px solid ${alpha(theme.palette.secondary.main, 0.3)}`
                        }
                      }}
                    >
                      <Box sx={{ 
                        textAlign: 'center', 
                        p: 3, 
                        background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.light, 0.4)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                      }}>
                        <NoEncryption 
                          sx={{ 
                            fontSize: 60, 
                            color: theme.palette.secondary.main,
                            filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                          }} 
                        />
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" align="center" fontWeight="600" gutterBottom>
                          Skip for Now
                        </Typography>
                        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                          Continue without two-factor authentication. You can enable it later from your profile settings.
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ p: 0 }}>
                        <Button 
                          fullWidth 
                          variant="contained"
                          color="secondary"
                          onClick={handleSkipTfa}
                          sx={{
                            py: 1.5,
                            borderRadius: 0,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: `linear-gradient(90deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
                            '&:hover': {
                              background: `linear-gradient(90deg, ${theme.palette.secondary.dark} 0%, ${theme.palette.secondary.main} 100%)`,
                            }
                          }}
                        >
                          Skip
                        </Button>
                      </CardActions>
                    </Card>
                  </Grow>
                </Grid>
              </Grid>
            </Paper>
          </Grow>
        </Container>
      </Fade>
    </Box>
  );
};

export default TfaSelection; 