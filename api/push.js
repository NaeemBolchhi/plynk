// Import simply crypto js library
import SimpleCrypto from "../lib/scrypto.min.js"

const scrypto = {
    encode: function (key, string) {
        const sc = new SimpleCrypto(key);
        return sc.encrypt(string);
    },
    decode: function (key, string) {
        const sc = new SimpleCrypto(key);
        return sc.decrypt(string);
    }
};

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

    const { PUSH_TOKENS } = process.env;

    if (!PUSH_TOKENS) {
        return res.status(500).json({ error: 'Server not configured.' });
    }

    try {
        return res.status(200).json({ success: true, request: JSON.stringify(req) });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}