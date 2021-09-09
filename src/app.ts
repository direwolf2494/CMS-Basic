import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { ValidationError } from 'express-validation'
import express, { NextFunction, Request, Response } from 'express'
import * as swaggerUI from 'swagger-ui-express'

import { errors } from './helpers/errors'
import swaggerDoc from './swagger.json'
// import routers
import customersRoutes from './routes/customer'
const app = express()
app.use(express.json())
// logging network requests
app.use(morgan('common'))
// cors configuration; allow Origin: *
app.use(cors())
// security configuration; suppress/add security headers
app.use(helmet())
// rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
}))
// setup routes
app.use('/customer', customersRoutes)
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDoc))
// global error handler
app.use((err: ValidationError | Error, req: Request, res: Response, next: NextFunction) => {
  let error: any = {
    status: 500,
    message: 'An error occured. Please try again later...',
    name: 'Internal Server Error'
  }
  if (err.name && errors[err.name]) {
    error = {
      status: errors[err.name].statusCode,
      message: errors[err.name].message,
      name: err.name
    }
  } else if (err.name === 'ValidationError') {
    const castError = (err as ValidationError)
    error = {
      status: castError.statusCode,
      name: err.name,
      message: castError.message,
      details: castError.details
    }
  }
  res.status(error.status).json(error)
})

export default app
