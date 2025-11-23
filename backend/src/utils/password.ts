import bcrypt from 'bcrypt';
import config from '../config';

/**
 * Hash a plain text password using bcrypt
 * @param password - The plain text password to hash
 * @returns Hashed password
 */
export const hashPassword = async (password: string): Promise<string> => {
  const hash = await bcrypt.hash(password, config.BCRYPT_ROUNDS);
  return hash;
};

/**
 * Compare a plain text password with a hashed password
 * @param password - The plain text password
 * @param hash - The hashed password to compare against
 * @returns True if passwords match, false otherwise
 */
export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  const isMatch = await bcrypt.compare(password, hash);
  return isMatch;
};
