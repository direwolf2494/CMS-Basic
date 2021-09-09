import { createConnection } from "typeorm"
import Logger from './helpers/logging'
import http from 'http'
import * as dotenv from 'dotenv'
dotenv.config()
import DBConfig from './config'

// ensure that database models are synced before the server is started
const logger = Logger('APP')
logger.setLevel(1)
const config = DBConfig[process.env.mode] || DBConfig.development

createConnection(config).then(async _ => {
  console.log('Database Connection Pool setup successful.')
  // setup the app and middleware
  // setup port
  const app = require('./app').default
  // create node server
  const server = http.createServer(app)
  server.listen(process.env.API_PORT)
  server.on('error', (err) => {
    logger.error(err)
  })
  server.on('listening', () => {
    logger.info(`Server is listening on ${process.env.API_PORT}`)
  })
}).catch(err => {
  logger.error('Failed to setup connection pool.', err)
})