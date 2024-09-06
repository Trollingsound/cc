import { get_tokens, check_bin } from "./helpers/functions.js";

export default async function handler(req, res) {
    const { bin } = req.body;

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const tokens = await get_tokens();
        const CsrfToken = tokens.csrfToken;
        const XcsrfToken = tokens.xcsrfToken;

        console.log(`\n ✔  ready to call with bin checker aggent`)

        if (bin == Array) {
            res.status(200).json("wait")
        }

        else if (bin == String || Number) {
            const check_bin_response = await check_bin(CsrfToken, XcsrfToken, bin);
 
            res.status(200).json(check_bin_response)
        }

    } catch (error) {
        return res.status(500).json({ error: error.toString() });
    }
}
