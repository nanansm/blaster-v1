// WPPConnect API Service

const WPPCONNECT_BASE_URL = process.env.WPPCONNECT_BASE_URL || 'http://localhost:21465'
const WPPCONNECT_SECRET_KEY = process.env.WPPCONNECT_SECRET_KEY || ''

interface WPPConnectResponse {
  status: number
  data?: any
  message?: string
}

export class WPPConnectService {
  private baseUrl: string
  private secretKey: string

  constructor() {
    this.baseUrl = WPPCONNECT_BASE_URL
    this.secretKey = WPPCONNECT_SECRET_KEY
  }

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.secretKey}`,
    }
  }

  async createInstance(sessionName: string): Promise<WPPConnectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${sessionName}/start`, {
        method: 'POST',
        headers: this.getHeaders(),
      })
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error creating WPPConnect instance:', error)
      return { status: 500, message: 'Failed to create instance' }
    }
  }

  async getQrCode(sessionName: string): Promise<WPPConnectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${sessionName}/qr-code`, {
        headers: this.getHeaders(),
      })
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error getting QR code:', error)
      return { status: 500, message: 'Failed to get QR code' }
    }
  }

  async sendMessage(
    sessionName: string,
    phoneNumber: string,
    message: string
  ): Promise<WPPConnectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${sessionName}/send-message`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          phone: phoneNumber,
          message: message,
        }),
      })
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error sending message:', error)
      return { status: 500, message: 'Failed to send message' }
    }
  }

  async getInstanceStatus(sessionName: string): Promise<WPPConnectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${sessionName}/status`, {
        headers: this.getHeaders(),
      })
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error getting instance status:', error)
      return { status: 500, message: 'Failed to get instance status' }
    }
  }

  async closeInstance(sessionName: string): Promise<WPPConnectResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/${sessionName}/close`, {
        method: 'POST',
        headers: this.getHeaders(),
      })
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error closing instance:', error)
      return { status: 500, message: 'Failed to close instance' }
    }
  }
}

export const wppconnectService = new WPPConnectService()
