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
    <Card className="p-6">
      <h3 className="text-xl font-black uppercase tracking-tight mb-6 text-foreground border-b-[3px] border-border pb-4">
        Beladung {location === "zugfahrzeug" ? "Fahrzeug" : "Anhänger"}
      </h3>

      <div className="space-y-4">
        <div className="space-y-4 bg-muted/30 p-4 border-[3px] border-border">
          <Input 
            placeholder="LADUNGSBEZEICHNUNG" 
            value={cargoName} 
            onChange={(e) => setCargoName(e.target.value)} 
            className="font-bold uppercase"
          />

          <Input
            placeholder="GEWICHT (KG)"
            type="number"
            value={cargoWeight}
            onChange={(e) => setCargoWeight(e.target.value)}
            className="font-bold uppercase font-mono"
          />

          <Button onClick={handleAddCargo} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 border-border">
            HINZUFÜGEN
          </Button>
        </div>

        {/* Cargo List */}
        {relevantCargo.length > 0 && (
          <div className="mt-6 pt-6 border-t-[3px] border-border space-y-3">
            <h4 className="font-bold uppercase text-sm text-muted-foreground mb-3">Aktuelle Beladung</h4>
            {relevantCargo.map((item) => (
              <div key={item.id} className="flex items-center justify-between bg-background border-[3px] border-border p-3 shadow-[var(--shadow-brutal)]">
                <div>
                  <p className="font-black uppercase text-lg tracking-tight">{item.name}</p>
                  <p className="font-mono font-bold text-muted-foreground">{item.weight_kg.toLocaleString()} KG</p>
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => onRemoveCargo(item.id)}
                  className="rounded-none border-2 border-destructive-foreground active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <Trash2 size={20} />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}
