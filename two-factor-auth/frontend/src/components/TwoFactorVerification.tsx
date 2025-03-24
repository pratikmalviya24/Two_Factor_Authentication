import React, { useState, useEffect, useRef } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Paper, 
  Typography, 
  Box, 
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Grid,
  useTheme,
  alpha,
  InputAdornment,
  Slide,
  Fade,
  Grow,
  IconButton,
  Zoom,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Tooltip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import QRCode from 'qrcode.react';
import { 
  Email, 
  PhoneAndroid, 
  Security, 
  Verified, 
  Backspace, 
  CheckCircle,
  LockReset,
  Shield,
  ArrowForward,
  AppShortcut,
  MarkEmailRead,
  CropFree,
  VerifiedUser,
  SmartToy,
  Key,
  HttpsOutlined
} from '@mui/icons-material';
import apiService from '../services/api';
import { useApiError } from '../hooks/useApiError';
import { useAuth } from '../context/AuthContext';

const TwoFactorVerification: React.FC = () => {
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showMethodSelection, setShowMethodSelection] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'APP' | 'EMAIL' | null>(null);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { error, loading, handleError, startLoading, stopLoading } = useApiError();
  const username = location.state?.username;
  const setupMode = location.state?.setupMode;
  const tfaSetupSecret = location.state?.tfaSetupSecret;
  const tfaType = location.state?.tfaType;
  const isSetup = location.state?.isSetup;
  const isFirstSetup = location.state?.isFirstSetup;
  const theme = useTheme();
  const [animatingVerification, setAnimatingVerification] = useState(false);
  const [codeArray, setCodeArray] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  
  // Initialize inputRefs with 6 null elements
  if (inputRefs.current.length === 0) {
    inputRefs.current = Array(6).fill(null);
  }

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }
    
    // Handle registration TFA setup
    if (isSetup && tfaSetupSecret) {
      setIsSetupMode(true);
      setShowMethodSelection(false);
      setSelectedMethod(tfaType as 'APP' | 'EMAIL' || 'APP');
      setQrCode(tfaSetupSecret);
      return;
    }
    
    // Set setup mode based on navigation state
    if (setupMode) {
      setIsSetupMode(true);
      
      // If skipMethodSelection flag is set (from profile page), skip method selection
      // and directly use the authenticator app method
      if (location.state?.skipMethodSelection) {
        setShowMethodSelection(false);
        setSelectedMethod('APP');
        // Immediately start setup for authenticator app
        handleSetupAuthenticatorApp();
      }
      // If coming from the TFA selection screen after registration, skip method selection
      // and directly use the authenticator app method
      else if (isFirstSetup && location.state?.selectedMethod === 'APP') {
        setShowMethodSelection(false);
        setSelectedMethod('APP');
        // Immediately start setup for authenticator app
        handleSetupAuthenticatorApp();
      } else {
        // For other setup flows, still show method selection
        // BUT show only APP method during registration
        setShowMethodSelection(true);
      }
    } else {
      // For login verification flow, check if we should show method selection
      if (location.state?.loginFlow) {
        // This is a login flow, show the method selection screen
        setShowMethodSelection(true);
        setIsSetupMode(false);
      } else {
        // If this is verification only (normal login), don't show method selection
        // Set method to APP by default for verification
        setSelectedMethod('APP');
        setShowMethodSelection(false);
      }
    }
  }, [username, navigate, setupMode, isSetup, tfaSetupSecret, tfaType, isFirstSetup, location.state]);
  
  // Helper function to setup authenticator app
  const handleSetupAuthenticatorApp = async () => {
    try {
      startLoading();
      const response = await apiService.setupTwoFactor(username, 'APP');
      if (response.data.tfaSetupSecret) {
        setQrCode(response.data.tfaSetupSecret);
      }
    } catch (error) {
      handleError(error);
      setShowMethodSelection(true);
    } finally {
      stopLoading();
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // If someone pastes a code
      const pastedCode = value.slice(0, 6);
      const newCodeArray = [...codeArray];
      
      for (let i = 0; i < 6; i++) {
        if (i < pastedCode.length) {
          newCodeArray[i] = pastedCode[i];
        }
      }
      
      setCodeArray(newCodeArray);
      setCode(pastedCode.slice(0, 6));
      inputRefs.current[5]?.focus();
    } else {
      // Normal input
      const newCodeArray = [...codeArray];
      newCodeArray[index] = value;
      setCodeArray(newCodeArray);
      setCode(newCodeArray.join(''));
      
      // Auto focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !codeArray[index] && index > 0) {
      // Move to previous input when pressing backspace on an empty field
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleMethodSelect = async (method: 'APP' | 'EMAIL') => {
    try {
      startLoading();
      setShowMethodSelection(false);
      setSelectedMethod(method);
      
      // Generate QR code if we're in setup mode or send email OTP if it's an EMAIL verification
      if (isSetupMode || method === 'EMAIL') {
        const response = await apiService.setupTwoFactor(username, method);
        if (method === 'APP' && response.data.tfaSetupSecret) {
          setQrCode(response.data.tfaSetupSecret);
        }
      }
    } catch (error) {
      handleError(error);
      setShowMethodSelection(true);
    } finally {
      stopLoading();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAnimatingVerification(true);

    try {
      startLoading();
      
      // Check if we're in profile-based setup mode
      if (isSetupMode && location.state?.fromProfile) {
        // Use profile-specific API for enabling TFA with verification
        const { verifyAndEnableTfa } = await import('../services/profileService');
        await verifyAndEnableTfa(code, selectedMethod as 'APP' | 'EMAIL');
        
        // Set local state to show success animation
        setVerificationSuccess(true);
        
        // Redirect back to profile page with success message
        setTimeout(() => {
          navigate('/profile', {
            state: {
              message: 'Two-factor authentication has been enabled successfully.',
              severity: 'success'
            }
          });
        }, 1500);
      } else {
        // Use regular auth flow for verification
        const response = await apiService.verifyTwoFactor({ 
          username, 
          code,
          firstTimeSetup: isFirstSetup || false
        });
        
        // Set local state to show success animation
        setVerificationSuccess(true);
        
        // Handle based on whether this is first-time setup or regular verification
        if (isFirstSetup) {
          // For first-time setup, wait a moment to show success animation, then redirect to login
          setTimeout(() => {
            navigate('/login', { 
              state: { 
                message: 'Two-factor authentication has been set up successfully! Please login to continue.' 
              } 
            });
          }, 2000);
        } else if (location.state?.reconfigure) {
          // If this is a reconfiguration from the profile page, return to the profile
          setTimeout(() => {
            navigate('/profile', {
              state: {
                message: 'Two-factor authentication has been reconfigured successfully.',
                severity: 'success'
              }
            });
          }, 1500);
        } else if (response.data.token) {
          // For normal login verification, log the user in
          setTimeout(() => {
            login(response.data.token);
            navigate('/dashboard');
          }, 1500);
        }
      }
    } catch (error) {
      handleError(error);
      setAnimatingVerification(false);
      setCodeArray(['', '', '', '', '', '']);
      setCode('');
      // Focus on the first input after error
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } finally {
      stopLoading();
    }
  };

  if (!username) {
    return null;
  }

  // Render for digit input
  const renderDigitInput = (index: number) => (
    <TextField
      key={index}
      inputRef={(el) => (inputRefs.current[index] = el)}
      variant="outlined"
      autoComplete="off"
      type="text"
      value={codeArray[index]}
      onChange={(e) => handleCodeChange(index, e.target.value)}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
      inputProps={{
        maxLength: 1,
        style: { 
          textAlign: 'center', 
          fontSize: '1.25rem', 
          fontWeight: 'bold',
          padding: '8px 0',
          width: '100%',
          caretColor: theme.palette.primary.main
        },
      }}
      sx={{
        width: '46px',
        mx: 0.5,
        '& .MuiOutlinedInput-root': {
          borderRadius: 1.5,
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease',
          '&.Mui-focused': {
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
            borderColor: theme.palette.primary.main,
            transform: 'translateY(-2px)',
          },
          '&:hover': {
            borderColor: theme.palette.primary.main,
          }
        },
      }}
    />
  );

  // Render for method selection
  const renderMethodSelection = () => {
    // Check if the user is coming from the profile page
    const isFromProfile = location.state?.fromProfile === true;
    const isLoginFlow = !isSetupMode && location.state?.loginFlow === true;
    
    return (
    <Fade in={showMethodSelection} timeout={800}>
      <Box>
        <Typography variant="h5" fontWeight="700" textAlign="center" mb={3} 
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {isSetupMode ? 'Setup Your 2FA Method' : 'Verify Your Identity'}
        </Typography>
        
        <Typography variant="body1" textAlign="center" mb={4} color="text.secondary" 
          sx={{ maxWidth: '500px', mx: 'auto' }}
        >
          {isSetupMode 
            ? 'Two-factor authentication adds an extra layer of security to your account. Choose your preferred verification method.' 
            : 'Please select a verification method to continue.'}
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {/* Always show Authenticator App option */}
          <Grid item xs={12} md={isLoginFlow ? 6 : 12}>
            <Card 
              sx={{
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '1px solid',
                borderColor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: 2,
                overflow: 'hidden',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                  borderColor: alpha(theme.palette.primary.main, 0.5),
                },
              }}
              onClick={() => handleMethodSelect('APP')}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Box 
                    sx={{ 
                      mr: 1.5, 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      p: 1,
                      borderRadius: '50%',
                    }}
                  >
                    <PhoneAndroid 
                      sx={{ 
                        color: theme.palette.primary.main,
                        fontSize: 28
                      }} 
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={600}>
                    Authenticator App
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Use Google Authenticator, Microsoft Authenticator, Authy, or any other compatible TOTP app
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Show Email option only for login flow, not for registration or initial setup */}
          {isLoginFlow && (
            <Grid item xs={12} md={6}>
              <Card 
                sx={{
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.info.main, 0.2),
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme.shadows[8],
                    borderColor: alpha(theme.palette.info.main, 0.5),
                  },
                }}
                onClick={() => handleMethodSelect('EMAIL')}
              >
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <Box 
                      sx={{ 
                        mr: 1.5, 
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        p: 1,
                        borderRadius: '50%',
                      }}
                    >
                      <Email 
                        sx={{ 
                          color: theme.palette.info.main,
                          fontSize: 28
                        }} 
                      />
                    </Box>
                    <Typography variant="h6" fontWeight={600}>
                      Email Code
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Receive a verification code via email to your registered address
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Fade>
    );
  };

  // Main verification form
  const renderVerificationForm = () => (
    <Fade in={!showMethodSelection} timeout={800}>
      <Box 
        sx={{ 
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography variant="h6" fontWeight="700" textAlign="center" mb={1}
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          {verificationSuccess 
            ? 'Verification Successful!' 
            : isSetupMode 
              ? 'Set Up Authenticator' 
              : 'Enter Verification Code'}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          mb: 1.5, 
          mt: 1, 
          gap: 1,
          bgcolor: selectedMethod === 'APP' 
            ? alpha(theme.palette.primary.main, 0.1) 
            : alpha(theme.palette.info.main, 0.1),
          borderRadius: 2,
          px: 2,
          py: 1
        }}>
          {selectedMethod === 'APP' ? (
            <>
              <SmartToy color="primary" fontSize="small" />
              <Typography variant="body2" color="primary.main" fontWeight={500}>
                Authenticator App Verification
              </Typography>
            </>
          ) : (
            <>
              <Email color="info" fontSize="small" />
              <Typography variant="body2" color="info.main" fontWeight={500}>
                Email Verification
              </Typography>
            </>
          )}
        </Box>

        <Typography variant="body2" textAlign="center" mb={2} color="text.secondary">
          {verificationSuccess 
            ? 'You have successfully verified your identity.'
            : selectedMethod === 'APP' 
              ? isSetupMode 
                ? 'Scan the QR code with your authenticator app, then enter the code.'
                : 'Enter the 6-digit code from your authenticator app.'
              : 'Enter the 6-digit code sent to your email address.'}
        </Typography>

        {/* QR Code for setup mode */}
        {isSetupMode && selectedMethod === 'APP' && qrCode && (
          <Grow in={true} timeout={800}>
            <Box 
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                bgcolor: 'white',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                overflow: 'hidden',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                mb: 1.5,
                gap: 1
              }}>
                <CropFree color="primary" fontSize="small" />
                <Typography variant="subtitle2" fontWeight={600} color="primary.main">
                  Scan QR Code
                </Typography>
              </Box>
              
              <Box sx={{ 
                p: 1.5, 
                bgcolor: 'white', 
                borderRadius: 2, 
                boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
                position: 'relative',
                zIndex: 2,
              }}>
                <div style={{ background: 'white' }}>
                  <QRCode 
                    value={qrCode} 
                    size={150} 
                    level="M"
                    includeMargin={true}
                    renderAs="svg"
                  />
                </div>
              </Box>
                
              <Typography variant="caption" color="text.secondary" mt={1.5} textAlign="center">
                username :
              </Typography>
              <Typography 
                variant="caption" 
                fontFamily="monospace"
                fontWeight="bold"
                mt={0.5}
                p={1}
                bgcolor={alpha(theme.palette.primary.main, 0.1)}
                borderRadius={1.5}
                sx={{
                  letterSpacing: '0.5px',
                  position: 'relative',
                  zIndex: 2,
                  fontSize: '0.7rem',
                }}
              >
                {qrCode.replace('otpauth://totp/', '').split('?')[0]}
              </Typography>
            </Box>
          </Grow>
        )}
        
        {/* Verification code input */}
        {!verificationSuccess && (
          <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '380px' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2,
                mt: isSetupMode && selectedMethod === 'APP' ? 0 : 1,
              }}
            >
              {codeArray.map((_, index) => renderDigitInput(index))}
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <Button
                type="submit"
                variant="contained"
                color={selectedMethod === 'APP' ? "primary" : "info"}
                size="medium"
                disabled={loading || code.length !== 6}
                disableElevation
                sx={{
                  mt: 1,
                  borderRadius: 4,
                  px: 4,
                  py: 1,
                  fontWeight: 'bold',
                  textTransform: 'none',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                  background: selectedMethod === 'APP'
                    ? `linear-gradient(135deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.dark} 90%)`
                    : `linear-gradient(135deg, ${theme.palette.info.main} 30%, ${theme.palette.info.dark} 90%)`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 12px rgba(0,0,0,0.15)',
                  },
                }}
              >
                {loading ? <CircularProgress size={20} /> : 'Verify'}
              </Button>
              
              {!isSetupMode && (
                <Button
                  variant="text"
                  color={selectedMethod === 'APP' ? "primary" : "info"}
                  onClick={() => setShowMethodSelection(true)}
                  size="small"
                  sx={{ 
                    mt: 1.5, 
                    ml: 1,
                    textTransform: 'none',
                    fontWeight: 'medium',
                  }}
                >
                  Change Method
                </Button>
              )}
            </Box>
          </form>
        )}
      </Box>
    </Fade>
  );

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

      <Fade in={true} timeout={800}>
        <Container component="main" maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
          <Grow in={true} timeout={800} style={{ transformOrigin: '50% 0%' }}>
            <Paper
              elevation={10}
              sx={{
                p: { xs: 2, md: 3 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.1)'
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  p: 1.5,
                  borderRadius: '50%',
                  mb: 1.5
                }}
              >
                <Shield sx={{ fontSize: 32, color: theme.palette.primary.main }} />
              </Box>
              
              {showMethodSelection ? renderMethodSelection() : renderVerificationForm()}
            </Paper>
          </Grow>
        </Container>
      </Fade>
    </Box>
  );
};

export default TwoFactorVerification;
