import { createDecipheriv, scryptSync } from 'crypto';

function decrypt(encryptedBase64, password, salt) {
    const key = scryptSync(password, salt, 32);
    
    const buffer = Buffer.from(encryptedBase64, 'base64');
    
    // Extract the parts we combined during encryption
    const iv = buffer.subarray(0, 16);
    const tag = buffer.subarray(16, 32);
    const text = buffer.subarray(32);
    
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    
    return Buffer.concat([decipher.update(text), decipher.final()]).toString('utf8');
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { SALT_STRING } = process.env;

    if (!SALT_STRING) {
        return res.status(500).json({ error: 'Server not configured.' });
    }

    // try {
    //     const long_url = req.body.long_url;
    //     const user_key = req.body.user_key || SALT_STRING;

    //     return res.status(200).json({ success: true, encrypted: encrypt(long_url, 'asd', user_key) });
    // } catch (err) {
    //     console.error(err);
    //     return res.status(500).json({ error: 'Internal server error.' });
    // }
}
