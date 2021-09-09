import { getConnection } from "typeorm"
import { Customer } from "../entity/Customer"

// export each of the db repositories for the entities

export const CustomerRepository = getConnection().getRepository(Customer)
