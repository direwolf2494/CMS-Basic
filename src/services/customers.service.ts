import { CustomerRepository } from './database'
import { errors, throwError } from '../helpers/errors'
import { Not } from 'typeorm'

interface ICustomer {
  name: string,
  streetName: string,
  houseNumber: number,
  city: string,
  stateOrProvince: string
  phoneNumber: string,
  email: string
}

export { ICustomer }

export default {
  create: async (customer: ICustomer) => {
    try {
      // check if the phone number and/or email is in use
      const customers = await CustomerRepository.find({
        where: [
          { phoneNumber: customer.phoneNumber },
          { email: customer.email }
        ]
      })
      if (customers.length) {
        throwError(errors.PhoneNumberOrEmailInUse.name)
      }
      // create the customer and return
      return CustomerRepository.save(customer)
    } catch (err) {
      throw err
    }
  },
  update: async (customerId: number, customer: ICustomer) => {
    try {
      // check if the customer exists
      let cust = await CustomerRepository.findOne(customerId)
      if (!cust || !cust.id) {
        throwError(errors.NoSuchCustomer.name)
      }
      const existingCustomers = await CustomerRepository.find({
        where: [
            { phoneNumber: customer.phoneNumber, id: Not(customerId) },
            { email: customer.email, id: Not(customerId) }
        ]
      })
      if (existingCustomers.length) {
        throwError(errors.PhoneNumberOrEmailInUse.name)
      }
      // update the customer
      cust = {...cust, ...customer }
      return CustomerRepository.save(cust)
    } catch (err) {
      throw err
    }
  },
  delete: async (customerId: number) => {
    try {
      return CustomerRepository.delete( customerId)
    } catch (err) {
      throw err
    }
  },
  get: (customerId: number) => {
    return CustomerRepository.findOne(customerId)
  },
  search: (query: string | null, offset: number, limit: number) => {
    if (query) {
      return CustomerRepository
        .createQueryBuilder()
        .select()
        .where(`
          MATCH(name, streetName, city, stateOrProvince, email, phoneNumber)
          AGAINST (:query IN NATURAL LANGUAGE MODE)
        `, { query })
        .orWhere(`houseNumber = :query`, { query })
        .offset(offset)
        .limit(limit)
        .getManyAndCount()
    }
    return CustomerRepository.findAndCount({ skip: offset, take: limit })
  },
}