import crypto from 'crypto';

const ALGORITHM = 'aes-256-ecb';

// ép KEY về đúng 32 bytes
const KEY = crypto
    .createHash('sha256')
    .update(process.env.DB_SECRET_KEY)
    .digest(); // Buffer 32 bytes

const Crypto = {
    encryptPassword: (text) => {
        const cipher = crypto.createCipheriv(ALGORITHM, KEY, null);
        return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    },

    decryptPassword: (encrypted) => {
        const decipher = crypto.createDecipheriv(ALGORITHM, KEY, null);
        return decipher.update(encrypted, 'hex', 'utf8') + decipher.final('utf8');
    }
};

export default Crypto;
