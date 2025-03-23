import axiosInstance from './axiosConfig';

interface CaptchaResponse {
  siteKey: string;
}

class CaptchaService {
  private siteKey: string | null = null;

  async getSiteKey(): Promise<string> {
    if (this.siteKey) {
      return this.siteKey;
    }

    try {
      const response = await axiosInstance.get<CaptchaResponse>('/auth/captcha-site-key');
      this.siteKey = response.data.siteKey;
      return this.siteKey;
    } catch (error) {
      console.error('Failed to fetch reCAPTCHA site key:', error);
      // Use Google's special test key for development
      this.siteKey = '6Lc8-vwqAAAAAM6pSulL7ReN7X2tG1sIBoG-YCjC';
      return this.siteKey;
    }
  }
}

export const captchaService = new CaptchaService();
export default captchaService; 