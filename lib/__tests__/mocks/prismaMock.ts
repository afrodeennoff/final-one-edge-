
import { vi } from 'vitest'

class InMemoryModel {
    private data: any[] = []
    private name: string

    constructor(name: string) {
        this.name = name
    }

    async create({ data }: { data: any }) {
        // Basic unique constraint simulation for PaymentTransaction
        if (this.name === 'PaymentTransaction' && data.whopTransactionId) {
            const existing = this.data.find(item => item.whopTransactionId === data.whopTransactionId)
            if (existing) {
                const error = new Error('Unique constraint failed on the fields: (`whopTransactionId`)')
                    ; (error as any).code = 'P2002'
                throw error
            }
        }
        const record = { id: Math.random().toString(36).substring(7), ...data, createdAt: new Date() }
        this.data.push(record)
        return record
    }

    async findUnique({ where }: { where: any }) {
        return this.findFirst({ where })
    }

    async findFirst({ where }: { where: any }) {
        if (!where) return this.data[0] || null
        return this.data.find(item => {
            // Very basic matching for mock purposes
            return Object.entries(where).every(([key, value]) => {
                // Handle nested objects in simple way if needed, or just direct equality
                if (typeof value === 'object' && value !== null) return true // skip complex checks for now
                return item[key] === value
            })
        }) || null
    }

    async findMany({ where }: { where?: any } = {}) {
        if (!where) return this.data
        return this.data.filter(item => {
            return Object.entries(where).every(([key, value]) => {
                if (typeof value === 'object' && value !== null) return true
                return item[key] === value
            })
        })
    }

    async update({ where, data }: { where: any, data: any }) {
        const index = this.data.findIndex(item => {
            return Object.entries(where).every(([key, value]) => item[key] === value)
        })
        // If not found in mock, just return data merged with where to simulate success or throw
        if (index === -1) {
            // For robustness in partial mocks, we might just return the mock data
            return { ...where, ...data }
        }

        this.data[index] = { ...this.data[index], ...data }
        return this.data[index]
    }

    async upsert({ where, create, update }: { where: any, create: any, update: any }) {
        const existing = await this.findUnique({ where })
        if (existing) {
            return this.update({ where, data: update })
        }
        return this.create({ data: create })
    }

    async delete({ where }: { where: any }) {
        const index = this.data.findIndex(item => {
            return Object.entries(where).every(([key, value]) => item[key] === value)
        })
        if (index !== -1) {
            const deleted = this.data[index]
            this.data.splice(index, 1)
            return deleted
        }
        return null
    }

    _clear() {
        this.data = []
    }
}

export const mockPrisma = {
    $disconnect: vi.fn(),
    $executeRawUnsafe: vi.fn(),
    $transaction: vi.fn((callback) => {
        // If callback is a function, run it with mockPrisma
        if (typeof callback === 'function') return callback(mockPrisma)
        // If it's an array of promises, resolve them
        if (Array.isArray(callback)) return Promise.all(callback)
        return Promise.resolve()
    }),

    paymentTransaction: new InMemoryModel('PaymentTransaction'),
    invoice: new InMemoryModel('Invoice'),
    refund: new InMemoryModel('Refund'),
    subscriptionEvent: new InMemoryModel('SubscriptionEvent'),
    paymentMethod: new InMemoryModel('PaymentMethod'),
    promotion: new InMemoryModel('Promotion'),
    usageMetric: new InMemoryModel('UsageMetric'),
    subscription: new InMemoryModel('Subscription'),
    processedWebhook: new InMemoryModel('ProcessedWebhook'),
}
