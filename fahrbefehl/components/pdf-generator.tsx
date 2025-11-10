import html2pdf from "html2pdf.js"
import type { Combination } from "@/lib/types"

export async function generatePDF(combination: Combination) {
  const calculateTotalWeight = () => {
    const vehicleWeight = combination.vehicle.gewichte.gesamtgewicht_kg
    const trailerWeight = combination.trailer ? combination.trailer.gewichte.gesamtgewicht_kg : 0
    const cargoWeight = combination.cargo.reduce((sum, c) => sum + c.weight_kg, 0)
    return vehicleWeight + trailerWeight + cargoWeight
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

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Fahrbefehl Fahrzeugkombination</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Arial, sans-serif;
            background: #ffffff;
            padding: 20px;
            color: #1a1a1a;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #1e3a8a;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 28px;
            color: #1e3a8a;
            margin-bottom: 5px;
          }
          .header p {
            color: #666;
            font-size: 12px;
          }
          .timestamp {
            font-size: 11px;
            color: #999;
            margin-top: 10px;
          }
          .status-box {
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            border-left: 4px solid ${isWithinLimits() ? "#22c55e" : "#ef4444"};
            background-color: ${isWithinLimits() ? "#f0fdf4" : "#fef2f2"};
          }
          .status-box h3 {
            font-size: 14px;
            margin-bottom: 5px;
            color: ${isWithinLimits() ? "#166534" : "#7f1d1d"};
          }
          .status-box p {
            font-size: 12px;
            color: ${isWithinLimits() ? "#15803d" : "#991b1b"};
          }
          .section {
            margin-bottom: 25px;
          }
          .section h2 {
            font-size: 16px;
            color: #1e3a8a;
            margin-bottom: 12px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-bottom: 20px;
          }
          .metric-card {
            border: 1px solid #e5e7eb;
            padding: 12px;
            border-radius: 4px;
            text-align: center;
            background: #f9fafb;
          }
          .metric-label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            margin-bottom: 8px;
            font-weight: bold;
          }
          .metric-value {
            font-size: 22px;
            color: #1e3a8a;
            font-weight: bold;
          }
          .weight-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
          }
          .weight-table th {
            background-color: #e5e7eb;
            padding: 10px;
            text-align: left;
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
          }
          .weight-table td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 12px;
          }
          .weight-table tr:last-child td {
            border-bottom: 2px solid #1e3a8a;
            background-color: #f0f4ff;
            font-weight: bold;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
          .info-box {
            border: 1px solid #e5e7eb;
            padding: 12px;
            border-radius: 4px;
          }
          .info-box h3 {
            font-size: 12px;
            color: #1e3a8a;
            margin-bottom: 10px;
            font-weight: bold;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            font-size: 11px;
            border-bottom: 1px solid #f0f0f0;
          }
          .info-row:last-child {
            border-bottom: none;
          }
          .info-label {
            color: #666;
          }
          .info-value {
            font-weight: bold;
            color: #1a1a1a;
          }
          .footer {
            margin-top: 30px;
            padding-top: 15px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 10px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚙 Fahrbefehl</h1>
            <p>Schweizer Militärfahrzeugkombinations-Kalkulator</p>
            <div class="timestamp">Erstellt: ${new Date().toLocaleString("de-CH")}</div>
          </div>

          <div class="status-box">
            <h3>${isWithinLimits() ? "✓ Konfiguration OK" : "⚠ Gewichtslimit überschritten"}</h3>
            <p>${
              isWithinLimits()
                ? "Die Fahrzeugkombination erfüllt alle Anforderungen"
                : `Gesamtgewicht: ${totalWeight.toLocaleString()} kg / Max: ${combination.vehicle.zughaken_details?.max_zuggesamtgewicht_kg.toLocaleString()} kg`
            }</p>
          </div>

          <div class="section">
            <h2>Abmessungen & Achsen</h2>
            <div class="grid">
              <div class="metric-card">
                <div class="metric-label">Länge</div>
                <div class="metric-value">${dimensions.length.toFixed(2)}</div>
                <div class="metric-label" style="margin-top: 5px; font-weight: normal;">Meter</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Breite</div>
                <div class="metric-value">${dimensions.width.toFixed(2)}</div>
                <div class="metric-label" style="margin-top: 5px; font-weight: normal;">Meter</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Höhe</div>
                <div class="metric-value">${dimensions.height.toFixed(2)}</div>
                <div class="metric-label" style="margin-top: 5px; font-weight: normal;">Meter</div>
              </div>
              <div class="metric-card">
                <div class="metric-label">Achsen</div>
                <div class="metric-value">${calculateTotalAxles()}</div>
                <div class="metric-label" style="margin-top: 5px; font-weight: normal;">Total</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>Gewichtsanalyse</h2>
            <table class="weight-table">
              <thead>
                <tr>
                  <th>Position</th>
                  <th style="text-align: right;">Gewicht (kg)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Fahrzeug (Leer)</td>
                  <td style="text-align: right;">${combination.vehicle.gewichte.leergewicht_kg.toLocaleString()}</td>
                </tr>
                ${
                  combination.trailer
                    ? `<tr>
                      <td>Anhänger (Leer)</td>
                      <td style="text-align: right;">${combination.trailer.gewichte.leergewicht_kg.toLocaleString()}</td>
                    </tr>`
                    : ""
                }
                ${combination.cargo
                  .map(
                    (item) =>
                      `<tr>
                      <td>${item.name}</td>
                      <td style="text-align: right;">${item.weight_kg.toLocaleString()}</td>
                    </tr>`,
                  )
                  .join("")}
                <tr>
                  <td>Gesamtgewicht</td>
                  <td style="text-align: right;">${totalWeight.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>Fahrzeugdetails</h2>
            <div class="info-grid">
              <div class="info-box">
                <h3>Zugfahrzeug</h3>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${combination.vehicle.name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Kategorie:</span>
                  <span class="info-value">${combination.vehicle.kategorie_ausweis}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Achsen:</span>
                  <span class="info-value">${combination.vehicle.anzahl_achsen}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Max. Anhängelast:</span>
                  <span class="info-value">${combination.vehicle.zughaken_details?.max_anhaengelast_kg.toLocaleString() || "N/A"} kg</span>
                </div>
              </div>

              ${
                combination.trailer
                  ? `<div class="info-box">
                      <h3>Anhänger</h3>
                      <div class="info-row">
                        <span class="info-label">Name:</span>
                        <span class="info-value">${combination.trailer.name}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Kategorie:</span>
                        <span class="info-value">${combination.trailer.kategorie_ausweis}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Achsen:</span>
                        <span class="info-value">${combination.trailer.anzahl_achsen}</span>
                      </div>
                      <div class="info-row">
                        <span class="info-label">Nutzlast:</span>
                        <span class="info-value">${combination.trailer.gewichte.nutzlast_kg.toLocaleString()} kg</span>
                      </div>
                    </div>`
                  : `<div class="info-box">
                      <h3>Anhänger</h3>
                      <div class="info-row">
                        <span class="info-label">Status:</span>
                        <span class="info-value">Keine Anhänger</span>
                      </div>
                    </div>`
              }
            </div>
          </div>

          <div class="footer">
            <p>Fahrbefehl - Schweizer Militärfahrzeugkombinations-Kalkulator</p>
            <p>Dieses Dokument wurde automatisch generiert und dient zu Informationszwecken.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const element = document.createElement("div")
  element.innerHTML = htmlContent

  const filename = `Fahrbefehl_${combination.vehicle.name.replace(/\s+/g, "_")}_${new Date().getTime()}.pdf`

  const opt = {
    margin: 10,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
  }

  return new Promise((resolve, reject) => {
    html2pdf()
      .set(opt)
      .from(htmlContent)
      .save()
      .then(() => resolve(filename))
      .catch((err) => reject(err))
  })
}
