import React, { useEffect, useState } from 'react';
import { getTfaSettings, updateTfaSettings } from '../services/profileService';
import { Switch, Box, Typography, Paper } from '@mui/material';

const ProfilePage: React.FC = () => {
    const [tfaEnabled, setTfaEnabled] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        loadTfaSettings();
    }, []);

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

    const handleTfaToggle = async () => {
        try {
            const updatedSettings = await updateTfaSettings(!tfaEnabled);
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
                <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                    <Typography>
                        Two-Factor Authentication
                    </Typography>
                    <Switch
                        checked={tfaEnabled}
                        onChange={handleTfaToggle}
                        inputProps={{ 'aria-label': 'toggle two-factor authentication' }}
                    />
                    <Typography variant="body2" color="textSecondary" sx={{ marginLeft: 2 }}>
                        {tfaEnabled ? 'Enabled' : 'Disabled'}
                    </Typography>
                </Box>
                {tfaEnabled && (
                    <Typography variant="body2" color="info.main" sx={{ marginTop: 1 }}>
                        You will be required to enter a verification code when signing in.
                    </Typography>
                )}
            </Paper>
        </Box>
    );
};

export default ProfilePage;
