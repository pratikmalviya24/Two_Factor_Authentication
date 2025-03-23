import { TfaSettings } from '../types/profile';
import axiosInstance from './axiosConfig';

export const getTfaSettings = async (): Promise<TfaSettings> => {
    const response = await axiosInstance.get('/profile/tfa-settings');
    return response.data;
};

export const updateTfaSettings = async (enabled: boolean): Promise<TfaSettings> => {
    const response = await axiosInstance.put('/profile/tfa-settings', { enabled });
    return response.data;
};
