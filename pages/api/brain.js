import { graphql, payment_information as getPaymentInformation } from "./helpers/functions";

export default async function handler(req, res) {

    const { cc, em, ey, cvv } = req.body;

    // Check if any field is missing or empty
    if (!cc || !em || !ey || !cvv) {
        return res.status(400).json({ error: "cc, em, ey, or cvv is missing or empty" });
    }

    try {
        // Fetching GraphQL data
        const graphql_data = await graphql(cc, em, ey, cvv);
        const tokencc = await graphql_data.data.tokenizeCreditCard.token;

        if (!tokencc) {
            return res.status(500).json({ error: "Tokenization failed" });
        }

        console.log(` ✔ token-cc : ${tokencc}`);

        // Fetching payment information
        const paymentInfo = await getPaymentInformation(tokencc);

        // Assuming you want to send both tokencc and paymentInfo in response
        const responseJson = {
            paymentInfo,
        };

        res.status(200).json(responseJson);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
