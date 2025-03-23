import React, { useState, useEffect, useRef } from 'react';
import styles from './Dashboard.module.css';
import { 
  Container, 
  Paper, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  Grid,
  Alert,
  Fade,
  Grow,
  Zoom,
  Slide,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Divider,
  Tooltip,
  Menu,
  MenuItem,
  Avatar,
  useTheme,
  alpha,
  Badge
} from '@mui/material';
import { 
  AccountCircle, 
  Security, 
  Shield, 
  Lock, 
  Refresh, 
  Computer, 
  Smartphone, 
  LocationOn, 
  ExitToApp,
  VpnKey,
  Check,
  Warning,
  NotificationsActive,
  Schedule,
  History,
  Assessment,
  FindInPage,
  VerifiedUser,
  Category,
  Person,
  Logout,
  Dashboard as DashboardIcon,
  LockPerson,
  SettingsSuggest,
  Brightness7,
  KeyboardDoubleArrowUp,
  Analytics,
  TrendingUp,
  Fingerprint,
  Article,
  BugReport,
  PhishingRounded,
  MobileFriendly,
  Speed
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useApiError } from '../hooks/useApiError';
import { useNavigate } from 'react-router-dom';

interface LoginActivity {
  deviceType: string;
  location: string;
  timestamp: string;
  deviceIcon: JSX.Element;
}

interface SecurityEvent {
  type: 'warning' | 'info' | 'success' | 'error';
  message: string;
  timestamp: string;
  icon: JSX.Element;
}

interface SecurityMetric {
  label: string;
  score: number;
  description: string;
  icon: JSX.Element;
}

const securityMetrics: SecurityMetric[] = [
  {
    label: 'Password Strength',
    score: 85,
    description: 'Strong password with mix of characters',
    icon: <Lock />
  },
  {
    label: 'Authentication',
    score: 70,
    description: '2FA enabled on most services',
    icon: <VpnKey />
  },
  {
    label: 'Device Security',
    score: 90,
    description: 'All devices up to date',
    icon: <Computer />
  },
  {
    label: 'Account Recovery',
    score: 100,
    description: 'Recovery options configured',
    icon: <Refresh />
  }
];

const securityEvents: SecurityEvent[] = [
  {
    type: 'warning',
    message: 'Failed login attempt from new location',
    timestamp: new Date(Date.now() - 3600000).toLocaleString(),
    icon: <Warning color="warning" />
  },
  {
    type: 'success',
    message: 'Password updated successfully',
    timestamp: new Date(Date.now() - 86400000).toLocaleString(),
    icon: <Check color="success" />
  },
  {
    type: 'info',
    message: 'New device authenticated',
    timestamp: new Date(Date.now() - 172800000).toLocaleString(),
    icon: <Computer color="info" />
  }
];

const securityChecklist = [
  { item: 'Strong Password', completed: true },
  { item: 'Two-Factor Authentication', completed: false },
  { item: 'Recovery Email Set', completed: true },
  { item: 'Recent Security Review', completed: false },
  { item: 'Backup Codes Generated', completed: true },
  { item: 'Password Manager Used', completed: true },
  { item: 'Regular Security Updates', completed: true }
];

const recentLogins: LoginActivity[] = [
  {
    deviceType: "Desktop - Chrome",
    location: "Mumbai, India",
    timestamp: new Date().toLocaleString(),
    deviceIcon: <Computer />
  },
  {
    deviceType: "iPhone 13",
    location: "Delhi, India",
    timestamp: new Date(Date.now() - 86400000).toLocaleString(),
    deviceIcon: <Smartphone />
  }
];

