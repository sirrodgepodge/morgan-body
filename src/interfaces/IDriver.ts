/* eslint-disable @typescript-eslint/ban-types */
/**
 * IDriver
 */
export default interface IDriver {
  /**
   * Request Headers
   */
  requestHeaders: () => object

  /**
   * Response Headers
   */
  responseHeaders: () => object

  /**
   * Request Body
   */
  requestBody: () => unknown

  /**
   * Response Body
   */
  responseBody: () => unknown

  /**
   * Request User Agent
   */
  userAgent: () => string

  /**
   * Remote IP address
   */
  ip: () => string

  /**
   * Full Path
   */
  path: () => string

  /**
   * HTTP Method
   */
  method: () => string

  /**
   * Request Id
   */
  id: () => string

  /**
   * Request
   */
  request: () => any

  /**
   * Response
   */
  response: () => any
}
