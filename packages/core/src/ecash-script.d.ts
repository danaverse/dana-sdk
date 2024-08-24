// ecash-script.d.ts
declare module 'ecash-script' {
  export interface Stack {
    remainingHex: string;
  }

  /**
   * Consume a specified number of bytes from the stack.
   * @param stack - An object containing a hex string outputScript of an eCash tx.
   * @param byteCount - The number of bytes to consume.
   * @throws {Error} if input is not supported.
   * @returns {string} The consumed bytes as a hex string.
   */
  export function consume(stack: Stack, byteCount: number): string;

  /**
   * Parse, decode and consume the data push from the top of the stack.
   * @param stack - An object containing a hex string outputScript of an eCash tx.
   * @returns {object} {data, pushedWith}
   * @throws {Error} if the stack does not start with a valid push.
   */
  export function consumeNextPush(stack: Stack): { data: string; pushedWith: string };

  /**
   * Convert an OP_RETURN outputScript into an array of pushes.
   * @param outputScript - An OP_RETURN output script.
   * @returns {array} An array of hex pushes.
   * @throws {Error} if outputScript is not a valid OP_RETURN outputScript.
   */
  export function getStackArray(outputScript: string): string[];
}
