
export default async function handler(req, res) {

    if (req.method !== "POST") {
        res.status(405).json({ error: "Method not allowed" });
    }

    const response = await fetch("https://tirangaapi.com/api/webapi/GetNoaverageEmerdList", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "accept-language": "en-US,en;q=0.5",
            "authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOiIxNzI2MDc4MjA2IiwibmJmIjoiMTcyNjA3ODIwNiIsImV4cCI6IjE3MjYwODAwMDYiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL2V4cGlyYXRpb24iOiI5LzEyLzIwMjQgMTI6MTA6MDYgQU0iLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBY2Nlc3NfVG9rZW4iLCJVc2VySWQiOiI5MTQ1MjEiLCJVc2VyTmFtZSI6IjkxOTY5MDYwMjUyNyIsIlVzZXJQaG90byI6IjEiLCJOaWNrTmFtZSI6Ik1lbWJlck5ORzJORVpUIiwiQW1vdW50IjoiMC43MyIsIkludGVncmFsIjoiMCIsIkxvZ2luTWFyayI6Ikg1IiwiTG9naW5UaW1lIjoiOS8xMS8yMDI0IDExOjQwOjA2IFBNIiwiTG9naW5JUEFkZHJlc3MiOiIxMDMuMTEyLjE2LjIyMiIsIkRiTnVtYmVyIjoiMCIsIklzdmFsaWRhdG9yIjoiMCIsIktleUNvZGUiOiIxMiIsIlRva2VuVHlwZSI6IkFjY2Vzc19Ub2tlbiIsIlBob25lVHlwZSI6IjAiLCJVc2VyVHlwZSI6IjAiLCJVc2VyTmFtZTIiOiIiLCJpc3MiOiJqd3RJc3N1ZXIiLCJhdWQiOiJsb3R0ZXJ5VGlja2V0In0.bI_O_SMiQ-zdvM3HYVazDGVrxD-Lz4MlPTmGbYG9RIY",
            "content-type": "application/json;charset=UTF-8",
            "priority": "u=1, i",
            "sec-ch-ua": "\"Chromium\";v=\"128\", \"Not;A=Brand\";v=\"24\", \"Brave\";v=\"128\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            "sec-gpc": "1",
            "Referer": "https://www.tirangagames.top/",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        },
        "body": "{\"pageSize\":10,\"pageNo\":1,\"typeId\":30,\"language\":0,\"random\":\"1384719982484a829e3653791cfef1d0\",\"signature\":\"99D81A5E146DDA9C7ECE107EEDA57698\",\"timestamp\":1726078379}",
        "method": "POST"
    });

    const response_json = await response.json()

    res.status(200).json(response_json);

} 