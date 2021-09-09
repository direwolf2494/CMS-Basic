## Customer API
The code below contains a logic for a basic customer api. Customers have the following attributes:

### Getting Setup
A .env file should be created in the root directory with the following information:
```
API_PORT = 8080
DATABASE_HOST=db
DATABASE_USERNAME=dbuser
DATABASE_PASSWORD=secret
DATABASE_NAME=cms
DATABASE_DIALECT=mariadb
DATABASE_PORT=3306
```
The project will require docker to run. Follow the steps below to get the api up and running:
```
docker-compose up
```
That should build the api and associated database. After the rest api has been started, you can make requests to `http://localhost:8080`. The api consumes `application/json`.

### Customer Structure
Customer objects have the following structure. Validation and Sanitation is added to each attribute to ensure that this schema is met. Phone numbers should be in `e164` format (+19024444444)
```
name: string
email: string
phoneNumber: string
address: {
  streetName: string,
  houseNumber: number,
  city: string,
  stateOrProvince: string
}
```

### Creating Customer
To create a customer make a request with the customer defined body in of the http request to `http://localhost:8080/customer`. Customers are expected to have unique emails and phoneNumbers. So attempt to create multiple customers with the same email/phoneNumber will return an API error. Example:
```
curl --location --request POST 'localhost:8080/customer' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "James McCavoy",
    "address": {
        "streetName": "Brunswick Street",
        "houseNumber": 1991,
        "city": "Halifax",
        "stateOrProvince": "NS"
    },
    "email": "ab@b.ca",
    "phoneNumber": "+19024443333"
}'
```

### Listing Customers
Customer listing is paginated by default (first 100 records). Optional `limit` and `offset` query parameters can be provided to control pagination. See example request below:
```
curl --location --request GET 'localhost:8080/customer'
curl --location --request GET 'localhost:8080/customer?offset=0&limit=10'
```

Additionally, you can filter customer listing on any of the fields by providing a search term in the request using the `query` query parameter. Example:
```
curl --location --request GET 'localhost:8080/customer?query=James'
curl --location --request GET 'localhost:8080/customer?query=1991'
curl --location --request GET 'localhost:8080/customer?query=Halifax'
curl --location --request GET 'localhost:8080/customer?query=james mccavoy'
```

### Getting a Customer
A single customer can be fetched by providing the customer id `localhost:8080/customer/:id`. If the customer has not been found an API error will be returned (404 status with with custom message). Example:
```
curl --location --request GET 'localhost:8080/customer/2'
```

### Updating a Customer
An existing customer can also be updated. To support deleting fields (making them null) all customer attributes are required. If an attempt is made to update a customer that doesn't exist an API error will be returned (404 with customer message). An example request is shown below:

```
curl --location --request PUT 'localhost:8080/customer/2' \
--header 'Content-Type: application/json' \
--data-raw '{
    "name": "James McCavoy I",
    "address": {
        "streetName": "Brunswick Street",
        "houseNumber": 1994,
        "city": "Halifax",
        "stateOrProvince": "NS"
    },
    "email": "ab@b.ca",
    "phoneNumber": "+18764663480"
}'
```

### Deleting a Customer
A single customer can be deleted by providing the customer id `localhost:8080/customer/:id`. If the customer does not exist a 200 response will still be returned. Example:
```
curl --location --request DELETE 'localhost:8080/customer/1'
```

### Testing
Unit tests have been written in `jest` with additional mocking/stubbing support from `sinon`. Additionally, api tests have been written to validate end to end functionality. These tests can be run using the following command
```
docker-compose run test
```