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

const cypher = {
    goIn: function (arr, displace) {
        const goodIndex = (displace % arr.length + arr.length) % arr.length;
        
        return arr[goodIndex];
    },
    decode: function (string, displace) {
        let originalString = "";

        for (let x = 0; x < String(string).length; x++) {
            if (CYPHER_ARR.includes(String(string)[x])) {
                originalString += cypher.goIn(CYPHER_ARR, CYPHER_ARR.indexOf(String(string)[x]) - displace);
            } else {
                originalString += String(string)[x];
            }
        }

        return originalString;
    }
};

async function getPaste(paste_id) {
    const url = `https://pastebin.com/raw/${paste_id}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }

        const data = await response.text();
        return data;
    } catch (error) {
        console.error('Error retrieving paste:', error);
        return null;
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

    const { SALT_STRING, PASS_STRING, CYPHER_CASES } = process.env;

    if (!SALT_STRING || !PASS_STRING || !CYPHER_CASES) {
        return res.status(500).json({ error: 'Server not configured.' });
    }

    const CYPHER_ARR = [...CYPHER_CASES];

    try {
        const slugDisplacer = parseInt(req.body.slug.slice(-1));
        const slugDisplaced = req.body.slug.slice(0, -1);
        const slug = cypher.decode(slugDisplaced, slugDisplacer);
        const user_pass = req.body.user_pass || SALT_STRING;
        
        const pasteResponse = await getPaste(slug);

        const decrypted_url = decrypt(pasteResponse, PASS_STRING, user_pass);

        return res.status(200).json({ success: true, response: decrypted_url });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
