import React, { useState, useRef, useEffect } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Fade,
  Grow,
  CircularProgress,
  Switch,
  Avatar,
  StepConnector,
  stepConnectorClasses,
  StepIconProps,
  styled
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useApiError } from '../hooks/useApiError';
import apiService from '../services/api';
import captchaService from '../services/captchaService';
import ReCAPTCHA from 'react-google-recaptcha';
import { 
  Person, 
  Email, 
  Lock, 
  Visibility, 
  VisibilityOff, 
  HowToReg,
  ArrowForward,
  ArrowBack,
  CheckCircle,
  AccountCircle,
  VpnKey,
  Security
} from '@mui/icons-material';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  captcha?: string;
}

// Custom Stepper styling
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: {
    top: 22,
  },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundImage: `linear-gradient(95deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 50%, ${theme.palette.primary.dark} 100%)`,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 3,
    border: 0,
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    borderRadius: 1,
  },
}));

const ColorlibStepIconRoot = styled('div')<{
  ownerState: { completed?: boolean; active?: boolean };
}>(({ theme, ownerState }) => ({
  backgroundColor: alpha(theme.palette.primary.main, 0.1),
  zIndex: 1,
  color: theme.palette.primary.main,
  width: 50,
  height: 50,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: `0 4px 10px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: 'scale(1.1)',
  }),
  ...(ownerState.completed && {
    backgroundColor: theme.palette.primary.dark,
    color: theme.palette.primary.contrastText,
  }),
}));

function ColorlibStepIcon(props: StepIconProps) {
  const { active, completed, className } = props;

  const icons: { [index: string]: React.ReactElement } = {
    1: <Person />,
    2: <Lock />,
    3: <Security />,
  };

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)]}
    </ColorlibStepIconRoot>
  );
}

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const navigate = useNavigate();
  const { error, loading, handleError, startLoading, stopLoading } = useApiError();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const theme = useTheme();
  const [activeStep, setActiveStep] = useState(0);
  const steps = ['Account Info', 'Security', 'Verification'];
  const [captchaToken, setCaptchaToken] = useState<string>('');
  // Use Google's special test key for development
  const [siteKey, setSiteKey] = useState<string>('6Lc8-vwqAAAAAM6pSulL7ReN7X2tG1sIBoG-YCjC');
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  useEffect(() => {
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
  }, []);

  const validateStep = (step: number): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (step === 0) {
      if (!formData.username || formData.username.length < 3) {
        errors.username = 'Username must be at least 3 characters long';
        isValid = false;
      }

      if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
        isValid = false;
      }
    } else if (step === 1) {
      if (!formData.password || formData.password.length < 6) {
        errors.password = 'Password must be at least 6 characters long';
        isValid = false;
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
        isValid = false;
      }
    } else if (step === 2) {
      if (!captchaToken) {
        errors.captcha = 'Please complete the CAPTCHA verification';
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (!formData.username || formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters long';
      isValid = false;
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.password || formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    if (!captchaToken) {
      errors.captcha = 'Please complete the CAPTCHA verification';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      startLoading();
      const response = await apiService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        captchaResponse: captchaToken,
        // Set tfaEnabled to false initially - will be set by the user in the next step
        tfaEnabled: false
      });
      
      // After successful registration, redirect to the TFA selection page
      navigate('/tfa-selection', { 
        state: { 
          username: formData.username,
          email: formData.email
        } 
      });
    } catch (error) {
      handleError(error);
      // Reset the reCAPTCHA on error
      recaptchaRef.current?.reset();
      setCaptchaToken('');
    } finally {
      stopLoading();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prevStep => prevStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prevStep => prevStep - 1);
  };

  const toggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(prev => !prev);
  };

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token || '');
    if (token) {
      setFormErrors(prev => ({
        ...prev,
        captcha: undefined
      }));
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Fade in={activeStep === 0} timeout={500}>
            <Box>
              <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.username}
                helperText={formErrors.username}
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
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.email}
                helperText={formErrors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="primary" />
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
            </Box>
          </Fade>
        );
      case 1:
        return (
          <Fade in={activeStep === 1} timeout={500}>
            <Box>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.password}
                helperText={formErrors.password}
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
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                error={!!formErrors.confirmPassword}
                helperText={formErrors.confirmPassword}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="primary" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={toggleShowConfirmPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
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
              
              <Box sx={{ 
                mt: 1,
                p: 2, 
                borderRadius: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.08),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="subtitle2" color="info.main" fontWeight={600} sx={{ mb: 1 }}>
                  Password Tips:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  • Use at least 8 characters
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  • Include uppercase and lowercase letters
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Include numbers and special characters
                </Typography>
              </Box>
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={activeStep === 2} timeout={500}>
            <Box>
              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
                Complete Security Verification
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                {siteKey && (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    onChange={handleCaptchaChange}
                  />
                )}
              </Box>
              
              {formErrors.captcha && (
                <Alert severity="error" variant="filled" sx={{ mt: 2, borderRadius: 2 }}>
                  {formErrors.captcha}
                </Alert>
              )}
              
              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: alpha(theme.palette.success.main, 0.08),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                  display: captchaToken ? 'flex' : 'none',
                  alignItems: 'center',
                  gap: 1.5
                }}
              >
                <CheckCircle color="success" />
                <Typography variant="body2" color="success.dark" fontWeight={500}>
                  CAPTCHA verification complete. Ready to create your account!
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  color="inherit"
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 8,
                    px: 4,
                    py: 1.2,
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`
                  }}
                  startIcon={<ArrowBack />}
                >
                  Back
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !captchaToken}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 8,
                    px: 4,
                    py: 1.2,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.5)}`,
                    '&:hover': {
                      boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.6)}`,
                      transform: 'translateY(-2px)'
                    },
                    transition: 'all 0.3s ease'
                  }}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <HowToReg />}
                >
                  Create Account
                </Button>
              </Box>
            </Box>
          </Fade>
        );
      default:
        return null;
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
      {/* Enhanced background elements */}
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
                <AccountCircle sx={{ fontSize: 40 }} />
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
                  Create Account
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Sign up to get started with secure authentication
                </Typography>
              </Box>

              <Stepper 
                activeStep={activeStep} 
                alternativeLabel 
                connector={<ColorlibConnector />}
                sx={{ width: '100%', mb: 4 }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Fade in={!!error} timeout={500}>
                <Box sx={{ mb: 3, width: '100%', display: error ? 'block' : 'none' }}>
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

              <Box sx={{ mt: 1, width: '100%' }}>
                {renderStepContent(activeStep)}
              </Box>

              {activeStep !== 2 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, width: '100%' }}>
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    color="inherit"
                    sx={{
                      visibility: activeStep === 0 ? 'hidden' : 'visible',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 8,
                      px: 3,
                      py: 1.2,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.2)}`
                    }}
                    startIcon={<ArrowBack />}
                  >
                    Back
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 8,
                      px: 3,
                      py: 1.2,
                      background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                      '&:hover': {
                        boxShadow: `0 6px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                    endIcon={<ArrowForward />}
                  >
                    Next
                  </Button>
                </Box>
              )}

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Already have an account?
                </Typography>
                <Link 
                  href="/login" 
                  underline="hover" 
                  fontWeight="700" 
                  color="primary.main"
                  sx={{
                    textDecoration: 'none',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: theme.palette.primary.dark
                    }
                  }}
                >
                  Sign In
                </Link>
              </Box>
            </Paper>
          </Grow>
        </Container>
      </Fade>
    </Box>
  );
};

export default Register;
