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
  DialogContentText
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
  Email
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
      const { token, requiresTwoFactor } = response.data;

      if (requiresTwoFactor) {
        navigate('/verify-2fa', { state: { username } });
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
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.2)} 0%, rgba(0,0,0,0) 70%)`,
          top: '-100px',
          right: '-100px',
          zIndex: 0
        }}
      />
      
      <Box
        sx={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, rgba(0,0,0,0) 70%)`,
          bottom: '-50px',
          left: '-50px',
          zIndex: 0
        }}
      />

      <Fade in={true} timeout={800} style={{ transitionDelay: '300ms' }}>
        <Container component="main" maxWidth="xs" sx={{ position: 'relative', zIndex: 1 }}>
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
                <Security sx={{ fontSize: 40, color: theme.palette.primary.main }} />
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
                  mb: 1
                }}
              >
                Welcome Back
              </Typography>


              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                <Fade in={!!successMessage} timeout={500}>
                  <Box sx={{ mb: 2, display: successMessage ? 'block' : 'none' }}>
                    <Alert 
                      severity="success" 
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
                  <Box sx={{ mb: 2, display: error ? 'block' : 'none' }}>
                    <Alert 
                      severity="error" 
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
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.8)
                      },
                      transition: 'all 0.3s ease'
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
                      bgcolor: alpha(theme.palette.background.paper, 0.5),
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.8)
                      },
                      transition: 'all 0.3s ease'
                    }
                  }}
                />

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Link
                    component="button"
                    type="button"
                    variant="body2"
                    onClick={handleForgotPasswordOpen}
                    sx={{
                      textDecoration: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 500,
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

                <Box sx={{ mt: 3, mb: 3, display: 'flex', justifyContent: 'center' }}>
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
                    mt: 2,
                    mb: 2,
                    py: 1.2,
                    borderRadius: 6,
                    position: 'relative',
                    overflow: 'hidden',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '1rem',
                    backgroundColor: theme.palette.primary.main,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    <>
                      Sign In <ArrowForward sx={{ ml: 1, fontSize: '1rem' }} />
                    </>
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Link 
                    href="/register" 
                    variant="body2"
                    sx={{
                      textDecoration: 'none',
                      color: theme.palette.primary.main,
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        textDecoration: 'underline',
                        color: theme.palette.primary.dark
                      }
                    }}
                  >
                    {"Don't have an account? Sign Up"}
                  </Link>
                </Box>
              </Box>
            </Paper>
          </Grow>
        </Container>
      </Fade>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={forgotPasswordSuccess ? handleForgotPasswordClose : undefined}
        maxWidth="sm"
        fullWidth
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
        }}>
          {forgotPasswordSuccess ? 'Password Reset Email Sent' : 'Reset Your Password'}
        </DialogTitle>
        <DialogContent>
          {forgotPasswordSuccess ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              py: 3 
            }}>
              <Email sx={{ 
                fontSize: 60, 
                color: 'success.main', 
                mb: 2 
              }} />
              <DialogContentText sx={{ textAlign: 'center', mb: 2 }}>
                We've sent password reset instructions to your registered email address.
                Please check your inbox (and spam folder) and follow the instructions to reset your password.
              </DialogContentText>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.85rem' }}>
                The reset link will expire in 30 minutes for security reasons.
                If you don't receive an email within a few minutes, please try again with your correct username or email address.
              </Typography>
            </Box>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2, mt: 1 }}>
                Enter your username or email address to receive a password reset link.
                If the account exists in our system, you'll receive an email with instructions to reset your password.
              </DialogContentText>
              {forgotPasswordError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {forgotPasswordError}
                </Alert>
              )}
              <TextField
                autoFocus
                margin="dense"
                id="forgotPasswordEmail"
                label="Username or Email Address"
                type="text"
                fullWidth
                value={forgotPasswordEmail}
                onChange={(e) => setForgotPasswordEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="primary" />
                    </InputAdornment>
                  ),
                  sx: {
                    borderRadius: 2,
                  }
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                Note: For security reasons, we will not indicate whether an account exists.
                Reset links are only sent to registered email addresses.
              </Typography>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {forgotPasswordSuccess ? (
            <Button 
              onClick={handleForgotPasswordClose}
              variant="contained"
              fullWidth
              sx={{ 
                borderRadius: 2,
                py: 1.2,
                textTransform: 'none',
                fontWeight: 600
              }}
            >
              Return to Login
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleForgotPasswordClose}
                sx={{ 
                  textTransform: 'none',
                  fontWeight: 500,
                  borderRadius: 2,
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleForgotPasswordSubmit}
                variant="contained"
                disabled={forgotPasswordLoading}
                startIcon={forgotPasswordLoading ? <CircularProgress size={20} /> : <VpnKey />}
                sx={{ 
                  px: 3,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Send Reset Link
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
