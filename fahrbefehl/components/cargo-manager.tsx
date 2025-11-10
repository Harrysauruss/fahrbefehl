"use client"

import { useState } from "react"
import type { Cargo } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2 } from "lucide-react"

interface CargoManagerProps {
  cargo: Cargo[]
  onAddCargo: (cargo: Cargo) => void
  onRemoveCargo: (cargoId: string) => void
  hasTrailer: boolean
  location: "zugfahrzeug" | "anhaenger"
}

export default function CargoManager({ cargo, onAddCargo, onRemoveCargo, hasTrailer, location }: CargoManagerProps) {
  const [cargoName, setCargoName] = useState("")
  const [cargoWeight, setCargoWeight] = useState("")

  const handleAddCargo = () => {
    if (cargoName && cargoWeight) {
      onAddCargo({
        id: Date.now().toString(),
        name: cargoName,
        weight_kg: Number.parseFloat(cargoWeight),
        location,
      })
      setCargoName("")
      setCargoWeight("")
    }
  }

  const relevantCargo = cargo.filter((c) => c.location === location)

  return (
    <Card className="p-4 border">
      <h3 className="text-base font-semibold mb-4 text-foreground">
        Beladung {location === "zugfahrzeug" ? "Fahrzeug" : "Anhänger"}
      </h3>

      <div className="space-y-3">
        <Input placeholder="Ladungsbezeichnung" value={cargoName} onChange={(e) => setCargoName(e.target.value)} />

        <Input
          placeholder="Gewicht (kg)"
          type="number"
          value={cargoWeight}
          onChange={(e) => setCargoWeight(e.target.value)}
        />

        <Button onClick={handleAddCargo} className="w-full">
          Beladung hinzufügen
        </Button>

        {/* Cargo List */}
        {relevantCargo.length > 0 && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {relevantCargo.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                <div>
                  <p className="font-medium text-sm">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.weight_kg.toLocaleString()} kg</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemoveCargo(item.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
