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

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const cypher = {
    goIn: function (arr, displace) {
        const goodIndex = (displace % arr.length + arr.length) % arr.length;

        return arr[goodIndex];
    },
    encode: function (string, displace) {
        let newString = "";

        for (let x = 0; x < String(string).length; x++) {
            if (CYPHER_ARR.includes(String(string)[x])) {
                newString += cypher.goIn(CYPHER_ARR, CYPHER_ARR.indexOf(String(string)[x]) + displace);
            } else {
                newString += String(string)[x];
            }
        }

        return newString;
    }
};

function dateVer() {
    const date = new Date();

    return date.getFullYear().toString() +
           date.getMonth().toString().padStart(2,0) +
           date.getDate().toString().padStart(2,0) +
           date.getHours().toString().padStart(2,0) +
           date.getMinutes().toString().padStart(2,0) +
           date.getSeconds().toString().padStart(2,0);
}

async function createPaste(keys, paste_content, expiration) {
    const url = 'https://pastebin.com/api/api_post.php';

    const params = new URLSearchParams();
    params.append('api_option', 'paste');
    params.append('api_paste_private', '0'); // Marked as public
    params.append('api_dev_key', keys.dev_key);
    params.append('api_paste_code', paste_content);

    // Optional parameters
    params.append('api_paste_name', dateVer());
    params.append('api_paste_expire_date', expiration);
    params.append('api_paste_format', 'text');
    params.append('api_user_key', keys.user_key);

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

    const { PUSH_TOKENS, SALT_STRING, PASS_STRING, CYPHER_CASES } = process.env;

    if (!PUSH_TOKENS || !SALT_STRING || !PASS_STRING || !CYPHER_CASES) {
        return res.status(500).json({ error: 'Server not configured.' });
    }

    const PUSH_TOKENS_ARR = JSON.parse(PUSH_TOKENS);

    const CYPHER_ARR = [...CYPHER_CASES];

    try {
        const long_url = req.body.long_url;
        const user_pass = req.body.user_pass || SALT_STRING;
        const expiration = req.body.expiration || '1D';

        const encrypted_url = encrypt(long_url, PASS_STRING, user_pass);

        const pasteResponse = await createPaste(PUSH_TOKENS_ARR[0], encrypted_url, expiration);

        const randomDisplacer = getRandom(1,9);

        const pasteDisplaced = cypher.encode(pasteResponse.replace(/.*\/(.*)$/,'$1'), randomDisplacer) + randomDisplacer;

        if (pasteResponse.match(/pastebin\.com/)) {
            return res.status(200).json({ success: true, response: pasteDisplaced });
        } else {
            return res.status(200).json({ success: false, response: pasteResponse });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
