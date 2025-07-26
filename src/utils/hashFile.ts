/**
 * Asynchronously computes the SHA-256 hash of a Blob.
 * @param {Blob} file The Blob object to hash.
 * @returns {Promise<string>} A promise that resolves with the hexadecimal representation of the hash.
 */
export async function hashFile(file: Blob) {
    // 1. Read the file's content as an ArrayBuffer.
    // An ArrayBuffer is a raw binary data buffer needed for the crypto API.
    const buffer = await file.arrayBuffer();
   
    // 2. Use the Web Crypto API to hash the buffer with the SHA-256 algorithm.
    // The result is the hash, also as an ArrayBuffer.
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
   
    // 3. Convert the hash ArrayBuffer into an array of 8-bit unsigned integers (bytes).
    const hashArray = Array.from(new Uint8Array(hashBuffer));
   
    // 4. Convert each byte in the array to its 2-character hexadecimal string representation
    // and join them all together to form the final hash string.
    // e.g., [227, 176, 196] becomes "e3b0c4"
    const hashHex = hashArray
     .map(b => b.toString(16).padStart(2, '0'))
     .join('');
   
    return hashHex;
}