import { createCipheriv, scryptSync, randomBytes } from 'crypto';

function encrypt(text, password, salt) {
    const key = scryptSync(password, salt, 32);
    const iv = randomBytes(16);
    
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    // Return as a single base64 string: IV + Tag + Encrypted Data
    return Buffer.concat([iv, tag, encrypted]).toString('base64');
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

    const { PUSH_TOKENS, SALT_STRING } = process.env;

    if (!PUSH_TOKENS || !SALT_STRING) {
        return res.status(500).json({ error: 'Server not configured.' });
    }

    try {
        const long_url = req.body.long_url;
        const user_key = req.body.user_key || SALT_STRING;

        return res.status(200).json({ success: true, encrypted: encrypt(long_url, 'asd', user_key) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
