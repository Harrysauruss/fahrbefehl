"use client"

import { useEffect, useState } from "react"
import type { Fahrzeug, Cargo, Combination } from "@/lib/types"
import { getVehiclesData, getCompatibleTrailers } from "@/lib/vehicles"
import VehicleSelector from "@/components/vehicle-selector"
import TrailerSelector from "@/components/trailer-selector"
import CargoManager from "@/components/cargo-manager"
import Dashboard from "@/components/dashboard"
import { ThemeToggle } from "@/components/theme-toggle"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Step = "selection" | "cargo" | "summary"

export default function Home() {
  const [step, setStep] = useState<Step>("selection")
  const [combination, setCombination] = useState<Combination>({
    vehicle: null as any,
    trailer: undefined,
    cargo: [],
  })
  const [vehicles, setVehicles] = useState<Fahrzeug[]>([])
  const [trailers, setTrailers] = useState<Fahrzeug[]>([])
  const [compatibleTrailers, setCompatibleTrailers] = useState<Fahrzeug[]>([])

  useEffect(() => {
    const loadData = async () => {
      const data = await getVehiclesData()
      setVehicles(data.vehicles)
      setTrailers(data.trailers)
    }
    loadData()
  }, [])

  useEffect(() => {
    if (combination.vehicle) {
      const compatible = getCompatibleTrailers(combination.vehicle, trailers)
      setCompatibleTrailers(compatible)
      setCombination((prev) => ({ ...prev, trailer: undefined }))
    }
  }, [combination.vehicle, trailers])

  const handleSelectVehicle = (vehicle: Fahrzeug) => {
    setCombination((prev) => ({ ...prev, vehicle }))
  }

  const handleSelectTrailer = (trailer: Fahrzeug | undefined) => {
    setCombination((prev) => ({ ...prev, trailer }))
  }

  const handleAddCargo = (cargo: Cargo) => {
    setCombination((prev) => ({
      ...prev,
      cargo: [...prev.cargo, cargo],
    }))
  }

  const handleRemoveCargo = (cargoId: string) => {
    setCombination((prev) => ({
      ...prev,
      cargo: prev.cargo.filter((c) => c.id !== cargoId),
    }))
  }

  const handleStartNew = () => {
    setCombination({
      vehicle: null as any,
      trailer: undefined,
      cargo: [],
    })
    setStep("selection")
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Theme Toggle */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">Fahrbefehl</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Schweizer Militärfahrzeugkombinations-Kalkulator
            </p>
          </div>
        </div>

        {/* Step 1: Vehicle & Trailer Selection */}
        {step === "selection" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <VehicleSelector
                  vehicles={vehicles}
                  selectedVehicle={combination.vehicle}
                  onSelect={handleSelectVehicle}
                />
              </Card>

              {combination.vehicle && (
                <Card className="p-6">
                  <TrailerSelector
                    trailers={compatibleTrailers}
                    selectedTrailer={combination.trailer}
                    onSelect={handleSelectTrailer}
                  />
                </Card>
              )}
            </div>

            {combination.vehicle && combination.trailer !== undefined && (
              <Button onClick={() => setStep("cargo")} className="w-full py-6 text-base" size="lg">
                Weiter zur Beladung
              </Button>
            )}
          </div>
        )}

        {/* Step 2: Cargo Selection */}
        {step === "cargo" && combination.vehicle && (
          <div className="space-y-6">
            {/* Overview Section */}
            <Card className="p-6 border">
              <h2 className="text-lg font-semibold mb-4 text-foreground">Fahrzeugkombination</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Zugfahrzeug</p>
                  <p className="font-semibold text-foreground">{combination.vehicle.name}</p>
                </div>
                {combination.trailer && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Anhänger</p>
                    <p className="font-semibold text-foreground">{combination.trailer.name}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Achsen</p>
                  <p className="font-semibold text-foreground">
                    {combination.vehicle.anzahl_achsen + (combination.trailer?.anzahl_achsen || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">Leergewicht</p>
                  <p className="font-semibold text-foreground">
                    {(
                      combination.vehicle.gewichte.leergewicht_kg + (combination.trailer?.gewichte.leergewicht_kg || 0)
                    ).toLocaleString()}{" "}
                    kg
                  </p>
                </div>
              </div>
            </Card>

            {/* Cargo Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CargoManager
                cargo={combination.cargo}
                onAddCargo={handleAddCargo}
                onRemoveCargo={handleRemoveCargo}
                hasTrailer={!!combination.trailer}
                location="zugfahrzeug"
              />

              {combination.trailer && (
                <CargoManager
                  cargo={combination.cargo}
                  onAddCargo={handleAddCargo}
                  onRemoveCargo={handleRemoveCargo}
                  hasTrailer={true}
                  location="anhaenger"
                />
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button onClick={() => setStep("summary")} className="flex-1 py-6 text-base" size="lg">
                Zusammenfassung anzeigen
              </Button>
              <Button
                onClick={() => setStep("selection")}
                variant="outline"
                className="flex-1 py-6 text-base"
                size="lg"
              >
                Zurück
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Summary & Dashboard */}
        {step === "summary" && combination.vehicle && (
          <div className="space-y-6">
            <Dashboard combination={combination} />

            <div className="flex gap-3">
              <Button
                onClick={handleStartNew}
                className="flex-1 py-6 text-base bg-transparent"
                size="lg"
                variant="outline"
              >
                Neue Berechnung
              </Button>
              <Button onClick={() => setStep("cargo")} variant="ghost" className="flex-1 py-6 text-base" size="lg">
                Zurück zur Beladung
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
