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
import { cn } from "@/lib/utils"

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
      setVehicles(data?.vehicles || [])
      setTrailers(data?.trailers || [])
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
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b-[4px] border-foreground pb-6 gap-4">
          <div>
            <h1 className="text-5xl md:text-6xl font-black uppercase tracking-tighter text-foreground mb-2">Fahrbefehl</h1>
            <p className="font-bold text-lg md:text-xl uppercase bg-foreground text-background inline-block px-3 py-1">
              Schweizer Militärfahrzeugkombinations-Kalkulator
            </p>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex flex-col sm:flex-row w-full mb-12 border-[4px] border-border bg-card shadow-[var(--shadow-brutal)]">
          <div className={cn(
            "flex-1 p-4 font-black uppercase tracking-widest text-center border-b-[4px] sm:border-b-0 sm:border-r-[4px] border-border transition-colors",
            step === "selection" ? "bg-primary text-primary-foreground" : "text-muted-foreground opacity-50"
          )}>
            1. FAHRZEUGE WÄHLEN
          </div>
          <div className={cn(
            "flex-1 p-4 font-black uppercase tracking-widest text-center border-b-[4px] sm:border-b-0 sm:border-r-[4px] border-border transition-colors",
            step === "cargo" ? "bg-primary text-primary-foreground" : "text-muted-foreground opacity-50"
          )}>
            2. BELADUNG ERFASSEN
          </div>
          <div className={cn(
            "flex-1 p-4 font-black uppercase tracking-widest text-center transition-colors",
            step === "summary" ? "bg-primary text-primary-foreground" : "text-muted-foreground opacity-50"
          )}>
            3. ZUSAMMENFASSUNG
          </div>
        </div>

        {/* Step 1: Vehicle & Trailer Selection */}
        {step === "selection" && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-32">
              <div className="h-full">
                <VehicleSelector
                  vehicles={vehicles}
                  selectedVehicle={combination.vehicle}
                  onSelect={handleSelectVehicle}
                />
              </div>

              {combination.vehicle && (
                <div className="h-full animate-in fade-in slide-in-from-right-8 duration-500">
                  <TrailerSelector
                    trailers={compatibleTrailers}
                    selectedTrailer={combination.trailer}
                    onSelect={handleSelectTrailer}
                  />
                </div>
              )}
            </div>
            
            {/* Sticky Action Footer */}
            {combination.vehicle && combination.trailer !== undefined && (
              <div className="fixed bottom-0 left-0 right-0 p-4 md:p-6 bg-background border-t-[4px] border-foreground z-50 animate-in slide-in-from-bottom-full duration-300">
                <div className="max-w-6xl mx-auto flex justify-end">
                  <Button onClick={() => { window.scrollTo(0,0); setStep("cargo") }} className="w-full md:w-auto md:min-w-[400px] py-8 text-2xl font-black uppercase tracking-widest border-[4px] border-border shadow-[var(--shadow-brutal)]">
                    Weiter zur Beladung →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Cargo Selection */}
        {step === "cargo" && combination.vehicle && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Overview Section - Sticky Context Bar */}
            <div className="sticky top-4 z-10 w-full mb-8 border-[4px] border-border bg-card shadow-[var(--shadow-brutal)]">
              <div className="bg-foreground text-background p-4 border-b-[4px] border-border">
                <h2 className="text-2xl font-black uppercase tracking-tighter">Aktive Kombination</h2>
              </div>
              <div className="p-4 md:p-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 bg-accent">
                <div className="flex flex-col border-l-[4px] border-foreground pl-3">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Zugfahrzeug</p>
                  <p className="font-black text-lg leading-tight uppercase text-foreground">{combination.vehicle.name}</p>
                </div>
                {combination.trailer ? (
                  <div className="flex flex-col border-l-[4px] border-foreground pl-3">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Anhänger</p>
                    <p className="font-black text-lg leading-tight uppercase text-foreground">{combination.trailer.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col border-l-[4px] border-foreground pl-3 opacity-50">
                    <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Anhänger</p>
                    <p className="font-black text-lg leading-tight uppercase text-foreground">KEINER</p>
                  </div>
                )}
                <div className="flex flex-col border-l-[4px] border-foreground pl-3">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Nutzlast / Total</p>
                  <p className="font-black text-xl font-mono text-foreground">
                    {combination.cargo.reduce((sum, item) => sum + item.weight_kg, 0).toLocaleString()} / {(
                      combination.vehicle.gewichte.nutzlast_kg + (combination.trailer?.gewichte.nutzlast_kg || 0)
                    ).toLocaleString()}{" "}
                    KG
                  </p>
                </div>
                <div className="flex flex-col border-l-[4px] border-foreground pl-3">
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Achsen</p>
                  <p className="font-black text-xl font-mono text-foreground">
                    {combination.vehicle.anzahl_achsen + (combination.trailer?.anzahl_achsen || 0)}
                  </p>
                </div>
              </div>
            </div>

            {/* Cargo Selection Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={() => setStep("summary")} className="flex-1 py-8 text-xl font-black uppercase tracking-wide border-[4px] border-border shadow-[var(--shadow-brutal)]">
                ZUSAMMENFASSUNG ANZEIGEN
              </Button>
              <Button
                onClick={() => setStep("selection")}
                variant="outline"
                className="flex-[0.5] py-8 text-xl font-black uppercase tracking-wide border-[4px] border-border"
              >
                ZURÜCK
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Summary & Dashboard */}
        {step === "summary" && combination.vehicle && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Dashboard combination={combination} />

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleStartNew}
                className="flex-1 py-8 text-xl font-black uppercase tracking-wide border-[4px] border-border bg-background text-foreground hover:bg-destructive hover:text-destructive-foreground"
              >
                NEUE BERECHNUNG
              </Button>
              <Button 
                onClick={() => setStep("cargo")} 
                variant="outline" 
                className="flex-1 py-8 text-xl font-black uppercase tracking-wide border-[4px] border-border"
              >
                ZURÜCK ZUR BELADUNG
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
