import { TfaSettings } from '../types/profile';
import axiosInstance from './axiosConfig';

export const getTfaSettings = async (): Promise<TfaSettings> => {
    const response = await axiosInstance.get('/profile/tfa-settings');
    return response.data;
};

export const updateTfaSettings = async (enabled: boolean): Promise<TfaSettings> => {
    try {
        console.log("Sending TFA update request:", { enabled });
        const response = await axiosInstance.put('/profile/tfa-settings', { enabled });
        console.log("TFA update response:", response.data);
        
        if (!response.data) {
            throw new Error("Invalid response from server");
        }
        
        return response.data;
    } catch (error) {
        console.error("Error in updateTfaSettings:", error);
        throw error;
    }
};

export const verifyAndEnableTfa = async (code: string, tfaType: 'APP' | 'EMAIL'): Promise<TfaSettings> => {
    const response = await axiosInstance.post('/profile/verify-and-enable-tfa', { 
        enabled: true, 
        code, 
        tfaType 
    });
    return response.data.data;
};
