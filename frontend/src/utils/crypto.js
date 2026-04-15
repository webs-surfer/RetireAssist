/**
 * AES-GCM client-side encryption/decryption using Web Crypto API
 * Key is derived from the user's ID (stable per user) via PBKDF2
 * No external library required — uses browser built-in crypto
 */

const SALT = 'RetireAssist-v1-DocVault'; // fixed app salt

/** Derive an AES-GCM key from a password string */
async function deriveKey(password) {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
        'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    return window.crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: enc.encode(SALT), iterations: 100000, hash: 'SHA-256' },
        keyMaterial,
        { name: 'AES-GCM', length: 256 },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Encrypt a File before upload.
 * Returns a new Blob with [12-byte IV][ciphertext] prepended.
 */
export async function encryptFile(file, userPassword) {
    const key = await deriveKey(userPassword);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const fileBuffer = await file.arrayBuffer();
    const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, fileBuffer);

    // Prepend IV to ciphertext for storage
    const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.byteLength);

    return new Blob([combined], { type: 'application/octet-stream' });
}

/**
 * Decrypt a downloaded encrypted Blob.
 * Returns a Blob of the original file type.
 */
export async function decryptFile(encryptedBlob, userPassword, originalMimeType = 'application/pdf') {
    const key = await deriveKey(userPassword);
    const buffer = await encryptedBlob.arrayBuffer();
    const iv = buffer.slice(0, 12);
    const ciphertext = buffer.slice(12);
    const plaintext = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return new Blob([plaintext], { type: originalMimeType });
}

/**
 * Download and decrypt a file, trigger browser download
 */
export async function downloadAndDecrypt(url, filename, userPassword, mimeType) {
    const response = await fetch(url);
    const encryptedBlob = await response.blob();
    const decryptedBlob = await decryptFile(encryptedBlob, userPassword, mimeType);
    const link = document.createElement('a');
    link.href = URL.createObjectURL(decryptedBlob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}
