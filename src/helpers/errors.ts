const errors = {
  PhoneNumberOrEmailInUse: {
    name: 'PhoneNumberOrEmailInUse',
    message: 'The provided phone number of email address is already associated with a customer.',
    statusCode: 400
  },
  NoSuchCustomer: {
    name: 'NoSuchCustomer',
    message: 'No customer has been found with the provided customer id.',
    statusCode: 404
  }
}

const throwError = (name: string) => {
  const err = new Error()
  err.name = name
  err.message = errors[name] || 'An error occured. Please try again.'
  throw err
}

export { errors, throwError }