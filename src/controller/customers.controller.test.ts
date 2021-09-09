import '../helpers/mocks/database' // mock the db connection

import { errors } from "../helpers/errors"
import CustomersService from "../services/customers.service"
import CustomersController, { CustomerFormatter } from "./customers.controller"
import { stub } from 'sinon'
import { restoreMocksAndStubs } from '../helpers/mocks/database'

describe('CustomerController', () => {
  afterAll(() => {
    restoreMocksAndStubs()
  })
  describe('CustomerFormatter', () => {
    describe('destructure', () => {
      const data = {
        name: 'John Brown',
        email: 'jbrown@email.ca',
        phoneNumber: '+19025554444',
        address: {
          streetName: 'Brunswick St',
          houseNumber: 2001,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }
      const expected = {
        name: data.name,
        email: data.email,
        phoneNumber: data.phoneNumber,
        ...data.address
      }
  
      const customer = CustomerFormatter.destructure(data)
      expect(customer).toEqual(expected)
    })
  
    describe('build', () => {
      const expected = {
        name: 'John Brown',
        email: 'jbrown@email.ca',
        phoneNumber: '+19025554444',
        address: {
          streetName: 'Brunswick St',
          houseNumber: 2001,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }
      const data = {
        name: expected.name,
        email: expected.email,
        phoneNumber: expected.phoneNumber,
        ...expected.address
      }
  
      const customer = CustomerFormatter.build(data)
      expect(customer).toEqual(expected)
    })
  })
  describe('create', () => {
    it('creates a customer', async () => {
      const data = {
        name: 'Mary Jane',
        email: 'mj@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }
      const spy = jest
        .spyOn(CustomersService, 'create')
        .mockResolvedValueOnce({
          id: 1,
          name: data.name,
          email: data.email,
          phoneNumber: data.phoneNumber,
          ...data.address,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null
        })

      const customer = await CustomersController.create(data)
      expect(customer).toEqual({ id: 1, ...data })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(CustomerFormatter.destructure(data))
      return spy.mockRestore()
    })

    it('tries to create a customer by reusing and email and fails', async () => {
      const data = {
        name: 'Mary Jane',
        email: 'mj@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }
      
      const error = new Error()
      error.name = errors.PhoneNumberOrEmailInUse.name
      error.message = errors[errors.PhoneNumberOrEmailInUse.name]
      const spy = jest
        .spyOn(CustomersService, 'create')
        .mockRejectedValueOnce(error)

      await expect(CustomersController.create(data)).rejects.toThrow(errors.PhoneNumberOrEmailInUse.name)
      return spy.mockRestore()
    })
  })
  describe('search', () => {
    it('searches for a customer', async () => {
      const expected: any = [
        [{
          id: 1,
          name: 'Mary Jane',
          email: 'mj@email.ca',
          phoneNumber: '+19024445555',
          address: {
            streetName: 'Barrington St',
            houseNumber: 1505,
            city: 'Halifax',
            stateOrProvince: 'NS'
          }
        }],
        1
      ]

      const spy = jest
        .spyOn(CustomersService, 'search')
        .mockResolvedValueOnce([[{
          id: 1,
          name: 'Mary Jane',
          email: 'mj@email.ca',
          phoneNumber: '+19024445555',
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }], 1] as any)

      const query = 'Mary'
      const skip = 0
      const take = 10
      const result = await CustomersController.search(query, skip, take)

      expect(result).toEqual({ count: expected[1], customers: expected[0] })
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenLastCalledWith(query, skip, take)
      return spy.mockRestore()
    })
  })
  describe('update', () => {
    it('updates a customer', async () => {
      const customer = {
        name: 'Mary Jane I',
        email: 'mj@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }
      const id = 1
      const expected = { status: 'ok' }
      const spy = jest
        .spyOn(CustomersService, 'update')
        .mockResolvedValueOnce(null)
  
      const result = await CustomersController.update(id, customer)
      expect(result).toEqual(expected)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(id, customer)
      return spy.mockRestore()
    })
    it('tries to update a customer by that does not exist', async () => {
      const data = {
        name: 'Mary Jane',
        email: 'mj@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }
      const id = 1
      const error = new Error()
      error.name = errors.NoSuchCustomer.name
      error.message = errors[errors.NoSuchCustomer.name]
      const findSpy = jest
        .spyOn(CustomersService, 'update')
        .mockRejectedValueOnce(error)

      await expect(CustomersController.update(id, data)).rejects.toThrow(errors.NoSuchCustomer.name)
      return findSpy.mockRestore()
    })
  })
  describe('get', () => {
    it('gets an existing customer', async () => {
      const id = 1
      const expected = {
        id,
        name: 'Mary Jane',
        email: 'mj@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }
      const dbRow = {id, ...CustomerFormatter.destructure(expected) }
      const spy = jest
        .spyOn(CustomersService, 'get')
        .mockResolvedValueOnce(dbRow as any)

      const customer = await CustomersController.get(id)
      expect(customer).toEqual(expected)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(id)
      return spy.mockRestore()
    })
    it('tries to get a customer that does not exist', async () => {
      const id = 1
      const spy = jest
        .spyOn(CustomersService, 'get')
        .mockResolvedValueOnce({} as any)

      await expect(CustomersController.get(id)).rejects.toThrow(errors.NoSuchCustomer.name)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(id)
      return spy.mockRestore()
    })
  })
  describe('delete', () => {
    it('deletes a customer', async () => {
      const id = 1
      const expected = { status: 'ok' }
      const spy = jest
        .spyOn(CustomersService, 'delete')
        .mockResolvedValueOnce(null)
  
      const result = await CustomersController.delete(id)
      expect(result).toEqual(expected)
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith(id)
      return spy.mockRestore()
    })
  })
})