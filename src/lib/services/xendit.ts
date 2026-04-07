// Xendit Payment Gateway Service

const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY || ''

interface XenditResponse {
  status: number
  data?: any
  error_code?: string
  message?: string
}

export class XenditService {
  private secretKey: string
  private baseUrl: string

  constructor() {
    this.secretKey = XENDIT_SECRET_KEY
    this.baseUrl = 'https://api.xendit.co'
  }

  private getHeaders(): HeadersInit {
    const auth = Buffer.from(`${this.secretKey}:`).toString('base64')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${auth}`,
    }
  }

  async createSubscription(
    customerId: string,
    planCode: string,
    currency: string = 'IDR'
  ): Promise<XenditResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscription_plans`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          customer_id: customerId,
          plan_code: planCode,
          currency,
        }),
      })
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error creating Xendit subscription:', error)
      return { status: 500, message: 'Failed to create subscription' }
    }
  }

  async getSubscription(subscriptionId: string): Promise<XenditResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        headers: this.getHeaders(),
      })
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error getting Xendit subscription:', error)
      return { status: 500, message: 'Failed to get subscription' }
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<XenditResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/subscriptions/${subscriptionId}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      })
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error canceling Xendit subscription:', error)
      return { status: 500, message: 'Failed to cancel subscription' }
    }
  }

  async getInvoices(limit: number = 10): Promise<XenditResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/invoices?limit=${limit}`,
        { headers: this.getHeaders() }
      )
      const data = await response.json()
      return { status: response.status, data }
    } catch (error) {
      console.error('Error getting Xendit invoices:', error)
      return { status: 500, message: 'Failed to get invoices' }
    }
  }

  // Verify webhook signature
  verifyWebhookSignature(payload: string, signature: string): boolean {
    // Implement webhook signature verification based on Xendit docs
    // This is a simplified version
    return true
  }
}

export const xenditService = new XenditService()
