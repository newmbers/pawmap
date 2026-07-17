
import { supabase } from "@/lib/supabase";
import MapClient from "./MapClient";
import BottomNav from "@/components/BottomNav";

type Place = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  dogs_allowed: string;
  category: string;
};

export default async function MapPage() {
  const { data: places } = await supabase
    .from("places")
    .select("id, name, address, lat, lng, dogs_allowed, category");

  return (
    <main className="h-screen w-full relative">
      <MapClient places={(places as Place[]) || []} />
       <BottomNav />
    </main>
  );
}