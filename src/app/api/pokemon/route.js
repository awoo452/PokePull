const DEFAULT_API_BASE_URL =
  "https://pokemon-api-03a0e8d55140.herokuapp.com";

const buildApiUrl = (baseUrl, requestUrl) => {
  const incoming = new URL(requestUrl);
  const apiUrl = new URL("/pokemon/random", baseUrl);

  const persist = incoming.searchParams.get("persist");
  const range = incoming.searchParams.get("range");

  if (persist) {
    apiUrl.searchParams.set("persist", persist);
  } else {
    apiUrl.searchParams.set("persist", "false");
  }

  if (range) {
    apiUrl.searchParams.set("range", range);
  }

  return apiUrl;
};

export async function GET(request) {
  const baseUrl = process.env.POKEMON_API_BASE_URL || DEFAULT_API_BASE_URL;
  const apiUrl = buildApiUrl(baseUrl, request.url);

  try {
    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const message = `Pokemon API error (${response.status})`;
      return Response.json({ error: message }, { status: response.status });
    }

    const data = await response.json();
    return Response.json(data, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: "Unable to reach the Pokemon API." },
      { status: 502 }
    );
  }
}
