import { fetch } from "expo/fetch";

async function getBalanceByClabe(body) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");
  const raw = JSON.stringify(body);
  const requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  return new Promise((resolve) => {
    fetch(`${process.env.GET_BALANCE_BY_CLABE_API}`, requestOptions)
      .then((response) => response.json())
      .then((result) => resolve(result))
      .catch(() => resolve(null));
  });
}

export async function POST(request) {
  const body = await request.json();
  const { result } = await getBalanceByClabe(body);
  return Response.json({ result });
}
