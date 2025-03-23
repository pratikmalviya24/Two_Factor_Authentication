import { AxiosResponse } from 'axios';
import axiosInstance from './axiosConfig';
import {
  LoginResponse,
  RegisterResponse,
  TwoFactorSetupResponse,
  TwoFactorVerifyResponse,
  UserProfile,
  LoginRequest,
  RegisterRequest,
  TwoFactorVerifyRequest,
  PasswordResetResponse
} from '../types/auth';

class ApiService {
  async login(username: string, password: string, captchaResponse: string): Promise<AxiosResponse<LoginResponse>> {
    try {
      return await axiosInstance.post<LoginResponse>('/auth/signin', { 
        username, 
        password, 
        captchaResponse 
      });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async register(request: RegisterRequest): Promise<AxiosResponse<RegisterResponse>> {
    try {
      return await axiosInstance.post<RegisterResponse>('/auth/signup', request);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async setupTwoFactor(username: string, tfaType: 'APP' | 'EMAIL'): Promise<AxiosResponse<TwoFactorSetupResponse>> {
    try {
      return await axiosInstance.post<TwoFactorSetupResponse>('/auth/setup-2fa', { username, tfaType });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async verifyTwoFactor(request: TwoFactorVerifyRequest): Promise<AxiosResponse<TwoFactorVerifyResponse>> {
    try {
      return await axiosInstance.post<TwoFactorVerifyResponse>('/auth/verify-2fa', request);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserProfile(): Promise<AxiosResponse<UserProfile>> {
    try {
      return await axiosInstance.get<UserProfile>('/auth/profile');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async deleteAccount(): Promise<AxiosResponse<void>> {
    try {
      return await axiosInstance.post('/auth/delete-account');
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async initiatePasswordReset(username?: string): Promise<AxiosResponse<{ message: string }>> {
    try {
      // If username is provided, use it for non-authenticated password reset
      if (username) {
        return await axiosInstance.post<{ message: string }>('/password/forgot-password', { username });
      }
      // Otherwise use the authenticated endpoint for logged-in users
      return await axiosInstance.post<{ message: string }>('/password/reset-request');
    } catch (error) {
      console.error('Password reset error:', error);
      throw this.handleError(error);
    }
  }

  async validatePasswordResetToken(token: string): Promise<AxiosResponse<{ valid: boolean, username: string }>> {
    try {
      return await axiosInstance.post<{ valid: boolean, username: string }>('/password/validate-token', { token });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<AxiosResponse<{ message: string }>> {
    try {
      return await axiosInstance.post<{ message: string }>('/password/reset', { token, newPassword });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    console.error('API Error:', error);
    
    if (error.response?.data) {
      // The server responded with an error
      if (typeof error.response.data === 'string') {
        // Handle plain text error responses
        return new Error(error.response.data);
      }
      // Handle ErrorResponse object
      return new Error(error.response.data.message || 'An error occurred');
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('No response received from server. Please check your network connection and try again.');
    } else {
      // Something happened in setting up the request
      return new Error('Error setting up the request. Please try again later.');
    }
  }
}

export const apiService = new ApiService();
export default apiService;
