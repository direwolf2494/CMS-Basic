export default {
  development: {
    type: "mariadb",
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: true,
    entities: [
      __dirname + '/entity/**/*.js'
    ],
    migrations: [
      __dirname + '/migration/**/*.js'
   ]
  },
  test: {
    type: "mariadb",
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: false,
    entities: [
      __dirname + '/entity/**/*.ts'
    ],
    migrations: [
      __dirname + '/migration/**/*.ts'
   ]
  }
}