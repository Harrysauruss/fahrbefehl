export interface Abmessungen {
  laenge_m: number
  breite_m: number
  hoehe_m: number
}

export interface Gewichte {
  leergewicht_kg: number
  nutzlast_kg: number
  gesamtgewicht_kg: number
}

export interface Zughaken {
  erlaubte_anhaenger_kategorie: string
  max_anhaengelast_kg: number
  max_zuggesamtgewicht_kg: number
}

export interface Fahrzeug {
  id: string
  name: string
  typ: "zugfahrzeug" | "anhaenger"
  kategorie_ausweis: string
  anzahl_achsen: number
  abmessungen: Abmessungen
  gewichte: Gewichte
  zughaken_details?: Zughaken
}

export interface Cargo {
  id: string
  name: string
  weight_kg: number
  location: "zugfahrzeug" | "anhaenger"
}

export interface Combination {
  vehicle: Fahrzeug
  trailer?: Fahrzeug
  cargo: Cargo[]
}