const securityTips = [
  "Use strong, unique passwords for each account",
  "Enable two-factor authentication whenever possible",
  "Keep your software and systems updated",
  "Be cautious of suspicious emails and links",
  "Regularly backup your important data",
  "Use encrypted connections (HTTPS) when browsing",
  "Avoid using public Wi-Fi without VPN",
  "Monitor your accounts for suspicious activity"
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { error } = useApiError();
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentTip, setCurrentTip] = useState(0);
  const [showTip, setShowTip] = useState(true);
  const [passwordStrength] = useState(75);
  const [showManage2FA, setShowManage2FA] = useState(false);
  const [showSessionManagement, setShowSessionManagement] = useState(false);
  const [showSecurityEvents, setShowSecurityEvents] = useState(false);
  const [securityScore] = useState(85);
  const [passwordExpiryDays] = useState(15);
  const [selectedMetric, setSelectedMetric] = useState<SecurityMetric | null>(null);
  const [scrolledDown, setScrolledDown] = useState(false);
  
  // User menu state
  const [userMenuAnchorEl, setUserMenuAnchorEl] = useState<null | HTMLElement>(null);
  const userMenuOpen = Boolean(userMenuAnchorEl);

  const [threatStats] = useState({
    phishingAttempts: 7,
    malwareBlocked: 12,
    vulnerabilitiesFixed: 4,
    suspiciousLogins: 2
  });
  
  const [performanceMetrics] = useState({
    responseTime: 92,
    uptime: 99.8,
    failedRequests: 0.2,
    avgLoadTime: 1.7
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setShowTip(false);
      setTimeout(() => {
        setCurrentTip((prev) => (prev + 1) % securityTips.length);
        setShowTip(true);
      }, 7000);
    }, 15000);

    const handleScroll = () => {
      setScrolledDown(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      clearInterval(timer);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [securityTips.length]);

  const handleUserMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchorEl(null);
  };

  const handleLogout = () => {
    handleUserMenuClose();
    logout();
  };

  const getPasswordStrengthColor = (strength: number) => {
    if (strength < 40) return theme.palette.error.main;
    if (strength < 70) return theme.palette.warning.main;
    return theme.palette.success.main;
  };

  const handleManage2FA = () => {
    setShowManage2FA(true);
  };

  const handleSessionManagement = () => {
    setShowSessionManagement(true);
  };

  const handleLogoutAllDevices = () => {
    // Implement logout from all devices logic here
    setShowSessionManagement(false);
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate('/profile');
  };

  const getMetricColor = (score: number) => {
    if (score >= 90) return theme.palette.success.main;
    if (score >= 70) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  // Helper functions to get alpha colors with pre-calculated values
  const getMetricColorWithAlpha = (score: number, alphaValue: number) => {
    const color = getMetricColor(score);
    // Use rgba directly instead of alpha function
    if (typeof color === 'string' && color.startsWith('#')) {
      // Convert hex to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alphaValue})`;
    }
    // Fallback to a safe color with alpha
    return `rgba(33, 150, 243, ${alphaValue})`;
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Generate avatar initials from username
  const getInitials = (name: string): string => {
    if (!name) return '';
    return name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      background: `linear-gradient(145deg, ${alpha(theme.palette.primary.light, 0.05)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
      position: 'relative',
      pb: 10 
    }}>
      {/* Scroll to Top Button */}
      <Zoom in={scrolledDown}>
        <Box
          onClick={scrollToTop}
          role="button"
          aria-label="Scroll to top"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 44,
            height: 44,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 10,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
            }
          }}
        >
          <KeyboardDoubleArrowUp />
        </Box>
      </Zoom>

      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          boxShadow: scrolledDown ? '0 4px 20px rgba(0,0,0,0.2)' : 'none',
          borderRadius: scrolledDown ? 0 : '0 0 20px 20px',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(8px)',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4 }, py: 1.5, justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Grow in={true} timeout={800}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.8,
                  borderRadius: '50%',
                  bgcolor: alpha('#fff', 0.1),
                  boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                }}
              >
                <Shield 
                  sx={{ 
                    fontSize: 24, 
                    color: 'white',
                    filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.3))'
                  }} 
                />
              </Box>
            </Grow>
            <Slide direction="right" in={true} timeout={1000}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600, 
                  letterSpacing: '0.5px',
                  display: { xs: 'none', sm: 'block' },
                  textShadow: '0px 1px 2px rgba(0,0,0,0.2)'
                }}
              >
                Security Center
          </Typography>
            </Slide>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Badge 
              color="error" 
              badgeContent={securityEvents.length}
              overlap="circular"
              invisible={securityEvents.length === 0}
            >
              <Tooltip title="Security Alerts">
          <IconButton
                  size="medium"
                  onClick={() => setShowSecurityEvents(true)}
                  sx={{ 
                    color: 'white',
                    mr: 1,
                    '&:hover': {
                      background: alpha('#fff', 0.1)
                    }
                  }}
                >
                  <Warning />
          </IconButton>
              </Tooltip>
            </Badge>
            
            <Zoom in={true} timeout={1000}>
              <Tooltip title="Account settings">
                <IconButton
                  onClick={handleUserMenuClick}
                  size="small"
                  sx={{ 
                    outline: '2px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      outline: '2px solid rgba(255,255,255,0.4)',
                      transform: 'scale(1.05)'
                    }
                  }}
                  aria-controls={userMenuOpen ? 'account-menu' : undefined}
                  aria-haspopup="true"
                  aria-expanded={userMenuOpen ? 'true' : undefined}
                >
                  <Avatar 
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      bgcolor: 'primary.dark',
                      color: 'white',
                      fontSize: '1.2rem',
                      fontWeight: 500,
                      boxShadow: '0 0 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    {user ? getInitials(user.username) : ''}
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Zoom>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar /> {/* Space for fixed AppBar */}

      {/* User dropdown menu */}
      <Menu
        anchorEl={userMenuAnchorEl}
        id="account-menu"
        open={userMenuOpen}
        onClose={handleUserMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 220,
            borderRadius: 2,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            overflow: 'visible',
            backgroundImage: 'none',
            bgcolor: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(10px)',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 18,
              width: 10,
              height: 10,
              bgcolor: 'rgba(255,255,255,0.95)',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
              borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              borderLeft: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 2, mb: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 0.5 }}>
            {user?.username}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
            {user?.email}
          </Typography>
        </Box>
        <Divider sx={{ my: 1 }} />
        <MenuItem 
          onClick={handleProfileClick}
          sx={{ 
            py: 1.5, 
            px: 2,
            borderLeft: '3px solid transparent',
            '&:hover': {
              borderLeft: `3px solid ${theme.palette.primary.main}`,
              bgcolor: alpha(theme.palette.primary.main, 0.08)
            }
          }}
        >
          <ListItemIcon>
            <Person fontSize="small" color="primary" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem 
          onClick={handleLogout}
          sx={{ 
            py: 1.5, 
            px: 2,
            borderLeft: '3px solid transparent',
            '&:hover': {
              borderLeft: `3px solid ${theme.palette.error.main}`,
              bgcolor: alpha(theme.palette.error.main, 0.08)
            }
          }}
        >
          <ListItemIcon>
            <Logout fontSize="small" color="error" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      
      <Container component="main" maxWidth="lg" sx={{ pt: 3, pb: 6 }}>
        {error && (
          <Slide direction="down" in={Boolean(error)}>
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(211, 47, 47, 0.2)'
              }}
            >
              {error}
            </Alert>
          </Slide>
        )}

        <Grid 
          container 
          spacing={3} 
          sx={{ 
            mb: 4,
            alignItems: 'stretch',
            '& .MuiCard-root': {
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 3,
              boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
              transition: 'all 0.3s ease',
              border: '1px solid rgba(0,0,0,0.05)',
              backdropFilter: 'blur(8px)',
              background: alpha('#fff', 0.9),
              '&:hover': {
                boxShadow: '0 12px 30px rgba(0,0,0,0.08)',
                transform: 'translateY(-5px)'
              }
            }
          }}
        >
          {/* Welcome Card */}
          <Grid item xs={12}>
            <Grow in={true} timeout={800}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: { xs: 2, md: 4 }, 
                  backgroundColor: alpha(theme.palette.background.paper, 0.9),
                  borderRadius: 4,
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
                }}
              >
                <Box 
                  sx={{ 
                    position: 'absolute',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.15)} 0%, rgba(0,0,0,0) 70%)`,
                    top: '-100px',
                    right: '-50px',
                    zIndex: 0
                  }}
                />
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography 
                    variant="h4" 
                    gutterBottom 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                      textShadow: '0px 1px 2px rgba(0,0,0,0.1)'
                    }}
                  >
                    <Shield 
                      sx={{ 
                        fontSize: 40,
                        filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.2))'
                      }} 
                      color="primary" 
                    />
                    Welcome {user?.username}
              </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: '800px' }}>
                    Your security dashboard gives you a complete view of your account's protection status. View security metrics, recent activities, and get personalized recommendations.
                  </Typography>
                  <Fade in={showTip} timeout={1000}>
                    <Box 
                      sx={{
                        mt: 2,
                        p: 2,
                        borderRadius: 3,
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
                      }}
                    >
                      <Typography 
                        variant="h6" 
                        color="text.secondary" 
                        className={styles.tip} 
                        sx={{ 
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          fontWeight: 500,
                          color: theme.palette.primary.dark
                        }}
                      >
                        <VerifiedUser color="primary" />
                  Security Tip: {securityTips[currentTip]}
                </Typography>
                    </Box>
              </Fade>
                </Box>
            </Paper>
            </Grow>
          </Grid>

          {/* Overall Security Score */}
          <Grid item xs={12} md={6} lg={4}>
            <Grow in={true} timeout={800} style={{ transformOrigin: '0 0' }}>
            <Card elevation={3} className={styles.securityCard}>
              <Box
                sx={{
                    p: 2.5,
                    borderRadius: '16px 16px 0 0',
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                    gap: 2,
                  color: 'white',
                }}
              >
                  <Assessment sx={{ fontSize: 28 }} />
                  <Typography variant="h6" component="div" fontWeight={600}>
                  Security Score
                </Typography>
              </Box>
                <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 3, mt: 2 }}>
                  <CircularProgress
                    variant="determinate"
                      value={100}
                      size={150}
                    thickness={4}
                      sx={{ color: alpha(theme.palette.primary.main, 0.2), position: 'absolute' }}
                    />
                    <CircularProgress
                      variant="determinate"
                      value={securityScore}
                      size={150}
                      thickness={5}
                      sx={{ 
                        color: getMetricColor(securityScore),
                        boxShadow: `0 0 10px ${getMetricColorWithAlpha(securityScore, 0.4)}`,
                        borderRadius: '50%'
                      }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                      <Typography 
                        variant="h3" 
                        color="text.primary"
                        fontWeight={700}
                        sx={{
                          background: `linear-gradient(to right, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          MozBackgroundClip: 'text',
                          MozTextFillColor: 'transparent',
                          msBackgroundClip: 'text',
                          color: 'transparent',
                        }}
                      >
                      {securityScore}
                    </Typography>
                      <Typography variant="body2" color="text.secondary" fontWeight={500}>
                      Overall Score
                    </Typography>
                  </Box>
                </Box>
                <Divider sx={{ my: 2 }} />
                <Grid container spacing={2}>
                  {securityMetrics.map((metric) => (
                    <Grid item xs={6} key={metric.label}>
                      <Tooltip title={metric.description}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                              p: 1.5, 
                            cursor: 'pointer',
                              borderRadius: 2,
                              border: `1px solid ${getMetricColorWithAlpha(metric.score, 0.3)}`,
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                bgcolor: getMetricColorWithAlpha(metric.score, 0.05),
                                transform: 'translateY(-3px)',
                                boxShadow: `0 5px 15px ${getMetricColorWithAlpha(metric.score, 0.2)}`
                              }
                          }}
                          onClick={() => setSelectedMetric(metric)}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <Box 
                                sx={{ 
                                  mr: 1, 
                                  color: getMetricColor(metric.score),
                                  display: 'flex'
                                }}
                              >
                            {metric.icon}
                          </Box>
                              <Typography variant="body2" fontWeight={600}>
                            {metric.label}
                          </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={metric.score} 
                                sx={{ 
                                  width: '75%', 
                                  height: 6, 
                                  borderRadius: 3,
                                  bgcolor: getMetricColorWithAlpha(metric.score, 0.1)
                                }} 
                              />
                              <Typography variant="caption" fontWeight={700} color={getMetricColor(metric.score)}>
                                {metric.score}%
                              </Typography>
                            </Box>
                        </Card>
                      </Tooltip>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
            </Grow>
          </Grid>

          {/* Security Checklist */}
          <Grid item xs={12} md={6} lg={4}>
            <Card elevation={3} className={styles.securityCard}>
              <Box
                sx={{
                  height: '120px',
                  background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("/security-images/security-checklist.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mb: 2
                }}
              >
                <Typography variant="h4" component="div">
                  Security Checklist
                </Typography>
              </Box>
              <CardContent>
                <List dense>
                  {securityChecklist.map((item, index) => (
                    <ListItem key={index} className={styles.listItem}>
                      <ListItemIcon>
                        {item.completed ? (
                          <VerifiedUser color="success" />
                        ) : (
                          <Warning color="warning" />
                        )}
                      </ListItemIcon>
                      <ListItemText 
                        primary={item.item}
                        secondary={item.completed ? "Completed" : "Action needed"}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Events */}
          <Grid item xs={12} md={6} lg={4}>
            <Card elevation={3} className={styles.securityCard}>
              <Box
                sx={{
                  height: '120px',
                  background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("/security-images/security-events.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mb: 2
                }}
              >
                <Typography variant="h4" component="div">
                  Security Events
                </Typography>
              </Box>
              <CardContent>
                <List>
                  {securityEvents.map((event, index) => (
                    <ListItem key={index} className={styles.listItem}>
                      <ListItemIcon className={styles.deviceIcon}>
                        {event.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={event.message}
                        secondary={event.timestamp}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={() => setShowSecurityEvents(true)}
                  startIcon={<History />}
                  className={styles.pulseButton}
                  sx={{ mt: 2 }}
                >
                  View All Events
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Password Status */}
          <Grid item xs={12} md={6} lg={4}>
            <Card elevation={3} className={styles.securityCard}>
              <Box
                sx={{
                  height: '120px',
                  background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("/security-images/password-status.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mb: 2
                }}
              >
                <Typography variant="h4" component="div">
                  Password Status
                </Typography>
              </Box>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={(passwordExpiryDays / 90) * 100}
                      size={80}
                      thickness={4}
                      sx={{ color: passwordExpiryDays < 15 ? theme.palette.error.main : theme.palette.success.main }}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {passwordExpiryDays}d
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Password Expires in:
                    </Typography>
                    <Typography variant="h6">
                      {passwordExpiryDays} days
                    </Typography>
                  </Box>
                </Box>
                <Alert severity={passwordExpiryDays < 15 ? "warning" : "info"}>
                  {passwordExpiryDays < 15
                    ? `Your password will expire in ${passwordExpiryDays} days`
                    : `Password valid for ${passwordExpiryDays} more days`}
                </Alert>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                  startIcon={<VpnKey />}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Login Activity */}
          <Grid item xs={12} md={6} lg={4}>
            <Card elevation={3} className={styles.securityCard}>
              <Box
                sx={{
                  height: '120px',
                  background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("/security-images/login-activity.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mb: 2
                }}
              >
                <Typography variant="h4" component="div">
                  Login Activity
                </Typography>
              </Box>
              <CardContent>
                <List>
                  {recentLogins.map((login, index) => (
                    <ListItem key={index} className={styles.listItem} sx={{ pl: 0 }}>
                      <ListItemIcon className={styles.deviceIcon}>
                        {login.deviceIcon}
                      </ListItemIcon>
                      <ListItemText
                        primary={login.deviceType}
                        secondary={
                          <>
                            <LocationOn sx={{ fontSize: 12, mr: 0.5, verticalAlign: 'middle' }} />
                            {login.location} • {login.timestamp}
                          </>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  fullWidth
                  variant="outlined"
                  color="primary"
                  onClick={handleSessionManagement}
                  startIcon={<ExitToApp />}
                  className={styles.pulseButton}
                  sx={{ mt: 2 }}
                >
                  Manage Active Sessions
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Security Recommendations */}
          <Grid item xs={12} md={6} lg={4}>
            <Card elevation={3} className={styles.securityCard}>
              <Box
                sx={{
                  height: '120px',
                  background: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url("/security-images/security-recommendations.jpg")',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  mb: 2
                }}
              >
                <Typography variant="h4" component="div">
                  Recommendations
                </Typography>
              </Box>
              <CardContent>
                <Box sx={{ display: 'grid', gap: 2 }}>
                  {!user?.tfaEnabled && (
                    <Alert severity="warning">
                      Enable two-factor authentication to enhance your account security
                    </Alert>
                  )}
                  {passwordExpiryDays < 30 && (
                    <Alert severity="info">
                      Consider updating your password soon
                    </Alert>
                  )}
                  <Alert severity="success">
                    Your account is protected with secure encryption
                  </Alert>
                  <Alert severity="info">
                    Review your security settings regularly
                  </Alert>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* NEW: Threat Prevention Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} className={styles.securityCard}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '16px 16px 0 0',
                  background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: 'white',
                }}
              >
                <BugReport sx={{ fontSize: 28 }} />
                <Typography variant="h6" component="div" fontWeight={600}>
                  Threat Prevention
                </Typography>
              </Box>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <PhishingRounded sx={{ mr: 1, color: theme.palette.warning.main }} />
                        <Typography variant="body2" fontWeight={600}>
                          Phishing Attempts
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {threatStats.phishingAttempts}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Blocked this month
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <BugReport sx={{ mr: 1, color: theme.palette.error.main }} />
                        <Typography variant="body2" fontWeight={600}>
                          Malware
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {threatStats.malwareBlocked}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Threats blocked
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Fingerprint sx={{ mr: 1, color: theme.palette.success.main }} />
                        <Typography variant="body2" fontWeight={600}>
                          Suspicious Logins
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {threatStats.suspiciousLogins}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Prevented attempts
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Article sx={{ mr: 1, color: theme.palette.info.main }} />
                        <Typography variant="body2" fontWeight={600}>
                          Vulnerabilities
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {threatStats.vulnerabilitiesFixed}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Fixed this week
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* NEW: Performance Metrics Card */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} className={styles.securityCard}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '16px 16px 0 0',
                  background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  color: 'white',
                }}
              >
                <Analytics sx={{ fontSize: 28 }} />
                <Typography variant="h6" component="div" fontWeight={600}>
                  Performance Metrics
                </Typography>
              </Box>
              <CardContent sx={{ p: 3, flexGrow: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <TrendingUp sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="body2" fontWeight={600}>
                          Uptime
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {performanceMetrics.uptime}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Service availability
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Speed sx={{ mr: 1, color: theme.palette.success.main }} />
                        <Typography variant="body2" fontWeight={600}>
                          Response Time
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {performanceMetrics.responseTime}ms
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Average response
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Warning sx={{ mr: 1, color: theme.palette.error.main }} />
                        <Typography variant="body2" fontWeight={600}>
                          Failed Requests
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {performanceMetrics.failedRequests}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Error rate
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <MobileFriendly sx={{ mr: 1, color: theme.palette.info.main }} />
                        <Typography variant="body2" fontWeight={600}>
                          Load Time
                        </Typography>
                      </Box>
                      <Typography variant="h4" color="text.primary" fontWeight={700}>
                        {performanceMetrics.avgLoadTime}s
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Average page load
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 2FA Management Dialog */}
        <Dialog open={showManage2FA} onClose={() => setShowManage2FA(false)}>
          <DialogTitle>Manage Two-Factor Authentication</DialogTitle>
          <DialogContent>
            <Box sx={{ p: 2 }}>
              <Typography variant="body1" gutterBottom>
                {user?.tfaEnabled ? (
                  <>
                    <Check color="success" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    2FA is currently enabled and protecting your account
                  </>
                ) : (
                  <>
                    <Warning color="warning" sx={{ verticalAlign: 'middle', mr: 1 }} />
                    Enable 2FA to add an extra layer of security
                  </>
                )}
              </Typography>
              <Button
                variant="contained"
                color={user?.tfaEnabled ? "error" : "primary"}
                sx={{ mt: 2 }}
                startIcon={user?.tfaEnabled ? <Lock /> : <VpnKey />}
              >
                {user?.tfaEnabled ? "Disable 2FA" : "Enable 2FA"}
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowManage2FA(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Session Management Dialog */}
        <Dialog open={showSessionManagement} onClose={() => setShowSessionManagement(false)}>
          <DialogTitle>Active Sessions</DialogTitle>
          <DialogContent>
            <List>
              {recentLogins.map((login, index) => (
                <ListItem key={index} className={styles.listItem}>
                  <ListItemIcon className={styles.deviceIcon}>
                    {login.deviceIcon}
                  </ListItemIcon>
                  <ListItemText
                    primary={login.deviceType}
                    secondary={`${login.location} • ${login.timestamp}`}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSessionManagement(false)}>Close</Button>
            <Button 
              variant="contained" 
              color="error" 
              onClick={handleLogoutAllDevices}
              startIcon={<ExitToApp />}
            >
              Logout All Devices
            </Button>
          </DialogActions>
        </Dialog>

        {/* Security Events Dialog */}
        <Dialog 
          open={showSecurityEvents} 
          onClose={() => setShowSecurityEvents(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Security Event History</DialogTitle>
          <DialogContent>
            <List>
              {[...securityEvents, ...securityEvents].map((event, index) => (
                <ListItem key={index} className={styles.listItem}>
                  <ListItemIcon className={styles.deviceIcon}>
                    {event.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={event.message}
                    secondary={event.timestamp}
                  />
                </ListItem>
              ))}
            </List>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowSecurityEvents(false)}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Security Metric Detail Dialog */}
        <Dialog 
          open={Boolean(selectedMetric)} 
          onClose={() => setSelectedMetric(null)}
          maxWidth="sm"
          fullWidth
        >
          {selectedMetric && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedMetric.icon}
                  {selectedMetric.label}
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <CircularProgress
                      variant="determinate"
                      value={selectedMetric.score}
                      size={60}
                      thickness={4}
                      sx={{ color: getMetricColor(selectedMetric.score) }}
                    />
                    <Typography variant="h6">
                      Score: {selectedMetric.score}%
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph>
                    {selectedMetric.description}
                  </Typography>
                  <Alert severity="info">
                    Keep monitoring this metric to maintain optimal security.
                  </Alert>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setSelectedMetric(null)}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </Box>
  );
};

export default Dashboard;
