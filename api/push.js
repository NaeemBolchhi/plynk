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

function dateVer() {
    const date = new Date();

    return date.getFullYear().toString() +
           date.getMonth().toString().padStart(2,0) +
           date.getDate().toString().padStart(2,0) +
           date.getHours().toString().padStart(2,0) +
           date.getMinutes().toString().padStart(2,0) +
           date.getSeconds().toString().padStart(2,0);
}

async function createPaste(dev_key, paste_content, expiration) {
    const url = 'https://pastebin.com/api/api_post.php';

    const params = new URLSearchParams();
    params.append('api_option', 'paste');
    params.append('api_paste_private', '0'); // Marked as public
    params.append('api_dev_key', dev_key);
    params.append('api_paste_code', paste_content);

    // Optional parameters
    params.append('api_paste_name', dateVer());
    params.append('api_paste_expire_date', expiration);
    params.append('api_paste_format', 'text');

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params
        });

        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error creating paste:', error);
    }
}

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Origin', 'https://plynk.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    const { PUSH_TOKENS, SALT_STRING, PASS_STRING } = process.env;

    if (!PUSH_TOKENS || !SALT_STRING) {
        return res.status(500).json({ error: 'Server not configured.' });
    }

    const PUSH_TOKENS_ARR = JSON.parse(PUSH_TOKENS);

    try {
        const long_url = req.body.long_url;
        const user_key = req.body.user_key || SALT_STRING;
        const expiration = req.body.expiration || '1D';

        const encrypted_url = encrypt(long_url, PASS_STRING, user_key);

        const pasteResponse = await createPaste(PUSH_TOKENS_ARR[0], encrypted_url, expiration);

        if (pasteResponse.match(/pastebin\.com/)) {
            return res.status(200).json({ success: true, response: pasteResponse.replace(/.*\/(.*)$/,'$1') });
        } else {
            return res.status(200).json({ success: false, response: pasteResponse });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
