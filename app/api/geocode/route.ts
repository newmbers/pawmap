export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address!)}&format=json&limit=1`,
    { headers: { "User-Agent": "Pawmap/1.0" } }
  );

  const data = await response.json();

  if (data.length === 0) {
    return Response.json({ error: "Address not found" }, { status: 404 });
  }

  return Response.json({
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon),
  });
}
