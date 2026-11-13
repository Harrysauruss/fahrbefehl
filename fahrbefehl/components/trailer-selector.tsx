"use client"

import { useState } from "react"
import type { Fahrzeug } from "@/lib/types"
import { VehicleIcon } from "@/components/vehicle-icon"
import { cn } from "@/lib/utils"
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
    <div className="flex flex-col h-full border-[3px] border-border bg-card p-6 shadow-[var(--shadow-brutal)]">
      <h2 className="text-2xl font-black uppercase tracking-tight mb-6 text-foreground border-b-[3px] border-border pb-4">Anhänger wählen (optional)</h2>

      <div className="mb-6 relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder="ANHÄNGER DURCHSUCHEN..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 font-bold uppercase placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button
          onClick={() => onSelect(undefined)}
          variant={!selectedTrailer ? "default" : "outline"}
          className={cn(
            "h-auto py-5 px-5 flex flex-col items-start justify-start border-[3px] transition-all",
            !selectedTrailer 
              ? "bg-primary text-primary-foreground translate-x-[2px] translate-y-[2px] shadow-none" 
              : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <span className="text-4xl mb-3 block text-destructive">✗</span>
          <span className="font-black text-lg tracking-tight leading-tight uppercase">Kein Anhänger</span>
        </Button>

        {filteredTrailers
          .sort((a, b) => {
             const lowerSearch = searchQuery.toLowerCase();
             const aMatch = a.name.toLowerCase() === lowerSearch;
             const bMatch = b.name.toLowerCase() === lowerSearch;
             if (aMatch && !bMatch) return -1;
             if (!aMatch && bMatch) return 1;
             return 0;
          })
          .map((trailer) => {
          const isSelected = selectedTrailer?.id === trailer.id;
          return (
            <Button
              key={trailer.id}
              onClick={() => onSelect(trailer)}
              variant={isSelected ? "default" : "outline"}
              className={cn(
                "h-auto py-5 px-5 flex flex-col items-start justify-start border-[3px] transition-all",
                isSelected 
                  ? "bg-primary text-primary-foreground translate-x-[2px] translate-y-[2px] shadow-none" 
                  : "bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <div className="flex w-full items-start justify-between mb-4 min-h-[80px]">
                <VehicleIcon vehicle={trailer} className="h-20 w-auto" />
                {trailer.gewichte.nutzlast_kg > 0 && (
                  <span className={cn(
                    "text-xs font-black uppercase px-2 py-1",
                    isSelected ? "bg-background text-foreground" : "bg-primary text-primary-foreground"
                  )}>
                    +{trailer.gewichte.nutzlast_kg.toLocaleString()} KG MAX
                  </span>
                )}
              </div>

              <div className="flex flex-col items-start w-full gap-2">
                <span className="font-black text-lg tracking-tight leading-tight w-full break-normal text-left">{trailer.name}</span>
                <div className="flex flex-wrap gap-2">
                  <span className={cn(
                    "text-xs font-bold uppercase py-1 px-2 border-2",
                    isSelected ? "border-primary-foreground/30" : "border-foreground/20"
                  )}>
                    {trailer.anzahl_achsen} ACHSEN
                  </span>
                  <span className={cn(
                    "text-xs font-bold uppercase py-1 px-2 border-2",
                    isSelected ? "border-primary-foreground/30" : "border-foreground/20"
                  )}>
                    M. {trailer.gewichte.gesamtgewicht_kg.toLocaleString()} KG
                  </span>
                </div>
              </div>
            </Button>
          )
        })}
        {filteredTrailers.length === 0 && (
          <div className="col-span-full py-8 text-center border-[3px] border-dashed border-border">
            <p className="text-foreground font-bold uppercase">Keine Anhänger gefunden</p>
          </div>
        )}
      </div>
    </div>
  )
}
