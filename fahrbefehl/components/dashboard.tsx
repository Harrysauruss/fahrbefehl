"use client"

import type { Combination } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Download, AlertCircle, CheckCircle } from "lucide-react"

interface DashboardProps {
  combination: Combination
}

export default function Dashboard({ combination }: DashboardProps) {
  const calculateWeightByLocation = (location: "zugfahrzeug" | "anhaenger") => {
    return combination.cargo.filter((c) => c.location === location).reduce((sum, c) => sum + c.weight_kg, 0)
  }

  const calculateTotalWeight = () => {
    const vehicleWeight = combination.vehicle.gewichte.leergewicht_kg
    const trailerWeight = combination.trailer ? combination.trailer.gewichte.leergewicht_kg : 0
    const vehicleCargo = calculateWeightByLocation("zugfahrzeug")
    const trailerCargo = calculateWeightByLocation("anhaenger")
    return vehicleWeight + trailerWeight + vehicleCargo + trailerCargo
  }

  const calculateMaxDimensions = () => {
    const vehicleLength = combination.vehicle.abmessungen.laenge_m
    const trailerLength = combination.trailer ? combination.trailer.abmessungen.laenge_m : 0
    const vehicleWidth = combination.vehicle.abmessungen.breite_m
    const trailerWidth = combination.trailer ? combination.trailer.abmessungen.breite_m : 0
    const vehicleHeight = combination.vehicle.abmessungen.hoehe_m
    const trailerHeight = combination.trailer ? combination.trailer.abmessungen.hoehe_m : 0

    return {
      length: vehicleLength + trailerLength,
      width: Math.max(vehicleWidth, trailerWidth),
      height: Math.max(vehicleHeight, trailerHeight),
    }
  }

  const calculateTotalAxles = () => {
    const vehicleAxles = combination.vehicle.anzahl_achsen
    const trailerAxles = combination.trailer ? combination.trailer.anzahl_achsen : 0
    return vehicleAxles + trailerAxles
  }

  const isWithinLimits = () => {
    if (!combination.vehicle.zughaken_details) return true
    const totalWeight = calculateTotalWeight()
    return totalWeight <= combination.vehicle.zughaken_details.max_zuggesamtgewicht_kg
  }

  const dimensions = calculateMaxDimensions()
  const totalWeight = calculateTotalWeight()

  const handleExportPDF = async () => {
    try {
      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Fahrbefehl Export</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                color: #000;
                max-width: 800px;
                margin: 0;
                padding: 30px;
                line-height: 1.4;
              }
              h1 { color: #000; margin-bottom: 5px; text-transform: uppercase; font-weight: 900; letter-spacing: -1px; font-size: 32px; border-bottom: 4px solid #000; padding-bottom: 10px; }
              h2 { color: #000; margin-top: 30px; margin-bottom: 15px; font-size: 18px; text-transform: uppercase; font-weight: 900; background: #000; color: #fff; display: inline-block; padding: 4px 10px; }
              .header { margin-bottom: 30px; }
              .subtitle { font-weight: bold; text-transform: uppercase; background: #000; color: #fff; padding: 2px 6px; display: inline-block; font-size: 12px; }
              .section { margin-bottom: 30px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; border: 3px solid #000; }
              th, td { padding: 12px; text-align: left; border-bottom: 2px solid #000; border-right: 2px solid #000; }
              th { background-color: #f0f0f0; font-weight: 900; text-transform: uppercase; font-size: 12px; }
              td { font-weight: bold; }
              .value { font-weight: 900; font-family: monospace; font-size: 16px; }
              .status { margin: 20px 0; padding: 15px; border: 4px solid #000; text-transform: uppercase; font-weight: bold; }
              .status.ok { background-color: #4ade80; color: #000; border-color: #000; box-shadow: 6px 6px 0px 0px #000; }
              .status.warning { background-color: #ef4444; color: #fff; border-color: #000; box-shadow: 6px 6px 0px 0px #000; }
              .status strong { font-size: 20px; display: block; margin-bottom: 5px; font-weight: 900; }
              .footer { margin-top: 40px; text-align: left; font-size: 10px; color: #000; font-weight: bold; text-transform: uppercase; border-top: 4px solid #000; padding-top: 10px; }
              .total-row td { background-color: #000; color: #fff; text-transform: uppercase; font-weight: 900; font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Fahrbefehl</h1>
              <div class="subtitle">Fahrzeugkombinations-Kalkulator</div>
            </div>

            <div class="status ${isWithinLimits() ? "ok" : "warning"}">
              <strong>${isWithinLimits() ? "✓ Konfiguration gültig" : "⚠ Gewichtslimit überschritten"}</strong>
              <br />
              ${isWithinLimits() ? "Die Fahrzeugkombination erfüllt alle Anforderungen." : `Gesamtgewicht: ${totalWeight.toLocaleString()} kg / Max: ${combination.vehicle.zughaken_details?.max_zuggesamtgewicht_kg.toLocaleString()} kg`}
            </div>

            <h2>Fahrzeugkombination</h2>
            <table>
              <tr>
                <th>Fahrzeug</th>
                <th>Kategorie</th>
                <th>Achsen</th>
              </tr>
              <tr>
                <td>${combination.vehicle.name}</td>
                <td>${combination.vehicle.kategorie_ausweis}</td>
                <td>${combination.vehicle.anzahl_achsen}</td>
              </tr>
              ${
                combination.trailer
                  ? `
              <tr>
                <td>${combination.trailer.name}</td>
                <td>${combination.trailer.kategorie_ausweis}</td>
                <td>${combination.trailer.anzahl_achsen}</td>
              </tr>
              `
                  : ""
              }
            </table>

            <h2>Abmessungen</h2>
            <table>
              <tr>
                <th>Länge</th>
                <th>Breite</th>
                <th>Höhe</th>
              </tr>
              <tr>
                <td>${dimensions.length.toFixed(2)} m</td>
                <td>${dimensions.width.toFixed(2)} m</td>
                <td>${dimensions.height.toFixed(2)} m</td>
              </tr>
            </table>

            <h2>Gewichtsanalyse</h2>
            <table>
              <tr>
                <th>Element</th>
                <th>Gewicht</th>
              </tr>
              <tr>
                <td>Zugfahrzeug (Leer)</td>
                <td>${combination.vehicle.gewichte.leergewicht_kg.toLocaleString()} kg</td>
              </tr>
              ${
                combination.trailer
                  ? `<tr><td>Anhänger (Leer)</td><td>${combination.trailer.gewichte.leergewicht_kg.toLocaleString()} kg</td></tr>`
                  : ""
              }
              ${combination.cargo
                .map(
                  (c) =>
                    `<tr><td>${c.name} (${c.location === "zugfahrzeug" ? "Fahrzeug" : "Anhänger"})</td><td>${c.weight_kg.toLocaleString()} kg</td></tr>`,
                )
                .join("")}
              <tr class="total-row">
                <td>Gesamtgewicht</td>
                <td class="value">${totalWeight.toLocaleString()} KG</td>
              </tr>
            </table>

            ${
              combination.vehicle.zughaken_details
                ? `
            <h2>Zuglaster Limits</h2>
            <table>
              <tr>
                <th>Parameter</th>
                <th>Limit</th>
              </tr>
              <tr>
                <td>Max. Anhängelast</td>
                <td>${combination.vehicle.zughaken_details.max_anhaengelast_kg.toLocaleString()} kg</td>
              </tr>
              <tr>
                <td>Max. Zuggesamtgewicht</td>
                <td>${combination.vehicle.zughaken_details.max_zuggesamtgewicht_kg.toLocaleString()} kg</td>
              </tr>
            </table>
            `
                : ""
            }

            <div class="footer">
              <p>Erstellt: ${new Date().toLocaleString("de-CH")}</p>
              <p>Fahrbefehl Fahrzeugkombinations-Kalkulator</p>
            </div>
          </body>
        </html>
      `

      
        const html2pdf = (await import("html2pdf.js")).default;
        const printContent = html.toString();
        html2pdf().set({
          margin: 10,
          filename: `fahrbefehl-${combination.vehicle.name.replace(/\s+/g, "-")}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
        }).from(printContent).save();
      
     
    } catch (error) {
      console.error("Fehler beim PDF-Export:", error)
    }
  }

  return (
    <div className="space-y-8">
      {/* Status Alert */}
      <div
        className={cn(
          "p-6 flex flex-col sm:flex-row gap-4 border-[4px] shadow-[var(--shadow-brutal)] transition-all",
          isWithinLimits() 
            ? "border-green-600 bg-green-400 text-black shadow-green-900" 
            : "border-red-600 bg-red-500 text-white shadow-red-900"
        )}
      >
        <div className="mt-1">
          {isWithinLimits() ? (
            <CheckCircle className="w-8 h-8" strokeWidth={3} />
          ) : (
            <AlertCircle className="w-8 h-8" strokeWidth={3} />
          )}
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-widest mb-1">
            {isWithinLimits() ? "Konfiguration gültig" : "Gewichtslimit überschritten"}
          </h2>
          <p className="font-bold font-mono text-sm md:text-base">
            {isWithinLimits()
              ? "DIE FAHRZEUGKOMBINATION ERFÜLLT ALLE GEWICHTS- UND ZUGLASTANFORDERUNGEN."
              : `GESAMTGEWICHT: ${totalWeight.toLocaleString()} KG / MAX: ${combination.vehicle.zughaken_details?.max_zuggesamtgewicht_kg.toLocaleString()} KG`}
          </p>
        </div>
      </div>

      {/* Dimensions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col items-center justify-center text-center bg-accent text-accent-foreground border-border">
          <p className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">Länge</p>
          <p className="text-3xl md:text-4xl font-black font-mono">{dimensions.length.toFixed(2)} M</p>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center bg-accent text-accent-foreground border-border">
          <p className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">Breite</p>
          <p className="text-3xl md:text-4xl font-black font-mono">{dimensions.width.toFixed(2)} M</p>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center bg-accent text-accent-foreground border-border">
          <p className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">Höhe</p>
          <p className="text-3xl md:text-4xl font-black font-mono">{dimensions.height.toFixed(2)} M</p>
        </Card>
        <Card className="p-5 flex flex-col items-center justify-center text-center bg-accent text-accent-foreground border-border">
          <p className="text-sm font-black uppercase tracking-widest mb-2 opacity-80">Achsen</p>
          <p className="text-3xl md:text-4xl font-black font-mono">{calculateTotalAxles()}</p>
        </Card>
      </div>

      {/* Weight Analysis */}
      <Card className="p-6 md:p-8 border-[4px]">
        <h3 className="text-2xl font-black uppercase tracking-tight mb-6 text-foreground border-b-[4px] border-border pb-4">Gewichtsanalyse</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-border/50">
            <span className="font-bold uppercase tracking-wide">Zugfahrzeug (Leer)</span>
            <span className="text-lg font-black font-mono">
              {combination.vehicle.gewichte.leergewicht_kg.toLocaleString()} KG
            </span>
          </div>
          {combination.trailer && (
            <div className="flex justify-between items-center pb-3 border-b-2 border-dashed border-border/50">
              <span className="font-bold uppercase tracking-wide">Anhänger (Leer)</span>
              <span className="text-lg font-black font-mono">
                {combination.trailer.gewichte.leergewicht_kg.toLocaleString()} KG
              </span>
            </div>
          )}
          {combination.cargo.map((item) => (
            <div key={item.id} className="flex justify-between items-center pb-3 border-b-2 border-dashed border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                <span className="font-black uppercase tracking-tight text-lg">{item.name}</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-foreground text-background uppercase">
                  {item.location === "zugfahrzeug" ? "Fahrzeug" : "Anhänger"}
                </span>
              </div>
              <span className="text-lg font-black font-mono">{item.weight_kg.toLocaleString()} KG</span>
            </div>
          ))}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mt-8 pt-6 border-t-[4px] border-border">
            <span className="text-2xl font-black uppercase tracking-widest mb-2 sm:mb-0">Gesamtgewicht</span>
            <span className="text-4xl md:text-5xl font-black font-mono text-primary bg-accent px-4 py-2 border-[3px] border-border shadow-[4px_4px_0px_0px_var(--shadow-color)]">
              {totalWeight.toLocaleString()} KG
            </span>
          </div>
        </div>
      </Card>

      {/* Vehicle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-[3px]">
          <h4 className="text-xl font-black uppercase tracking-tight mb-5 text-foreground bg-foreground text-background inline-block px-3 py-1">Zugfahrzeug</h4>
          <div className="space-y-4 text-sm">
            <div className="flex flex-col border-b-2 border-border/30 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Name</span>
              <span className="text-lg font-black uppercase">{combination.vehicle.name}</span>
            </div>
            <div className="flex flex-col border-b-2 border-border/30 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Kategorie</span>
              <span className="text-xl font-black font-mono">{combination.vehicle.kategorie_ausweis}</span>
            </div>
            <div className="flex flex-col border-b-2 border-border/30 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Max. Anhängelast</span>
              <span className="text-xl font-black font-mono">
                {combination.vehicle.zughaken_details?.max_anhaengelast_kg.toLocaleString() || "N/A"} KG
              </span>
            </div>
          </div>
        </Card>

        {combination.trailer && (
          <Card className="p-6 border-[3px]">
            <h4 className="text-xl font-black uppercase tracking-tight mb-5 text-foreground bg-foreground text-background inline-block px-3 py-1">Anhänger</h4>
            <div className="space-y-4 text-sm">
              <div className="flex flex-col border-b-2 border-border/30 pb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Name</span>
                <span className="text-lg font-black uppercase">{combination.trailer.name}</span>
              </div>
              <div className="flex flex-col border-b-2 border-border/30 pb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Kategorie</span>
                <span className="text-xl font-black font-mono">{combination.trailer.kategorie_ausweis}</span>
              </div>
              <div className="flex flex-col border-b-2 border-border/30 pb-2">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Nutzlast</span>
                <span className="text-xl font-black font-mono">
                  {combination.trailer.gewichte.nutzlast_kg.toLocaleString()} KG
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Export Button */}
      <Button 
        onClick={handleExportPDF} 
        size="lg"
        className="w-full py-8 text-xl font-black tracking-widest uppercase bg-primary text-primary-foreground border-[4px] border-border hover:bg-accent hover:text-accent-foreground"
      >
        <Download className="mr-3 h-6 w-6" strokeWidth={3} />
        Als PDF exportieren
      </Button>
    </div>
  )
}
