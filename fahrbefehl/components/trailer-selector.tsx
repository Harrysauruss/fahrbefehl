"use client"

import { useState } from "react"
import type { Fahrzeug } from "@/lib/types"
import { getVehicleIcon } from "@/lib/vehicles"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface TrailerSelectorProps {
  trailers: Fahrzeug[]
  selectedTrailer: Fahrzeug | undefined
  onSelect: (trailer: Fahrzeug | undefined) => void
}

export default function TrailerSelector({ trailers, selectedTrailer, onSelect }: TrailerSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTrailers = trailers.filter((trailer) => trailer.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 text-foreground">Anhänger wählen (optional)</h2>

      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="Anhänger durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Button
          onClick={() => onSelect(undefined)}
          variant={!selectedTrailer ? "default" : "outline"}
          className="h-auto py-4 px-4 flex flex-col items-start justify-start"
        >
          <span className="text-3xl mb-2">✗</span>
          <span className="font-semibold text-base">Kein Anhänger</span>
        </Button>

        {filteredTrailers.map((trailer) => (
          <Button
            key={trailer.id}
            onClick={() => onSelect(trailer)}
            variant={selectedTrailer?.id === trailer.id ? "default" : "outline"}
            className="h-auto py-4 px-4 flex flex-col items-start justify-start"
          >
            <span className="text-3xl mb-2">{getVehicleIcon(trailer)}</span>
            <div className="flex flex-col items-start">
              <span className="font-semibold text-base">{trailer.name}</span>
              <span className="text-xs opacity-75">
                {trailer.anzahl_achsen} Achse(n) • {trailer.gewichte.gesamtgewicht_kg.toLocaleString()} kg
              </span>
            </div>
          </Button>
        ))}
        {filteredTrailers.length === 0 && (
          <p className="text-muted-foreground text-sm col-span-full text-center py-4">Keine Anhänger gefunden</p>
        )}
      </div>
    </div>
  )
}
