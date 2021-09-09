import { errors, throwError } from '../helpers/errors'
import CustomerService, { ICustomer } from '../services/customers.service'

export const CustomerFormatter = {
  destructure(data: any): ICustomer {
    return {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      ...data.address
    }
  },
  build(data: any) {
    const { id, name, email, phoneNumber, createdAt, deletedAt, updatedAt, ...address } = data
    return { id, name, email, phoneNumber, address }
  }
}

export default {
  create: async (data: any) => {
    const customer: ICustomer = CustomerFormatter.destructure(data)
    const result = await CustomerService.create(customer)
    return CustomerFormatter.build(result)
  },
  search: async (query: any, offset = 0, limit = 100) => {
    const records = await CustomerService.search(query, offset, limit)
    return {
      customers: records[0].map(row => CustomerFormatter.build(row)),
      count: records[1]
    }
  },
  get: async (id: number) => {
    const result = await CustomerService.get(id)
    if (!result || !result.id) {
      throwError(errors.NoSuchCustomer.name)
    }
    return CustomerFormatter.build(result)
  },
  update: async (id: number, customer: any) => {
    await CustomerService.update(id, customer)
    return { status: 'ok' } // if an error was thrown, it will be parsed and returned
  },
  delete: async (id: number) => {
    await CustomerService.delete(id)
    return { status: 'ok' } // if an error was thrown, it will be parsed and returned
  },
}