/**
 * cryptoVault.js — Client-side E2E encryption utilities
 * All operations use the Web Crypto API exclusively.
 * No keys are ever stored in localStorage/sessionStorage.
 */

// ── Key Derivation ────────────────────────────────────────────────

/**
 * Derive an AES-GCM-256 key from a password + salt using PBKDF2.
 * @param {string} password
 * @param {string|Uint8Array} salt — use user email or userId as salt
 */
export async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    const saltBytes = typeof salt === 'string' ? enc.encode(salt) : salt;
    const keyMaterial = await crypto.subtle.importKey(
        'raw', enc.encode(password), 'PBKDF2', false, ['deriveKey']
    );
    return crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: saltBytes, iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

// ── File Encryption / Decryption ──────────────────────────────────

/**
 * Encrypt a File/Blob using AES-GCM.
 * @param {File|Blob} file
 * @param {CryptoKey} cryptoKey
 * @returns {{ encryptedBlob: ArrayBuffer, iv: Uint8Array }}
 */
export async function encryptFile(file, cryptoKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const fileBuffer = await file.arrayBuffer();
    const encryptedBuffer = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, fileBuffer);
    return { encryptedBlob: encryptedBuffer, iv };
}

/**
 * Decrypt an encrypted ArrayBuffer using AES-GCM.
 * @param {ArrayBuffer} encryptedBlob
 * @param {Uint8Array|string} iv — raw bytes or base64 string
 * @param {CryptoKey} cryptoKey
 * @returns {ArrayBuffer}
 */
export async function decryptBlob(encryptedBlob, iv, cryptoKey) {
    const ivBytes = typeof iv === 'string' ? Uint8Array.from(atob(iv), c => c.charCodeAt(0)) : iv;
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, cryptoKey, encryptedBlob);
}

// ── Field-Level Encryption ────────────────────────────────────────

/**
 * Encrypt a plain text string field (e.g. Aadhaar number).
 * @param {string} plainText
 * @param {CryptoKey} cryptoKey
 * @returns {{ ciphertext: string, iv: string }} — both base64
 */
export async function encryptField(plainText, cryptoKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, enc.encode(plainText));
    return {
        ciphertext: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
        iv: btoa(String.fromCharCode(...iv))
    };
}

/**
 * Decrypt a stored base64 ciphertext + iv back to plain string.
 * @param {string} ciphertext — base64
 * @param {string} iv — base64
 * @param {CryptoKey} cryptoKey
 * @returns {string}
 */
export async function decryptField(ciphertext, iv, cryptoKey) {
    const cipherBytes = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    const ivBytes = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivBytes }, cryptoKey, cipherBytes);
    return new TextDecoder().decode(decrypted);
}

// ── RSA-OAEP Helper Key Management ───────────────────────────────

/**
 * Generate a 2048-bit RSA-OAEP key pair for a helper.
 * Public key → saved to server. Private key → sessionStorage only.
 */
export async function generateHelperKeyPair() {
    const keyPair = await crypto.subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['encrypt', 'decrypt']
    );
    const publicKey = await crypto.subtle.exportKey('jwk', keyPair.publicKey);
    const privateKey = await crypto.subtle.exportKey('jwk', keyPair.privateKey);
    return { publicKey, privateKey };
}

/**
 * Import a JWK public key for encryption.
 */
export async function importPublicKey(jwk) {
    return crypto.subtle.importKey('jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['encrypt']);
}

/**
 * Import a JWK private key for decryption.
 */
export async function importPrivateKey(jwk) {
    return crypto.subtle.importKey('jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, false, ['decrypt']);
}

/**
 * Wrap an AES key with a helper's RSA-OAEP public key.
 * @param {CryptoKey} aesKey
 * @param {CryptoKey} helperPublicKey — imported RSA public key
 * @returns {string} base64 wrapped key
 */
export async function encryptAesKeyForHelper(aesKey, helperPublicKey) {
    const rawAes = await crypto.subtle.exportKey('raw', aesKey);
    const wrapped = await crypto.subtle.encrypt({ name: 'RSA-OAEP' }, helperPublicKey, rawAes);
    return btoa(String.fromCharCode(...new Uint8Array(wrapped)));
}

/**
 * Unwrap an RSA-OAEP wrapped AES key using the helper's private key.
 * @param {string} encryptedKey — base64
 * @param {CryptoKey} helperPrivateKey
 * @returns {CryptoKey} AES-GCM key
 */
export async function decryptAesKeyAsHelper(encryptedKey, helperPrivateKey) {
    const wrapped = Uint8Array.from(atob(encryptedKey), c => c.charCodeAt(0));
    const rawAes = await crypto.subtle.decrypt({ name: 'RSA-OAEP' }, helperPrivateKey, wrapped);
    return crypto.subtle.importKey('raw', rawAes, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
}

/**
 * Helper: ArrayBuffer → base64 string
 */
export function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

/**
 * Helper: base64 string → ArrayBuffer
 */
export function base64ToArrayBuffer(b64) {
    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes.buffer;
}
