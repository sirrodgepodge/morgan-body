/**
 * ITransport
 */
export default interface ITransport {
  /**
   * Write Function
   * This function is called whenever morgan-body logs something
   * @param message Message to log
   */
  write: (message: string) => unknown
}
