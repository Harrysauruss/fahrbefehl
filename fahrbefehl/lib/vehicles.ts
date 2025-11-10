import type { Fahrzeug } from "./types"

let vehiclesData: { vehicles: Fahrzeug[]; trailers: Fahrzeug[] } | null = null

export async function getVehiclesData() {
  if (vehiclesData) return vehiclesData

  const response = await fetch("/data/vehicles.json")
  vehiclesData = await response.json()
  return vehiclesData
}

export function getVehicleIcon(vehicle: Fahrzeug): string {
  if (vehicle.typ === "zugfahrzeug") {
    if (vehicle.anzahl_achsen === 2) return "🚙"
    if (vehicle.anzahl_achsen === 4 && vehicle.gesamtgewicht_kg < 20000) return "🚗"
    if (vehicle.anzahl_achsen === 4) return "🚐"
    return "🏎️"
  }
  if (vehicle.typ === "anhaenger") {
    if (vehicle.anzahl_achsen === 1) return "📦"
    if (vehicle.anzahl_achsen === 2) return "🚚"
    return "🛒"
  }
  return "📦"
}

export function getCompatibleTrailers(vehicle: Fahrzeug, trailers: Fahrzeug[]): Fahrzeug[] {
  if (!vehicle.zughaken_details) return []

  const category = vehicle.zughaken_details.erlaubte_anhaenger_kategorie
  if (category === "keine") return []

  return trailers.filter((trailer) => {
    const trailerCategories = (trailer as any).kompatible_zugfahrzeuge || []
    return (
      trailerCategories.includes(vehicle.kategorie_ausweis) &&
      vehicle.zughaken_details!.max_anhaengelast_kg >= trailer.gewichte.gesamtgewicht_kg
    )
  })
}
