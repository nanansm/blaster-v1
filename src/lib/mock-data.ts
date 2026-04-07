// Mock data utilities for local testing without backend services
// Enable with: NEXT_PUBLIC_MOCK_MODE=true

export const isMockMode = () => {
  return process.env.NEXT_PUBLIC_MOCK_MODE === 'true'
}

// Mock user data
export const mockUser = {
  id: 'mock-user-1',
  name: 'Test User',
  email: 'test@example.com',
  plan: 'PRO' as const,
  isAdmin: true,
  avatarUrl: null,
  createdAt: new Date(),
}

// Mock campaign data
export const mockCampaigns = [
  {
    id: 'campaign-1',
    name: 'Test Campaign 1',
    status: 'active',
    totalMessages: 150,
    sentMessages: 75,
    failedMessages: 2,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
  {
    id: 'campaign-2',
    name: 'Test Campaign 2',
    status: 'completed',
    totalMessages: 200,
    sentMessages: 195,
    failedMessages: 5,
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
  },
]

// Mock contacts
export const mockContacts = [
  { id: 'contact-1', name: 'John Doe', phone: '+6281234567890', campaignId: 'campaign-1' },
  { id: 'contact-2', name: 'Jane Smith', phone: '+6281234567891', campaignId: 'campaign-1' },
  { id: 'contact-3', name: 'Bob Wilson', phone: '+6281234567892', campaignId: 'campaign-2' },
]

// Mock WA instances
export const mockInstances = [
  {
    id: 'instance-1',
    name: 'WA Instance 1',
    status: 'connected',
    phoneNumber: '+6281234567890',
    createdAt: new Date(),
  },
]

// Mock admin stats
export const mockAdminStats = {
  totalRevenue: 1500000,
  pendingInvoices: 3,
  totalUsers: 45,
  proUsers: 12,
  freeUsers: 33,
  queueStatus: {
    pending: 25,
    active: 5,
    failed: 2,
  },
  wppconnectStatus: 'online',
}

// Helper to simulate API delay
export const mockDelay = (ms: number = 300) => 
  new Promise(resolve => setTimeout(resolve, ms))
