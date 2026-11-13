import type { Fahrzeug } from "@/lib/types"
import { cn } from "@/lib/utils"

interface VehicleIconProps {
  vehicle: Fahrzeug
  className?: string
}

export function VehicleIcon({ vehicle, className }: VehicleIconProps) {
  // Dimensions based on real data
  const lengthStr = vehicle.abmessungen.laenge_m || 5 // meters
  const lengthU = Math.max(40, Math.min(110, lengthStr * 11)) // scale length
  
  const heightStr = vehicle.abmessungen.hoehe_m || 2 
  const heightU = Math.max(25, Math.min(60, heightStr * 12))
  
  const axles = vehicle.anzahl_achsen || 2
  const isTrailer = vehicle.typ === "anhaenger"
  
  // Categorization Logic
  const weight = vehicle.gewichte.gesamtgewicht_kg || 0
  const nameL = vehicle.name.toLowerCase()
  let category: "suv" | "van" | "lkw" | "trailer" = "lkw"
  
  if (isTrailer) {
    category = "trailer"
  } else if (nameL.includes("mbg") || (weight < 4000 && lengthStr < 5.5)) {
    category = "suv"
  } else if (nameL.includes("sprinter") || nameL.includes("duro") || (weight >= 4000 && weight < 7500)) {
    category = "van"
  }

  // Aesthetic colors
  const stroke = "hsl(var(--foreground))"
  const fillBase = "hsl(80, 45%, 35%)" // Olive / Military Green
  const fillCab = "hsl(80, 40%, 30%)" // Slightly darker 
  
  // Base chassis
  const wheelRadius = category === "suv" ? 4.5 : category === "van" ? 5 : 6;
  const wheelY = heightU - wheelRadius
  const chassisY = heightU - (wheelRadius * 2) - 2
  
  // Dynamic Viewport
  const paddingX = 10;
  const paddingY = 10;
  const vbWidth = lengthU + (paddingX * 2);
  const vbHeight = heightU + (paddingY * 2);

  return (
    <svg 
      viewBox={`0 0 ${vbWidth} ${vbHeight}`} 
      className={cn("w-auto h-full object-contain drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] dark:drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]", className)}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ground Line Tooling */}
      <rect x={paddingX - 5} y={wheelY + wheelRadius} width={lengthU + 10} height={2} fill={stroke} opacity="0.15" />

      {/* RENDER CATEGORY BODY */}
      <g transform={`translate(${paddingX}, ${paddingY})`}>
        {category === "trailer" && (
          <g>
            {/* Tow Bar */}
            <path d={`M -10 ${chassisY} L 10 ${chassisY}`} stroke={stroke} strokeWidth="3" fill="none" />
            {/* Trailer Body */}
            <rect x={10} y={heightU - chassisY} width={lengthU - 10} height={chassisY} fill={fillBase} stroke={stroke} strokeWidth="3" strokeLinejoin="miter" />
            <line x1={20} y1={heightU - chassisY + 5} x2={lengthU} y2={heightU - chassisY + 5} stroke={stroke} strokeWidth="2" opacity="0.3" />
            <line x1={20} y1={heightU - chassisY + 15} x2={lengthU} y2={heightU - chassisY + 15} stroke={stroke} strokeWidth="2" opacity="0.3" />
          </g>
        )}

        {category === "suv" && (
          <g>
            {/* SUV Cab block */}
            <path d={`M 5 ${chassisY} L 5 ${chassisY - 15} L 15 ${chassisY - 22} L ${lengthU-5} ${chassisY - 22} L ${lengthU-5} ${chassisY} Z`} fill={fillBase} stroke={stroke} strokeWidth="3" strokeLinejoin="miter" />
            {/* SUV Windows */}
            <path d={`M 17 ${chassisY - 12} L 22 ${chassisY - 19} L 30 ${chassisY - 19} L 30 ${chassisY - 12} Z`} fill={stroke} />
            <rect x={34} y={chassisY - 19} width={10} height={7} fill={stroke} />
            <rect x={48} y={chassisY - 19} width={8} height={7} fill={stroke} />
          </g>
        )}

        {category === "van" && (
          <g>
            {/* Transporter / Van single block */}
            <path d={`M 2 ${chassisY} L 2 ${chassisY - 10} L 12 ${chassisY - 28} L ${lengthU} ${chassisY - 28} L ${lengthU} ${chassisY} Z`} fill={fillBase} stroke={stroke} strokeWidth="3" strokeLinejoin="miter" />
            {/* Van Front Window */}
            <path d={`M 13 ${chassisY - 14} L 18 ${chassisY - 24} L 26 ${chassisY - 24} L 26 ${chassisY - 14} Z`} fill={stroke} />
            {/* Side Panel Line (Duro/Sprinter detail) */}
            <line x1={30} y1={chassisY - 15} x2={lengthU - 5} y2={chassisY - 15} stroke={stroke} strokeWidth="2" opacity="0.2" />
            <line x1={30} y1={chassisY - 5} x2={lengthU - 5} y2={chassisY - 5} stroke={stroke} strokeWidth="2" opacity="0.2" />
          </g>
        )}

        {category === "lkw" && (
          <g>
            {/* LKW Cab */}
            <path d={`M 0 ${chassisY} L 0 ${chassisY - 25} L 20 ${chassisY - 25} L 25 ${chassisY - 15} L 25 ${chassisY} Z`} fill={fillCab} stroke={stroke} strokeWidth="3" strokeLinejoin="miter" />
            {/* Cab Window */}
            <rect x={3} y={chassisY - 22} width={12} height={10} fill={stroke} />
            {/* LKW Cargo Bed */}
            <rect x={28} y={heightU - chassisY} width={lengthU - 28} height={chassisY} fill={fillBase} stroke={stroke} strokeWidth="3" strokeLinejoin="miter" />
            <line x1={30} y1={heightU - chassisY + 8} x2={lengthU - 2} y2={heightU - chassisY + 8} stroke={stroke} strokeWidth="2" opacity="0.3" />
          </g>
        )}

        {/* WHEELS */}
        {Array.from({ length: Math.min(axles, 5) }).map((_, i) => {
          let cx = 0;
          if (category === "trailer") {
             const clusterStart = 15 + (lengthU / 3);
             cx = clusterStart + (i * 14);
          } else {
             if (i === 0) cx = category === "lkw" ? 12 : 16;
             else {
               const backStart = lengthU - 12 - ((axles - 2) * 14);
               cx = backStart + ((i - 1) * 14);
             }
          }
          
          return (
            <g key={i}>
              <circle cx={cx} cy={wheelY} r={wheelRadius + 1.5} fill={stroke} />
              <circle cx={cx} cy={wheelY} r={wheelRadius - 1} fill={fillCab} />
              <circle cx={cx} cy={wheelY} r={1.5} fill={stroke} />
            </g>
          )
        })}
      </g>
    </svg>
  )
}
