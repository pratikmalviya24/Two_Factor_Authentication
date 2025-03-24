import React, { useState, useEffect, useRef } from 'react';
import { 
  TextField, 
  Button, 
  Container, 
  Paper, 
  Typography, 
  Box, 
  Link, 
  Alert,
  useTheme,
  alpha,
  InputAdornment,
  IconButton,
  Fade,
  Grow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Divider,
  Avatar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApiError } from '../hooks/useApiError';
import apiService from '../services/api';
import captchaService from '../services/captchaService';
import ReCAPTCHA from 'react-google-recaptcha';
import { 
  Person, 
  Lock, 
  Visibility, 
  VisibilityOff, 
  Security,
  ArrowForward,
  VpnKey,
  Email,
  Login as LoginIcon
} from '@mui/icons-material';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string>('');
  // Use Google's special test key for development
  const [siteKey, setSiteKey] = useState<string>('6Lc8-vwqAAAAAM6pSulL7ReN7X2tG1sIBoG-YCjC');
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { error, loading, handleError, startLoading, stopLoading } = useApiError();
  const [successMessage, setSuccessMessage] = useState<string>('');
  const theme = useTheme();
  
  // Forgot password states
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear the message from location state
      window.history.replaceState({}, document.title);
    }
    
    // Comment out the fetch since we're using a hardcoded value now
    /*
    // Fetch the reCAPTCHA site key
    const fetchSiteKey = async () => {
      try {
        const key = await captchaService.getSiteKey();
        setSiteKey(key);
      } catch (error) {
        console.error('Failed to fetch reCAPTCHA site key:', error);
      }
    };
    
    fetchSiteKey();
    */
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    if (!captchaToken) {
      handleError(new Error('Please complete the CAPTCHA verification'));
      return;
    }

    try {
      startLoading();
      const response = await apiService.login(username, password, captchaToken);
      const { token, requiresTwoFactor, tfaType } = response.data;

      if (requiresTwoFactor) {
        // Navigate to 2FA verification with a flag to show method selection for login flow
        navigate('/verify-2fa', { 
          state: { 
            username,
            setupMode: false,
            tfaType: tfaType || 'APP',
            loginFlow: true, // Flag to indicate this is a login flow and should show method selection
            message: 'Please verify your identity using one of the following methods:'
          } 
        });
      } else if (token) {
        login(token);
        navigate('/dashboard');
      }
    } catch (error) {
      handleError(error);
      // Reset the reCAPTCHA on error
      recaptchaRef.current?.reset();
      setCaptchaToken('');
    } finally {
      stopLoading();
    }
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token || '');
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleForgotPasswordOpen = () => {
    setForgotPasswordOpen(true);
    setForgotPasswordEmail('');
    setForgotPasswordError('');
    setForgotPasswordSuccess(false);
  };

  const handleForgotPasswordClose = () => {
    setForgotPasswordOpen(false);
  };

  const handleForgotPasswordSubmit = async () => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Please enter your username or email');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');

    try {
      // Call the API endpoint with the username/email
      const response = await apiService.initiatePasswordReset(forgotPasswordEmail);
      console.log('Password reset response:', response.data);
      setForgotPasswordSuccess(true);
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error instanceof Error) {
        // Show more descriptive error messages
        if (error.message.includes('404') || error.message.includes('not found')) {
          setForgotPasswordError('The username or email address was not found in our system.');
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          setForgotPasswordError('Network error. Please check your internet connection and try again.');
        } else {
          setForgotPasswordError(error.message);
        }
      } else {
        setForgotPasswordError('Failed to send password reset email. Please try again later.');
      }
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.3)} 0%, ${alpha(theme.palette.primary.light, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        pt: 4,
        pb: 8
      }}
    >
      {/* Enhanced decorative background elements */}
      <Box
        sx={{
          position: 'absolute',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, rgba(0,0,0,0) 70%)`,
          top: '-200px',
          right: '-200px',
          zIndex: 0,
          filter: 'blur(40px)',
          opacity: 0.8
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.15)} 0%, rgba(0,0,0,0) 70%)`,
          bottom: '-150px',
          left: '-150px',
          zIndex: 0,
          filter: 'blur(30px)',
          opacity: 0.7
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.dark, 0.1)} 0%, rgba(0,0,0,0) 70%)`,
          top: '30%',
          left: '10%',
          zIndex: 0,
          filter: 'blur(20px)',
          opacity: 0.5
        }}
      />

      <Fade in={true} timeout={800} style={{ transitionDelay: '300ms' }}>
        <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
          <Grow in={true} timeout={800} style={{ transformOrigin: '50% 0%' }}>
            <Paper
              elevation={16}
              sx={{
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)'
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: theme.palette.primary.main,
                  boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.4)}`,
                  mb: 3,
                  transform: 'translateY(-60%)',
                  position: 'absolute',
                  border: `4px solid ${theme.palette.background.paper}`
                }}
              >
                <LoginIcon sx={{ fontSize: 40 }} />
              </Avatar>

              <Box sx={{ mt: 5, width: '100%', textAlign: 'center' }}>
                <Typography
                  component="h1"
                  variant="h4"
                  fontWeight="800"
                  sx={{
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    MozBackgroundClip: 'text',
                    MozTextFillColor: 'transparent',
                    msBackgroundClip: 'text',
                    color: 'transparent',
                    textShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
                    mb: 1
                  }}
                >
                  Welcome Back
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Sign in to access your secure account
                </Typography>
              </Box>

              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <Fade in={!!successMessage} timeout={500}>
                  <Box sx={{ mb: 3, display: successMessage ? 'block' : 'none' }}>
                    <Alert 
                      severity="success" 
                      variant="filled"
                      sx={{ 
                        borderRadius: 2,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                          '0%': { boxShadow: '0 0 0 0 rgba(67, 160, 71, 0.4)' },
                          '70%': { boxShadow: '0 0 0 10px rgba(67, 160, 71, 0)' },
                          '100%': { boxShadow: '0 0 0 0 rgba(67, 160, 71, 0)' }
                        }
                      }}
                    >
                      {successMessage}
                    </Alert>
                  </Box>
                </Fade>

                <Fade in={!!error} timeout={500}>
                  <Box sx={{ mb: 3, display: error ? 'block' : 'none' }}>
                    <Alert 
                      severity="error" 
                      variant="filled"
                      sx={{ 
                        borderRadius: 2,
                        animation: 'shake 0.5s ease-in-out',
                        '@keyframes shake': {
                          '0%, 100%': { transform: 'translateX(0)' },
                          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
                          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' }
                        }
                      }}
                    >
                      {error}
                    </Alert>
                  </Box>
                </Fade>

                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 1)
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiInputLabel-root': {
                      color: theme.palette.text.secondary
                    },
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2
                      }
                    }
                  }}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
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
                    sx: {
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.background.paper, 0.8),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 1)
                      },
                      transition: 'all 0.3s ease',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                    }
                  }}
                  sx={{
                    mb: 1,
                    '& .MuiInputLabel-root': {
                      color: theme.palette.text.secondary
                    },
                    '& .MuiOutlinedInput-root': {
                      '&.Mui-focused fieldset': {
                        borderColor: theme.palette.primary.main,
                        borderWidth: 2
                      }
                    }
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleForgotPasswordOpen}
                    sx={{
                      textDecoration: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: theme.palette.primary.dark
                      }
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

                <Divider sx={{ my: 2, opacity: 0.6 }}>
                  <Typography variant="caption" color="text.secondary">SECURITY CHECK</Typography>
                </Divider>

                <Box sx={{ mt: 2, mb: 3, display: 'flex', justifyContent: 'center' }}>
                  {siteKey && (
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={siteKey}
                      onChange={handleCaptchaChange}
                    />
                  )}
                </Box>

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading || !captchaToken}
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1.5,
                    borderRadius: 8,
                    position: 'relative',
                    overflow: 'hidden',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    letterSpacing: 0.5,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease',
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      Sign In <ArrowForward sx={{ ml: 1, fontSize: '1.1rem' }} />
                    </>
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Don't have an account?
                  </Typography>
                  <Link 
                    href="/register" 
                    variant="body2"
                    sx={{
                      textDecoration: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: theme.palette.primary.dark
                      }
                    }}
                  >
                    Create a new account
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Grow>
        </Container>
      </Fade>

      {/* Password Recovery Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={!forgotPasswordLoading ? handleForgotPasswordClose : undefined}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pt: 3 }}>
          Password Recovery
        </DialogTitle>
        <DialogContent>
          {!forgotPasswordSuccess ? (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Please enter your username or email address. We'll send you a link to reset your password.
              </DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="forgotPasswordEmail"
                label="Username or Email"
                type="text"
                fullWidth
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                disabled={forgotPasswordLoading}
                error={!!forgotPasswordError}
                helperText={forgotPasswordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
                    </InputAdornment>
                  )
                }}
                sx={{
                  mt: 1,
                  '& .MuiInputBase-root': {
                    borderRadius: 2
                  }
                }}
              />
            </>
          ) : (
            <Alert 
              severity="success" 
              variant="filled"
              sx={{ 
                my: 2,
                borderRadius: 2,
                alignItems: 'center',
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%': { boxShadow: '0 0 0 0 rgba(67, 160, 71, 0.4)' },
                  '70%': { boxShadow: '0 0 0 10px rgba(67, 160, 71, 0)' },
                  '100%': { boxShadow: '0 0 0 0 rgba(67, 160, 71, 0)' }
                }
              }}
            >
              Password reset email has been sent! Please check your inbox and follow the instructions to reset your password.
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={handleForgotPasswordClose}
            color="inherit"
            disabled={forgotPasswordLoading}
            sx={{ 
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: 6
            }}
          >
            {forgotPasswordSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!forgotPasswordSuccess && (
            <Button 
              onClick={handleForgotPasswordSubmit}
              color="primary"
              variant="contained"
              disabled={forgotPasswordLoading}
              sx={{ 
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 6,
                px: 2
              }}
              startIcon={forgotPasswordLoading ? <CircularProgress size={20} color="inherit" /> : <VpnKey />}
            >
              Send Reset Link
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
