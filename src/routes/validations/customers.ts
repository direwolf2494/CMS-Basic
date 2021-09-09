import { Joi } from 'express-validation'
const customJoi = Joi.extend(require('joi-phone-number'))

const customerValidations = {
  create: {
    body: Joi.object({
      name: Joi.string().trim().min(3).max(255).required(),
      address: Joi.object({
        streetName: Joi.string().trim().min(3).max(255).required(),
        houseNumber: Joi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).required(),
        city: Joi.string().trim().min(3).max(255).required(),
        stateOrProvince: Joi.string().trim().min(2).max(255).required()
      }).required(),
      email: Joi.string().email().max(254).lowercase().required(),
      phoneNumber: customJoi.string().phoneNumber({ format: 'e164' }).required()
    }).unknown(false)
  },
  search: {
    query: Joi.object({
      query: Joi.string().trim().min(1).max(255).optional(),
      offset: Joi.number().integer().min(0).max(Number.MAX_SAFE_INTEGER).default(0),
      limit: Joi.number().integer().min(1).max(100).default(100)
    }).and('offset', 'limit')
  },
  pathId: {
    params: Joi.object({
      id: Joi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).required()
    })
  },
  update: {
    params: Joi.object({
      id: Joi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).required()
    }),
    body: Joi.object({
      name: Joi.string().trim().min(3).max(255).allow(null).required(),
      address: Joi.object({
        streetName: Joi.string().trim().min(3).allow(null).max(255).required(),
        houseNumber: Joi.number().integer().min(1).max(Number.MAX_SAFE_INTEGER).allow(null).required(),
        city: Joi.string().trim().min(3).max(255).allow(null).required(),
        stateOrProvince: Joi.string().trim().min(2).max(255).allow(null).required()
      }).required(),
      email: Joi.string().email().max(254).lowercase().allow(null).required(),
      phoneNumber: customJoi.string().phoneNumber({ format: 'e164' }).allow(null).required()
    }).unknown(false)
  }
}

export default customerValidations