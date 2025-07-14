import { fetch } from "expo/fetch";

async function fetchPayment(jsonBody) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(jsonBody);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  return new Promise((resolve) => {
    fetch(`${process.env.FETCH_PAYMENT_URL_API}`, requestOptions)
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch(() => resolve(null));
  });
}

export async function POST(request) {
  const body = await request.json();
  if (Object.keys(body).indexOf("nonce") > -1) {
    const {result} = await fetchPayment(body);
    return Response.json({ result });
  } else if (Object.keys(body).indexOf("user") > -1) {
    const {result} = await fetchPayment(body);
    return Response.json({ result });
  } else {
    console.log("error");
    return Response.json({ result: null });
  }
}
