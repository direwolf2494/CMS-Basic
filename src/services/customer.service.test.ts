import '../helpers/mocks/database' // mock the db connection
import sinon from 'sinon'
import { errors } from '../helpers/errors'
import CustomerService, { ICustomer } from './customers.service'
import { CustomerRepository } from './database'
import { mockSelectQueryBuilder, restoreMocksAndStubs } from '../helpers/mocks/database'

describe('CustomerService', () => {
  afterAll(() => {
    restoreMocksAndStubs()
  })
  describe('create', () => {
    it('creates a new customer', async () => {
      const customer: ICustomer = {
        name: 'John Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3000,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'jdoe@email.ca',
        phoneNumber: '+19024445555'
      }
      const expected: any = { id: 1, ...customer }
      // mock the db response
      const saveSpy = jest
        .spyOn(CustomerRepository, "save")
        .mockResolvedValueOnce(expected)
      const findSpy = jest
        .spyOn(CustomerRepository, 'find')
        .mockResolvedValueOnce([])
      // call create
      const newCustomer = await CustomerService.create(customer)
      // find functionality
      expect(findSpy).toHaveBeenCalledTimes(1)
      // save functionality
      expect(newCustomer).toEqual(expected)
      expect(saveSpy).toHaveBeenCalledWith(customer)
      expect(saveSpy).toHaveBeenCalledTimes(1)
      saveSpy.mockRestore()
      return findSpy.mockRestore()
    })

    it('tries to create a customer by reusing and email and fails', async () => {
      const customer: any = {
        name: 'John Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3000,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'jdoe@email.ca',
        phoneNumber: '+19024445555'
      }
      
      const findSpy = jest
        .spyOn(CustomerRepository, 'find')
        .mockResolvedValueOnce([{ id: 1, ...customer }])

      await expect(CustomerService.create(customer)).rejects.toThrow(errors.PhoneNumberOrEmailInUse.name)
      expect(findSpy).toHaveBeenCalledTimes(1)
      return findSpy.mockRestore()
    })

    it('tries to create a customer by reusing and phone number and fails', async () => {
      const customer: any = {
        name: 'John Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3000,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'jdoe@email.ca',
        phoneNumber: '+19024445555'
      }
      
      const findSpy = jest
        .spyOn(CustomerRepository, 'find')
        .mockResolvedValueOnce([{ id: 1, ...customer }])

      await expect(CustomerService.create(customer)).rejects.toThrow(errors.PhoneNumberOrEmailInUse.name)
      expect(findSpy).toHaveBeenCalledTimes(1)
      return findSpy.mockRestore()
    })
  })

  describe('update', () => {
    it('updates a customer name', async () => {
      const customer: ICustomer = {
        name: 'John Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3000,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'jdoe@email.ca',
        phoneNumber: '+19024445555'
      }
      const id = 1
      const expected: any = {
        id: 1, ...customer,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }
      // mock the db response
      const saveSpy = jest
        .spyOn(CustomerRepository, "save")
        .mockResolvedValueOnce(expected)
      const findSpy = jest
        .spyOn(CustomerRepository, 'findOne')
        .mockResolvedValueOnce({
          id,
          ...customer,
          name: 'Jane Doe', // this should be changed in the update
        } as any)
      // call create
      const updatedCustomer = await CustomerService.update(id, customer)
      // find functionality
      expect(findSpy).toHaveBeenCalledTimes(1)
      // save functionality
      expect(updatedCustomer).toEqual(expected)
      expect(saveSpy).toHaveBeenCalledWith({ id, ...customer })
      expect(saveSpy).toHaveBeenCalledTimes(1)
      saveSpy.mockRestore()
      return findSpy.mockRestore()
    })
    it('tries to update a non-existent customer and fails', async () => {
      const customer: ICustomer = {
        name: 'John Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3000,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'jdoe@email.ca',
        phoneNumber: '+19024445555'
      }
      const id = 1
      // mock the db response
      const findSpy = jest
        .spyOn(CustomerRepository, 'findOne')
        .mockResolvedValueOnce({} as any)
      // find functionality
      await expect(CustomerService.update(id, customer)).rejects.toThrow(errors.NoSuchCustomer.name)
      expect(findSpy).toHaveBeenCalledTimes(1)
      return findSpy.mockRestore()
    })
  })

  describe('delete', () => {
    it('deletes a customer', async () => {
      const expected = { raw: true }
      const spy = jest
        .spyOn(CustomerRepository, 'delete')
        .mockResolvedValueOnce(expected)

      const id = 1
      const result = await CustomerService.delete(id)
      expect(result).toEqual(expected)
      expect(spy).toHaveBeenCalledWith(id)
      return expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('search', () => {
    it('retrives a list of customers', async () => {
      const expected: any = [[{
        id: 1,
        name: 'John Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3000,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'jdoe@email.ca',
        phoneNumber: '+19024445555',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }, {
        id: 2,
        name: 'Jane Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3001,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'janedoe@email.ca',
        phoneNumber: '+19025555555',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }], 2]

      const spy = jest
        .spyOn(CustomerRepository, 'findAndCount') 
        .mockResolvedValueOnce(expected)
        
      const skip = 0
      const take = 10
      const results = await CustomerService.search(null, skip, take)
      expect(results[0]).toEqual(expected[0])
      expect(results[1]).toBe(expected[1])
      expect(spy).toHaveBeenCalledTimes(1)
      expect(spy).toHaveBeenCalledWith({ skip, take })
      return spy.mockRestore()
    })

    it('searchs for a customer name "John"', async () => {
      const expected: any = [[{
        id: 1,
        name: 'John Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3000,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'jdoe@email.ca',
        phoneNumber: '+19024445555',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null
      }], 1]
        
      mockSelectQueryBuilder.getManyAndCount.returns(expected)
      const skip = 0
      const take = 10
      const results = await CustomerService.search('John', skip, take)
      expect(results[0]).toEqual(expected[0])
      expect(results[1]).toBe(expected[1])
      return sinon.assert.calledOnce(mockSelectQueryBuilder.getManyAndCount)
    })
  })

  describe('get', () => {
    it('gets an existing customer', async () => {
      const customer: ICustomer = {
        name: 'John Doe',
        streetName: 'Brunswick St.',
        houseNumber: 3000,
        city: 'Halifax',
        stateOrProvince: 'Nova Scotia',
        email: 'jdoe@email.ca',
        phoneNumber: '+19024445555'
      }
      const id = 1
      const expected: any = {
        id: 1, ...customer
      }
      // mock the db response
      const findSpy = jest
        .spyOn(CustomerRepository, 'findOne')
        .mockResolvedValueOnce(expected as any)
      // call create
      const foundCustomer = await CustomerService.get(id)
      // find functionality
      expect(findSpy).toHaveBeenCalledTimes(1)
      // save functionality
      expect(foundCustomer).toEqual(expected)
      return findSpy.mockRestore()
    })

    it('gets an nonexistent customer', async () => {
      const id = 1
      const expected: any = {}
      // mock the db response
      const findSpy = jest
        .spyOn(CustomerRepository, 'findOne')
        .mockResolvedValueOnce(expected as any)
      // call create
      const foundCustomer = await CustomerService.get(id)
      // find functionality
      expect(findSpy).toHaveBeenCalledTimes(1)
      // save functionality
      expect(foundCustomer).toEqual(expected)
      return findSpy.mockRestore()
    })
  })
})
