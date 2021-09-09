import log from 'loglevel'

// idempotent if the loggerName is reused
export default (loggerName: string) => {
  return log.getLogger(loggerName)
}