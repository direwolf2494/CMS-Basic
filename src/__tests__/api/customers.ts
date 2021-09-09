import * as dotenv from 'dotenv'
dotenv.config()

import DBConfig from '../../config'

import request from 'supertest'
import { Server } from 'node:http'
import { Customer } from '../../entity/Customer'
import { Connection, createConnection, Repository } from 'typeorm'
import { errors } from '../../helpers/errors'

describe('Customers', () => {
  let CustomerRepository: Repository<Customer>
  let connection: Connection
  const port = process.env.API_PORT || 8080
  let server: Server

  beforeAll(async () => {
    connection = await createConnection(DBConfig[process.env.mode])
    CustomerRepository = connection.getRepository(Customer)
    const app = require('../../app').default
    server = app.listen(port)
  })

  afterAll(async () => {
    server.close()
    await CustomerRepository.clear()
    return connection.close()
  })

  describe('POST /customers', () => {
    beforeEach(async () => {
      return CustomerRepository.clear()
    })

    it('creates a customer', async () => {
      const data = {
        name: 'Roy Brown',
        email: 'rbornw@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }

      const customerReponse = (await request(server)
        .post('/customer')
        .send(data)
        .expect(200)).body
      // check that the record was created in the db
      const customer = await CustomerRepository.findOne(customerReponse.id)
      expect(customer).not.toBe({})
      // validate that the returned data is correct
      const expected = {
        ...data,
        id: customer.id
      }
      expect(customerReponse).toEqual(expected)
      return
    })
    it('tries to reuse an email to create a customer and fails', async () => {
      const data = {
        name: 'Roy Brown',
        email: 'rbornw@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }

      await request(server)
        .post('/customer')
        .send(data)
        .expect(200)

      data.name = 'Joy Brown'
      data.address.houseNumber = 1600

      const updateErrorResponse = (await request(server)
        .post('/customer')
        .send(data)
        .expect(errors.PhoneNumberOrEmailInUse.statusCode)).body

      const expected = {
        status: errors.PhoneNumberOrEmailInUse.statusCode,
        message: errors.PhoneNumberOrEmailInUse.message,
        name: errors.PhoneNumberOrEmailInUse.name
      }
      expect(updateErrorResponse).toEqual(expected)
      return
    })
  })

  describe('PUT /customers/:id', () => {
    beforeEach(async () => {
      return CustomerRepository.clear()
    })

    it('updates a customer', async () => {
      const data = {
        name: 'Roy Brown',
        email: 'rbornw@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }

      const customer = (await request(server)
        .post('/customer')
        .send(data)
        .expect(200)).body

      const updatedData = { ...data, name: 'Mary Brown' }
      const updatedCustomerResponse = (await request(server)
        .put(`/customer/${customer.id}`)
        .send(updatedData)
        .expect(200)).body

      const expected = { status: 'ok' }
      expect(updatedCustomerResponse).toEqual(expected)
      // check that the record was created in the db
      const customerRecord = await CustomerRepository.findOne(customer.id)
      expect(customerRecord).not.toBe({})
      expect(customerRecord.name).toBe(updatedData.name)
      return
    })
    it('tries to update a nonexistent customer and fails', async () => {
      const id = Number.MAX_SAFE_INTEGER
      const data = {
        name: 'Roy Brown',
        email: 'rbornw@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }

      const failedUpdateReponse = (await request(server)
        .put(`/customer/${id}`)
        .send(data)
        .expect(errors.NoSuchCustomer.statusCode)).body

      const expected = {
        status: errors.NoSuchCustomer.statusCode,
        message: errors.NoSuchCustomer.message,
        name: errors.NoSuchCustomer.name
      }
      expect(failedUpdateReponse).toEqual(expected)
      return
    })
  })

  describe('GET /customers/:id', () => {
    beforeEach(async () => {
      return CustomerRepository.clear()
    })

    it('gets a customer', async() => {
      const data = {
        name: 'Kim Brown',
        email: 'kbornw@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }

      const customer = (await request(server)
        .post('/customer')
        .send(data)
        .expect(200)).body

      const singleCustomerResponse = (await request(server)
        .get(`/customer/${customer.id}`)
        .expect(200)).body

      expect(singleCustomerResponse).toEqual(customer)
      return
    })

    it('tries to get a nonexistent customer and fails', async () => {
      const id = Number.MAX_SAFE_INTEGER
      const failedSingleCustomerResponse = (await request(server)
      .get(`/customer/${id}`)
      .expect(errors.NoSuchCustomer.statusCode)).body

    const expected = {
      status: errors.NoSuchCustomer.statusCode,
      message: errors.NoSuchCustomer.message,
      name: errors.NoSuchCustomer.name
    }
    expect(failedSingleCustomerResponse).toEqual(expected)
    return
    })
  })

  describe('GET /customers', () => {
    const customers = []
    beforeAll(async () => {
      await CustomerRepository.clear()
      let name: string
      for (let i = 0; i < 10; i++) {
        name = i === 0 ? "Foxy Walsh" : 'John Brown - ' + i
        customers.push(await CustomerRepository.save({
          name,
          email: `jb+${i}+@ca.ca`,
          phoneNumber: `+1902444444${i}`,
          streetName: "Brunswick St",
          houseNumber: 1000 + 1,
          city: "Halifax",
          stateOrProvince: "NS"
        }))
      }
    })
    it('retrieves all customers', async () => {
      const listCustomerResponse = (await request(server)
        .get('/customer')
        .expect(200)).body
      const custs = customers.map(customer => ({
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phoneNumber: customer.phoneNumber,
        address: {
          streetName: customer.streetName,
          city: customer.city,
          houseNumber: customer.houseNumber,
          stateOrProvince: customer.stateOrProvince
        }
      }))

      const expected = { customers: custs, count: customers.length }
      expect(listCustomerResponse).toEqual(expected)
    })

    it('filters for customer named "Foxy Walsh"', async () => {
      const filterCustomerResponse = (await request(server)
        .get('/customer')
        .query(`query=${customers[0].name}`)
        .expect(200)).body

      const customer = {
        id: customers[0].id,
        name: customers[0].name,
        email: customers[0].email,
        phoneNumber: customers[0].phoneNumber,
        address: {
          streetName: customers[0].streetName,
          city: customers[0].city,
          houseNumber: customers[0].houseNumber,
          stateOrProvince: customers[0].stateOrProvince
        }
      }
      const expected = { customers: [customer], count: 1 }
      expect(filterCustomerResponse).toEqual(expected)
      return
    })
  })

  describe('DELETE /customers/:id', () => {
    beforeEach(async () => {
      return CustomerRepository.clear()
    })

    it('deletes a customer', async () => {
      const data = {
        name: 'Kim Brown',
        email: 'kbornw@email.ca',
        phoneNumber: '+19024445555',
        address: {
          streetName: 'Barrington St',
          houseNumber: 1505,
          city: 'Halifax',
          stateOrProvince: 'NS'
        }
      }

      const customer = (await request(server)
        .post('/customer')
        .send(data)
        .expect(200)).body

      const deleteCustomerResponse = (await request(server)
        .delete(`/customer/${customer.id}`)
        .expect(200)).body

      const expected = { status: 'ok' }
      expect(deleteCustomerResponse).toEqual(expected)

      const customerRecord = await CustomerRepository.findOne(customer.id)
      expect(customerRecord).toEqual(undefined)
      return
    })

    it('deletes a nonexistent customer', async () => {
      const id = Number.MAX_SAFE_INTEGER
      const deleteCustomerResponse2 = (await request(server)
        .delete(`/customer/${id}`)
        .expect(200)).body

      const expected = { status: 'ok' }
      expect(deleteCustomerResponse2).toEqual(expected)
      return
    })
  })
})