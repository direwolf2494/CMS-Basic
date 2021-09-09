import { NextFunction, Router, Request, Response } from 'express'
import { validate } from 'express-validation'
import customerValidations from './validations/customers'
import Logger from '../helpers/logging'
import CustomerController from '../controller/customers.controller'

const router = Router()

router.post('/', validate(customerValidations.create), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body
    const result = await CustomerController.create(data)
    return res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/', validate(customerValidations.search), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query, offset = 0, limit = 100 } = req.query
    const result = await CustomerController.search(query, parseInt(offset.toString(), 10), parseInt(limit.toString(), 10))
    return res.json(result)
  } catch (err) {
    next(err)
  }
})

router.get('/:id', validate(customerValidations.pathId), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = parseInt(req.params.id, 10)
    const result = await CustomerController.get(customerId)
    return res.json(result)
  } catch (err) {
    next(err)
  }
})

router.put('/:id', validate(customerValidations.update), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = parseInt(req.params.id, 10)
    const data = req.body
    const result = await CustomerController.update(customerId, data)
    return res.json(result)
  } catch (err) {
    next(err)
  }
})

router.delete('/:id', validate(customerValidations.pathId), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = parseInt(req.params.id, 10)
    const result = await CustomerController.delete(customerId)
    return res.json(result)
  } catch (err) {
    next(err)
  }
})


export default router