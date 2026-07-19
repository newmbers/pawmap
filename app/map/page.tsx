
import { supabase } from "@/lib/supabase";
import MapClient from "./MapClient";
export const dynamic = "force-dynamic";

type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  dogs_allowed: string;
  category: string;
  photo_url: string | null;
  reviews: { rating: number }[];
};

export default async function MapPage() {
const { data: places } = await supabase
    .from("places")
    .select("id, name, address, lat, lng, dogs_allowed, category, photo_url, reviews(rating)");
  return (
    <main className="h-screen w-full relative">
      <MapClient places={(places as Place[]) || []} />

    </main>
  );
}