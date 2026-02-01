
import { vi } from 'vitest'

class WhopMock {
    constructor(config: any) {
        // console.log('Mock Whop initialized')
    }

    checkoutConfigurations = {
        create: vi.fn().mockResolvedValue({
            id: 'sess_test_123',
            purchase_url: 'https://whop.com/checkout/test', // Code uses purchase_url
            status: 'open',
        }),
    }

    memberships = {
        get: vi.fn().mockResolvedValue({
            id: 'mem_test_123',
            valid: true,
            status: 'active',
            user: {
                id: 'user_123',
                email: 'test@example.com',
                username: 'testuser'
            }
        }),
        retrieve: vi.fn().mockResolvedValue({
            id: 'mem_test_123',
            valid: true,
            status: 'active',
            user: {
                id: 'user_123',
                email: 'test@example.com',
                username: 'testuser'
            }
        }),
    }

    resources = {
        retrieve: vi.fn()
    }

    webhooks = {
        unwrap: vi.fn().mockReturnValue({
            id: 'evt_test',
            type: 'test.event',
            data: {}
        })
    }
}

export default WhopMock
export { WhopMock as Whop }
