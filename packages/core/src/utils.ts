

'use strict';

/**
 * @param {string} hexString
 * @returns {bool} true if string contains only characters 0-9 or a-f, case insensitive
 */
function isHexString(hexString: string) {
  return /^[\da-f]+$/i.test(hexString);
}

/**
 * @param {string} hexString a string of hex bytes, e.g. 04000000
 * @returns {string} a string of hex bytes with swapped endianness, e.g. for 04000000, returns 00000004
 * @throws {Error}
 */
export function swapEndianness(hexString: string): string {
  // Throw an error if hexString is not divisible by 2, i.e. not a valid string of hex bytes
  // One byte is 2 characters of a hex string
  const byteLength = 2;

  if (hexString.length % byteLength === 1) {
    throw new Error(
      `Invalid input length ${hexString.length}: hexString must be divisible by bytes, i.e. have an even length.`,
    );
  }

  // Throw an error if input contains non-hex characters
  if (!isHexString(hexString)) {
    throw new Error(
      `Invalid input. ${hexString} contains non-hexadecimal characters.`,
    );
  }

  let swappedEndianHexString = '';
  while (hexString.length > 0) {
    // Get the last byte on the string
    const thisByte = hexString.slice(-byteLength);
    // Add thisByte to swappedEndianHexString in swapped-endian order
    swappedEndianHexString += thisByte;

    // Remove thisByte from hexString
    hexString = hexString.slice(0, -byteLength);
  }
  return swappedEndianHexString;
}

/**
 * Convert an integer-stored number with known decimals into a formatted decimal string
 * Useful for converting token send quantities to a human-readable string
 * @param {string} bnString an integer value as a string, e.g 100000012
 * @param {number} decimals the number of expected decimal places, e.g. 2
 * @returns {string} e.g. 1,000,000.12
 */
export function bigNumberAmountToLocaleString(bnString: string, decimals: number): string {
  const totalLength = bnString.length;

  // Get the values that come after the decimal place
  const decimalValues =
    decimals === 0 ? '' : bnString.slice(-1 * decimals);
  const decimalLength = decimalValues.length;

  // Get the values that come before the decimal place
  const intValue = bnString.slice(0, totalLength - decimalLength);

  // Use toLocaleString() to format the amount before the decimal place with commas
  return `${BigInt(intValue).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })}${decimals !== 0 ? `.${decimalValues}` : ''}`;
}

