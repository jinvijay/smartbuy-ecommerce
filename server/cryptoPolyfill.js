// Node 18 doesn't expose the Web Crypto API as a global (stabilized in Node 20+),
// but better-auth expects `crypto.getRandomValues` to be globally available.
import { webcrypto } from 'node:crypto'

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto
}
