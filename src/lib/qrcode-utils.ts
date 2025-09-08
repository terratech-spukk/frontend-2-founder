import QRCode from 'qrcode';

export interface QRCodeData {
  username: string;
  password: string;
  autoLoginUrl: string;
  qrCodeImage: string;
  generatedAt: string;
  expiresAt: string;
  full_name: string;
  phone_number: string;
}

export async function generateQRCodeImage(url: string): Promise<string> {
  try {
    // Generate QR code as base64 data URL
    const qrCodeDataURL = await QRCode.toDataURL(url, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Return a placeholder if QR code generation fails
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  }
}

export function generateQRCodeData(username: string, password: string, baseUrl: string, full_name: string, phone_number: string): QRCodeData {
  const autoLoginUrl = `${baseUrl}/login/qrcode?loginname=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;
  const generatedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours from now
  
  return {
    username,
    password,
    autoLoginUrl,
    qrCodeImage: '', // Will be filled by generateQRCodeImage
    generatedAt,
    expiresAt,
    full_name,
    phone_number
  };
}
