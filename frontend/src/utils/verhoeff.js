/**
 * Client-side Verhoeff checksum for Aadhaar validation
 */

const d = [
    [0,1,2,3,4,5,6,7,8,9],[1,2,3,4,0,6,7,8,9,5],[2,3,4,0,1,7,8,9,5,6],
    [3,4,0,1,2,8,9,5,6,7],[4,0,1,2,3,9,5,6,7,8],[5,9,8,7,6,0,4,3,2,1],
    [6,5,9,8,7,1,0,4,3,2],[7,6,5,9,8,2,1,0,4,3],[8,7,6,5,9,3,2,1,0,4],[9,8,7,6,5,4,3,2,1,0]
];
const p = [
    [0,1,2,3,4,5,6,7,8,9],[1,5,7,6,2,8,3,0,9,4],[5,8,0,3,7,9,6,1,4,2],
    [8,9,1,6,0,4,3,5,2,7],[9,4,5,3,1,2,6,8,7,0],[4,2,8,6,5,7,3,9,0,1],
    [2,7,9,3,8,0,6,4,1,5],[7,0,4,6,9,1,3,2,5,8]
];

function verhoeffCheck(numStr) {
    let c = 0;
    const digits = numStr.split('').reverse().map(Number);
    for (let i = 0; i < digits.length; i++) c = d[c][p[i % 8][digits[i]]];
    return c === 0;
}

/**
 * Validate an Aadhaar number
 * @param {string} number
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateAadhaar(number) {
    if (!number) return { valid: false, error: 'Aadhaar number is required' };
    const cleaned = String(number).replace(/\s+/g, '');
    if (!/^\d+$/.test(cleaned)) return { valid: false, error: 'Aadhaar must contain only digits' };
    if (cleaned.length !== 12) return { valid: false, error: `Must be 12 digits (got ${cleaned.length})` };
    if (cleaned[0] === '0' || cleaned[0] === '1') return { valid: false, error: 'Cannot start with 0 or 1' };
    if (!verhoeffCheck(cleaned)) return { valid: false, error: 'Invalid (checksum failed)' };
    return { valid: true };
}
