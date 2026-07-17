const places = [
  {
    name: "Café Brunswik",
    address: "Brunswiker Straße 55, 24105 Kiel",
    category: "cafe",
    dogs_allowed: "yes",
    water_available: "yes",
    description: "A cosy café in the heart of Kiel. Dogs welcome inside.",
  },
  {
    name: "Schrevenpark",
    address: "Schreventeich, 24118 Kiel",
    category: "park",
    dogs_allowed: "yes",
    water_available: "not_sure",
    description: "A large park with plenty of space for dogs to run around.",
  },
  {
    name: "Café Mum & Dad",
    address: "Sophienblatt 45, 24114 Kiel",
    category: "cafe",
    dogs_allowed: "yes",
    water_available: "yes",
    description: "Dog-friendly café with a spacious outdoor terrace.",
  },
];

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Pawmap/1.0" },
  });
  const data = await res.json();
  if (!data.length) throw new Error(`Not found: ${address}`);
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function seed() {
  const SUPABASE_URL = "https://ukdcqblcnnlsnqdutwzz.supabase.co";
  const SUPABASE_KEY = "sb_publishable_ajdyUI5Qxeixxzmr-3yF6A_XU7lvPkI";

  for (const place of places) {
    console.log(`Geocoding: ${place.address}`);
    const { lat, lng } = await geocode(place.address);
    console.log(`  → lat: ${lat}, lng: ${lng}`);

    const res = await fetch(`${SUPABASE_URL}/rest/v1/places`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({ ...place, lat, lng }),
    });

    if (res.ok) {
      console.log(`  ✓ Added: ${place.name}`);
    } else {
      const err = await res.text();
      console.log(`  ✗ Failed: ${err}`);
    }

    // Wait 1 second between requests (Nominatim rate limit)
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log("Done!");
}

seed();