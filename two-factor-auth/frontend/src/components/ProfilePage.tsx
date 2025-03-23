import React, { useEffect, useState } from 'react';
import { getTfaSettings, updateTfaSettings } from '../services/profileService';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Security } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
    const [tfaEnabled, setTfaEnabled] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const navigate = useNavigate();

    // Define loadTfaSettings before useEffect to avoid reference changes
    const loadTfaSettings = async () => {
        try {
            const settings = await getTfaSettings();
            setTfaEnabled(settings.enabled);
        } catch (error) {
            console.error('Failed to load TFA settings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadTfaSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleEnableTfa = () => {
        navigate('/verify-2fa', { 
            state: { 
                setupMode: true,
                tfaType: 'APP',
                selectedMethod: 'APP',
                fromProfile: true,
                username: localStorage.getItem('username') || '',
                skipMethodSelection: true
            } 
        });
    };

    const handleDisableTfa = async () => {
        try {
            const updatedSettings = await updateTfaSettings(false);
            setTfaEnabled(updatedSettings.enabled);
        } catch (error) {
            console.error('Failed to update TFA settings:', error);
        }
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 3 }}>
            <Paper elevation={3} sx={{ padding: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Profile Settings
                </Typography>
                <Box sx={{ marginTop: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                        <Security color={tfaEnabled ? "success" : "action"} sx={{ marginRight: 1 }} />
                        <Typography variant="h6">
                            Two-Factor Authentication
                        </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                        {tfaEnabled 
                            ? "Two-factor authentication is currently enabled. You will be required to enter a verification code when signing in." 
                            : "Enable two-factor authentication to add an extra layer of security to your account."}
                    </Typography>
                    
                    {!tfaEnabled ? (
                        <Button 
                            variant="contained" 
                            color="primary"
                            onClick={handleEnableTfa}
                        >
                            Enable Two-Factor Authentication
                        </Button>
                    ) : (
                        <Button 
                            variant="outlined" 
                            color="error"
                            onClick={handleDisableTfa}
                        >
                            Disable Two-Factor Authentication
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default ProfilePage;
