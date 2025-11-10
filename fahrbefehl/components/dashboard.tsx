"use client"

import type { Combination } from "@/lib/types"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
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
                font-family: Arial, sans-serif;
                color: #333;
                max-width: 800px;
                margin: 0;
                padding: 20px;
                line-height: 1.6;
              }
              h1 { color: #1e40af; margin-bottom: 5px; }
              h2 { color: #1e40af; margin-top: 20px; margin-bottom: 10px; font-size: 16px; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
              .header { margin-bottom: 30px; }
              .section { margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
              th { background-color: #f0f0f0; font-weight: bold; }
              .value { font-weight: bold; }
              .status { margin: 20px 0; padding: 15px; border-radius: 4px; }
              .status.ok { background-color: #dcfce7; border-left: 4px solid #22c55e; }
              .status.warning { background-color: #fef08a; border-left: 4px solid #eab308; }
              .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Fahrbefehl - Fahrzeugkombination</h1>
              <p>Schweizer Militärfahrzeugkombinations-Kalkulator</p>
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
              <tr style="background-color: #f0f0f0;">
                <td><strong>Gesamtgewicht</strong></td>
                <td><strong>${totalWeight.toLocaleString()} kg</strong></td>
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

      const blob = new Blob([html], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `fahrbefehl-${combination.vehicle.name.replace(/\s+/g, "-")}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Fehler beim PDF-Export:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Alert */}
      <Card
        className={`p-4 border-l-4 flex gap-3 ${isWithinLimits() ? "border-l-green-500 bg-green-500/10 dark:bg-green-950" : "border-l-destructive bg-red-500/10 dark:bg-red-950"}`}
      >
        <div className="mt-0.5">
          {isWithinLimits() ? (
            <CheckCircle className="w-6 h-6 text-green-600" />
          ) : (
            <AlertCircle className="w-6 h-6 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-semibold text-foreground">
            {isWithinLimits() ? "Konfiguration gültig" : "Gewichtslimit überschritten"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isWithinLimits()
              ? "Die Fahrzeugkombination erfüllt alle Anforderungen"
              : `Gesamtgewicht: ${totalWeight.toLocaleString()} kg / Max: ${combination.vehicle.zughaken_details?.max_zuggesamtgewicht_kg.toLocaleString()} kg`}
          </p>
        </div>
      </Card>

      {/* Dimensions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Länge</p>
          <p className="text-2xl font-bold text-foreground">{dimensions.length.toFixed(2)} m</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Breite</p>
          <p className="text-2xl font-bold text-foreground">{dimensions.width.toFixed(2)} m</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Höhe</p>
          <p className="text-2xl font-bold text-foreground">{dimensions.height.toFixed(2)} m</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs font-semibold uppercase text-muted-foreground mb-2">Achsen</p>
          <p className="text-2xl font-bold text-foreground">{calculateTotalAxles()}</p>
        </Card>
      </div>

      {/* Weight Analysis */}
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Gewichtsanalyse</h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b">
            <span className="text-muted-foreground">Zugfahrzeug (Leer)</span>
            <span className="font-semibold text-foreground">
              {combination.vehicle.gewichte.leergewicht_kg.toLocaleString()} kg
            </span>
          </div>
          {combination.trailer && (
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="text-muted-foreground">Anhänger (Leer)</span>
              <span className="font-semibold text-foreground">
                {combination.trailer.gewichte.leergewicht_kg.toLocaleString()} kg
              </span>
            </div>
          )}
          {combination.cargo.map((item) => (
            <div key={item.id} className="flex justify-between items-center pb-2 border-b">
              <div>
                <span className="text-muted-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  ({item.location === "zugfahrzeug" ? "Fahrzeug" : "Anhänger"})
                </span>
              </div>
              <span className="font-semibold text-foreground">{item.weight_kg.toLocaleString()} kg</span>
            </div>
          ))}
          <div className="flex justify-between items-center pt-2 bg-muted px-2 py-2 rounded-md mt-4">
            <span className="font-semibold text-foreground">Gesamtgewicht</span>
            <span className="text-2xl font-bold text-primary">{totalWeight.toLocaleString()} kg</span>
          </div>
        </div>
      </Card>

      {/* Vehicle Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card className="p-4">
          <h4 className="font-semibold mb-3 text-foreground">Zugfahrzeug</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Name:</span>
              <span className="font-medium text-foreground">{combination.vehicle.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Kategorie:</span>
              <span className="font-medium text-foreground">{combination.vehicle.kategorie_ausweis}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max. Anhängelast:</span>
              <span className="font-medium text-foreground">
                {combination.vehicle.zughaken_details?.max_anhaengelast_kg.toLocaleString() || "N/A"} kg
              </span>
            </div>
          </div>
        </Card>

        {combination.trailer && (
          <Card className="p-4">
            <h4 className="font-semibold mb-3 text-foreground">Anhänger</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium text-foreground">{combination.trailer.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Kategorie:</span>
                <span className="font-medium text-foreground">{combination.trailer.kategorie_ausweis}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nutzlast:</span>
                <span className="font-medium text-foreground">
                  {combination.trailer.gewichte.nutzlast_kg.toLocaleString()} kg
                </span>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Export Button */}
      <Button onClick={handleExportPDF} className="w-full py-6 text-base" size="lg">
        <Download size={20} className="mr-2" />
        Als HTML exportieren
      </Button>
    </div>
  )
}
