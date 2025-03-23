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
  Zoom
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
  LockReset
} from '@mui/icons-material';
import apiService from '../services/api';
import { useApiError } from '../hooks/useApiError';
import { useAuth } from '../context/AuthContext';

const TwoFactorVerification: React.FC = () => {
  const { login } = useAuth();
  const [code, setCode] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [showMethodSelection, setShowMethodSelection] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<'APP' | 'EMAIL' | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { error, loading, handleError, startLoading, stopLoading } = useApiError();
  const username = location.state?.username;
  const theme = useTheme();
  const [animatingVerification, setAnimatingVerification] = useState(false);
  const [codeArray, setCodeArray] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // Initialize inputRefs with 6 null elements
  if (inputRefs.current.length === 0) {
    inputRefs.current = Array(6).fill(null);
  }

  useEffect(() => {
    if (!username) {
      navigate('/login');
    }
  }, [username, navigate]);
  
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
      const response = await apiService.setupTwoFactor(username, method);
      if (method === 'APP' && response.data.tfaSetupSecret) {
        setQrCode(response.data.tfaSetupSecret);
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
      const response = await apiService.verifyTwoFactor({ username, code });
      if (response.data.token) {
        setTimeout(() => {
          login(response.data.token);
          navigate('/dashboard');
        }, 1500); // Delay navigation to allow for animation
      }
    } catch (error) {
      handleError(error);
      setAnimatingVerification(false);
    } finally {
      stopLoading();
    }
  };

  if (!username) {
    return null;
  }

  const renderDigitInput = (index: number) => (
    <TextField
      inputRef={(el) => (inputRefs.current[index] = el)}
      variant="outlined"
      margin="none"
      autoFocus={index === 0}
      inputProps={{
        maxLength: 1,
        style: { 
          textAlign: 'center', 
          fontSize: '1.5rem', 
          fontWeight: 600,
          padding: '12px 8px'
        },
        pattern: "[0-9]*",
        inputMode: "numeric"
      }}
      value={codeArray[index]}
      onChange={(e) => handleCodeChange(index, e.target.value)}
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(index, e)}
      sx={{
        width: '60px',
        height: '70px',
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          bgcolor: alpha(theme.palette.background.paper, 0.8),
          transition: 'all 0.3s ease',
          '&:hover': {
            bgcolor: alpha(theme.palette.background.paper, 1),
          },
          '&.Mui-focused': {
            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
          }
        }
      }}
    />
  );

  const renderMethodSelection = () => (
    <Slide direction="up" in={showMethodSelection} mountOnEnter unmountOnExit>
      <Box sx={{ width: '100%' }}>
        <Typography variant="h5" align="center" fontWeight="600" gutterBottom color="primary" sx={{ mb: 3 }}>
          Choose Verification Method
        </Typography>
        <Grid container spacing={3}>
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
                  <PhoneAndroid 
                    sx={{ 
                      fontSize: 50, 
                      color: theme.palette.primary.main,
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                    }} 
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" align="center" fontWeight="600" gutterBottom>
                    Authenticator App
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                    Use an authenticator app like Google Authenticator or Authy for the most secure experience
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained"
                    onClick={() => handleMethodSelect('APP')}
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
                    Select
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
                  <Email 
                    sx={{ 
                      fontSize: 50, 
                      color: theme.palette.primary.main,
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.2))'
                    }} 
                  />
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" align="center" fontWeight="600" gutterBottom>
                    Email
                  </Typography>
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                    Receive a one-time verification code via email sent to your registered address
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 0 }}>
                  <Button 
                    fullWidth 
                    variant="contained"
                    onClick={() => handleMethodSelect('EMAIL')}
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
                    Select
                  </Button>
                </CardActions>
              </Card>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </Slide>
  );

  const renderVerificationForm = () => (
    <Slide direction="up" in={!showMethodSelection} mountOnEnter unmountOnExit>
      <Box>
        <Typography 
          component="h1" 
          variant="h4" 
          align="center"
          fontWeight="700"
          gutterBottom
          sx={{
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            MozBackgroundClip: 'text',
            MozTextFillColor: 'transparent',
            msBackgroundClip: 'text',
            color: 'transparent',
            mb: 2
          }}
        >
          Two-Factor Authentication
        </Typography>
        
        <Box sx={{ position: 'relative', mb: 4 }}>
          {loading && !animatingVerification && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 2,
              borderRadius: 2
            }}>
              <CircularProgress size={40} />
            </Box>
          )}

          {error && (
            <Box sx={{ 
              mb: 3, 
              p: 2, 
              bgcolor: alpha(theme.palette.error.main, 0.1), 
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              display: 'flex',
              alignItems: 'center',
              animation: 'shake 0.5s ease-in-out',
              '@keyframes shake': {
                '0%, 100%': { transform: 'translateX(0)' },
                '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
              }
            }}>
              <Box sx={{ mr: 1, color: theme.palette.error.main }}>
                <LockReset />
              </Box>
              <Typography color="error.main" variant="body2">
                {error}
              </Typography>
            </Box>
          )}

          {selectedMethod === 'APP' && qrCode && (
            <Fade in={true} timeout={1000}>
              <Box sx={{ mt: 3, mb: 4, textAlign: 'center' }}>
                <Typography 
                  variant="subtitle1" 
                  sx={{ 
                    mb: 3, 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: theme.palette.primary.main,
                    fontWeight: 500
                  }}
                >
                  <Security sx={{ mr: 1 }} />
                  Scan this QR code with your authenticator app
                </Typography>
                <Box
                  sx={{
                    display: 'inline-block',
                    p: 3,
                    bgcolor: 'white',
                    borderRadius: 2,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: `4px solid ${theme.palette.primary.main}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  <QRCode value={qrCode} size={200} level="H" includeMargin={true} />
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                  After scanning, enter the code from your app below
                </Typography>
              </Box>
            </Fade>
          )}

          {selectedMethod === 'EMAIL' && (
            <Fade in={true} timeout={1000}>
              <Box sx={{ mt: 3, mb: 4, textAlign: 'center', p: 3, bgcolor: alpha(theme.palette.primary.main, 0.05), borderRadius: 2 }}>
                <Box sx={{ color: theme.palette.primary.main, fontSize: 60, mb: 2 }}>
                  <Email />
                </Box>
                <Typography variant="h6" sx={{ mb: 2, color: theme.palette.primary.main }}>
                  Verification Code Sent
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  We've sent a verification code to your email address.
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Please check your inbox and enter the 6-digit code below.
                </Typography>
              </Box>
            </Fade>
          )}
        </Box>

        <Box 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            mt: 3, 
            width: '100%',
            position: 'relative',
          }}
        >
          <Fade in={!animatingVerification} timeout={500}>
            <Box>
              <Typography 
                variant="subtitle1" 
                align="center" 
                gutterBottom 
                fontWeight="500"
              >
                Enter Verification Code
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  gap: 1.5,
                  my: 3
                }}
              >
                {Array.from({ length: 6 }).map((_, index) => (
                  <Box key={index} sx={{ position: 'relative' }}>
                    {renderDigitInput(index)}
                  </Box>
                ))}
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.2,
                  borderRadius: 6,
                  position: 'relative',
                  overflow: 'hidden',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  transition: 'all 0.3s ease',
                  boxShadow: `0 8px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                  }
                }}
                disabled={loading || code.length !== 6}
              >
                Verify
              </Button>
            </Box>
          </Fade>

          <Zoom in={animatingVerification} style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              p: 3
            }}>
              <Box 
                sx={{ 
                  width: 80, 
                  height: 80, 
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: theme.palette.success.main,
                  color: 'white',
                  mb: 2,
                  animation: 'pulse 1.5s infinite',
                  '@keyframes pulse': {
                    '0%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.7)}` },
                    '70%': { boxShadow: `0 0 0 15px ${alpha(theme.palette.success.main, 0)}` },
                    '100%': { boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0)}` }
                  }
                }}
              >
                <CheckCircle sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h6" gutterBottom>
                Verification Successful
              </Typography>
              <Typography variant="body2" color="text.secondary" align="center">
                Redirecting to your secure dashboard...
              </Typography>
            </Box>
          </Zoom>
        </Box>
      </Box>
    </Slide>
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

      <Grow in={true} timeout={800}>
        <Container component="main" maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
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
              <Verified sx={{ fontSize: 40, color: theme.palette.primary.main }} />
            </Box>

            {showMethodSelection ? renderMethodSelection() : renderVerificationForm()}
          </Paper>
        </Container>
      </Grow>
    </Box>
  );
};

export default TwoFactorVerification;
