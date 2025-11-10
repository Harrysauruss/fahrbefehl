"use client"

import { useState } from "react"
import type { Fahrzeug } from "@/lib/types"
import { getVehicleIcon } from "@/lib/vehicles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface VehicleSelectorProps {
  vehicles: Fahrzeug[]
  selectedVehicle: Fahrzeug | null
  onSelect: (vehicle: Fahrzeug) => void
}

export default function VehicleSelector({ vehicles, selectedVehicle, onSelect }: VehicleSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredVehicles = vehicles.filter((vehicle) => vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-foreground">Zugfahrzeug wählen</h2>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Fahrzeug durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredVehicles.map((vehicle) => (
          <Button
            key={vehicle.id}
            onClick={() => onSelect(vehicle)}
            variant={selectedVehicle?.id === vehicle.id ? "default" : "outline"}
            className="h-auto py-4 px-4 flex flex-col items-start justify-start"
          >
            <span className="text-3xl mb-2">{getVehicleIcon(vehicle)}</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-base">{vehicle.name}</span>
              <span className="text-xs opacity-75">
                {vehicle.anzahl_achsen} Achse(n) • {vehicle.gewichte.gesamtgewicht_kg.toLocaleString()} kg
              </span>
            </div>
          </Button>
        ))}
        {filteredVehicles.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full text-center py-4">Keine Fahrzeuge gefunden</p>
        )}
      </div>
    </div>
  )
}
