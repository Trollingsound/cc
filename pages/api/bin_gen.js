import { generateNumber } from "./helpers/functions"

export default async function handler(req, res) {

    const { gen_num, only_visa, only_master } = req.body

    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
    }

    const gen_bin = generateNumber(gen_num, only_visa, only_master)

    res.status(200).json(gen_bin);

} 