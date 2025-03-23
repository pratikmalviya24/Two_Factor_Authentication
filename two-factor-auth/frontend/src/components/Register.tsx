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
  Switch
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
  CheckCircle
} from '@mui/icons-material';

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  captcha?: string;
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
  const steps = ['Create Account', 'Security Details', 'Verification'];
  const [captchaToken, setCaptchaToken] = useState<string>('');
  // Use Google's special test key for development
  const [siteKey, setSiteKey] = useState<string>('6LeY4_oqAAAAAAbHgvetFulQ-McPyqhCsPjtBtHl');
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
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.8)
                    },
                    transition: 'all 0.3s ease'
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
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.8)
                    },
                    transition: 'all 0.3s ease'
                  }
                }}
              />
            </Box>
          </Fade>
        );
      case 2:
        return (
          <Fade in={activeStep === 2} timeout={500}>
            <Box>
              <Typography variant="h6" sx={{ my: 2, textAlign: 'center' }}>
                Complete CAPTCHA Verification
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                {siteKey && (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    onChange={handleCaptchaChange}
                  />
                )}
              </Box>
              
              {formErrors.captcha && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {formErrors.captcha}
                </Alert>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  onClick={handleBack}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: 6,
                    px: 4
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
                    fontWeight: 600,
                    borderRadius: 6,
                    px: 4
                  }}
                  endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <HowToReg />}
                >
                  Register
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
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.2)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
        position: 'relative',
        overflow: 'hidden',
        pt: 4,
        pb: 8
      }}
    >
      {/* Background elements */}
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
                Create Account
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                Complete the steps to create your secure account
              </Typography>

              <Stepper activeStep={activeStep} sx={{ width: '100%', mb: 4 }}>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Fade in={!!error} timeout={500}>
                <Box sx={{ mb: 2, width: '100%', display: error ? 'block' : 'none' }}>
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

              <Box sx={{ mt: 2, width: '100%' }}>
                {renderStepContent(activeStep)}
              </Box>

              {activeStep !== 2 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3, width: '100%' }}>
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0}
                    sx={{
                      visibility: activeStep === 0 ? 'hidden' : 'visible',
                      textTransform: 'none',
                      fontWeight: 600,
                      borderRadius: 6,
                      px: 4
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
                      borderRadius: 6,
                      px: 4
                    }}
                    endIcon={<ArrowForward />}
                  >
                    Next
                  </Button>
                </Box>
              )}

              <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link href="/login" underline="hover" fontWeight="600" color="primary.main">
                    Sign In
                  </Link>
                </Typography>
              </Box>
            </Paper>
          </Grow>
        </Container>
      </Fade>
    </Box>
  );
};

export default Register;
