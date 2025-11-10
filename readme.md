# Fahrbefehl.ch

## Beschreibung

Fahrbefehl ermöglicht das erstellen von Fahrzeugkombinationen des Schweizer Militärs, um ihre Abmessungen und Gewichte zu überprüfen.

## Funktionen

- Auswahl des Fahrzeges und gegebenfalls des Anhängers
- Automatische FIlterung der Anhänger anhand des ausgewähltem Zugfahrzeugs
- Anzeige der Abmessungen und Gewichte der Fahrzeugkombination
- hinzufügen von Beladung zur Gewichtsermittlung
- exportieren der Fahrzeugkombination als PDF



## Technologien

- Next.js
- Tailwind CSS
- Shadcn UI
- Json-Data für die Fahrzeuge und Anhänger


## Json-Format

```json
[
  {
    "id": "duro_iii_p",
    "name": "Duro III P (geschützt)",
    "typ": "zugfahrzeug",
    "kategorie_ausweis": "C",
    "bild_url": "/images/duro_iii_p.jpg",
    "anzahl_achsen": 2,
    "abmessungen": {
      "laenge_m": 6.75,
      "breite_m": 2.16,
      "hoehe_m": 2.65
    },
    "gewichte": {
      "leergewicht_kg": 7200,
      "nutzlast_kg": 1300,
      "gesamtgewicht_kg": 8500
    },
    "zughaken_details": {
      "erlaubte_anhaenger_kategorie": "CE",
      "max_anhaengelast_kg": 3500,
      "max_zuggesamtgewicht_kg": 12000
    }
  },
  {
    "id": "anhaenger_2t_plane",
    "name": "Anhänger 2t (Plane)",
    "typ": "anhaenger",
    "kategorie_ausweis": "BE",
    "bild_url": "/images/anhaenger_2t.jpg",
    "anzahl_achsen": 1,
    "abmessungen": {
      "laenge_m": 4.80,
      "breite_m": 2.10,
      "hoehe_m": 2.40
    },
    "gewichte": {
      "leergewicht_kg": 900,
      "nutzlast_kg": 1100,
      "gesamtgewicht_kg": 2000
    }
  },
]
```

