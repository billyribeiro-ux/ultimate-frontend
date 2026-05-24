/**
 * Password hashing and verification using Web Crypto API (PBKDF2).
 *
 * In production you would use @node-rs/argon2 or bcrypt, but for teaching
 * purposes we use the built-in crypto.subtle API which requires no external
 * dependencies and works in all Node.js and edge runtimes.
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 64;
const ALGORITHM = 'PBKDF2';
const HASH_ALGORITHM = 'SHA-512';

function arrayBufferToHex(buffer: ArrayBuffer): string {
	return Array.from(new Uint8Array(buffer))
		.map((byte: number) => byte.toString(16).padStart(2, '0'))
		.join('');
}

function hexToArrayBuffer(hex: string): ArrayBuffer {
	const bytes: number[] = [];
	for (let i = 0; i < hex.length; i += 2) {
		bytes.push(parseInt(hex.slice(i, i + 2), 16));
	}
	return new Uint8Array(bytes).buffer;
}

/**
 * Hash a plaintext password with a random salt using PBKDF2.
 * Returns a string in the format: `salt:hash` (both hex-encoded).
 */
export async function hashPassword(password: string): Promise<string> {
	const salt = crypto.getRandomValues(new Uint8Array(16)) as Uint8Array<ArrayBuffer>;
	const encoder: TextEncoder = new TextEncoder();
	const passwordBuffer = encoder.encode(password) as Uint8Array<ArrayBuffer>;

	const key: CryptoKey = await crypto.subtle.importKey(
		'raw',
		passwordBuffer,
		ALGORITHM,
		false,
		['deriveBits']
	);

	const derivedBits: ArrayBuffer = await crypto.subtle.deriveBits(
		{
			name: ALGORITHM,
			salt: salt,
			iterations: ITERATIONS,
			hash: HASH_ALGORITHM
		},
		key,
		KEY_LENGTH * 8
	);

	const saltHex: string = arrayBufferToHex(salt.buffer as ArrayBuffer);
	const hashHex: string = arrayBufferToHex(derivedBits);

	return `${saltHex}:${hashHex}`;
}

/**
 * Verify a plaintext password against a stored hash string.
 * The stored hash must be in the format: `salt:hash` (both hex-encoded).
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
	const [saltHex, expectedHashHex] = storedHash.split(':');
	if (!saltHex || !expectedHashHex) return false;

	const salt: ArrayBuffer = hexToArrayBuffer(saltHex);
	const encoder: TextEncoder = new TextEncoder();
	const passwordBuffer = encoder.encode(password) as Uint8Array<ArrayBuffer>;

	const key: CryptoKey = await crypto.subtle.importKey(
		'raw',
		passwordBuffer,
		ALGORITHM,
		false,
		['deriveBits']
	);

	const derivedBits: ArrayBuffer = await crypto.subtle.deriveBits(
		{
			name: ALGORITHM,
			salt: salt,
			iterations: ITERATIONS,
			hash: HASH_ALGORITHM
		},
		key,
		KEY_LENGTH * 8
	);

	const actualHashHex: string = arrayBufferToHex(derivedBits);
	return actualHashHex === expectedHashHex;
}
