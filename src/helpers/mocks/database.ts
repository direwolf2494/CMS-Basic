import * as typeorm from 'typeorm'
import sinon from 'sinon'

const result = () => [[], 0]
const mockSelectQueryBuilder = sinon.createStubInstance(typeorm.SelectQueryBuilder)
mockSelectQueryBuilder.select.returnsThis()
mockSelectQueryBuilder.where.returnsThis()
mockSelectQueryBuilder.orWhere.returnsThis()
mockSelectQueryBuilder.offset.returnsThis()
mockSelectQueryBuilder.limit.returnsThis()
mockSelectQueryBuilder.getManyAndCount.returns(new Promise(result))

const mockRepository = sinon.createStubInstance(typeorm.Repository)
mockRepository.createQueryBuilder.returns(mockSelectQueryBuilder as unknown as typeorm.SelectQueryBuilder<any>)


const connection = sinon.createStubInstance(typeorm.Connection)
connection.getRepository.returns(mockRepository as unknown as typeorm.Repository<any>)
sinon.stub(typeorm, 'getConnection').returns(connection as unknown as typeorm.Connection)

export default jest.mock('typeorm', () => {
  const originalModule = jest.requireActual('typeorm')
  return {
    __esModule: true,
    ...originalModule,
    getConnection: () => (connection as unknown as typeorm.Connection)
  }
})

function restoreMocksAndStubs() {
  jest.resetAllMocks()
  sinon.restore()
}

export { mockSelectQueryBuilder, restoreMocksAndStubs }
