# Middleware zur Optimierung der Veranstaltungskalenderdaten von "kirche-mv.de"

Unter https://www.kirche-mv.de/aktuell/veranstaltungen ist ein umfangreicher Kalender mit kirchlichen Terminen aus Mecklenburg-Vorpommern vorhanden. Dort gibt es eine Such- und Filterfunktion sowie einen Export in ein ICS-Format.

Ziel ist es diese Termine automatisiert verarbeiten zu können und bspw. in einem Kalender-Abonnement in einem Google-Kalender zu verwenden.

## Herausforderungen

Leider gibt es für eine vollautomatische Verarbeitung mehrere Hürden:

- Es gibt keine stabilen URLs zu den ICS-Exporten. Die URLs werden vom TYPO3 anhand der Filtereinstellungen auf der Website erzeugt und enthalten einen dynamisch generierten Hash. Beispiel: https://www.kirche-mv.de/aktuell/veranstaltungen?action=ics&tx_cal_controller%5Bcategory%5D=18&tx_cal_controller%5Bend_day%5D=20230525&tx_cal_controller%5Bowner%5D=0&tx_cal_controller%5Bstart_day%5D=20220525&type=427&cHash=6b371b829b9e1916f42db996f294e210
- Das ICS-Format enthält kleinere Syntaxschwächen wie
  - zu lange Zeilen in Fließtexten
  - Sterne/Sonderzeichen in Adressangaben
  - eine URL-Angabe, welche von Google Kalender nicht gelesen werden kann
  - die an sich vorhandene Kategorie wird nicht ausgegeben

## Realisierungsansatz

Diese Middleware soll zum einen die ICS-Daten von www.kirche-mv.de vollautomatisiert abrufbar machen und nach Behebung der o.g. Probleme diese wieder als ICS ausgeben.

### Abruf per POST-Request auf die Suche

Für den Abruf der ICS-Daten muss zunächst die URL aus dem Suchformular der Webseite ermittelt werden.

- POST Request auf https://www.kirche-mv.de/aktuell/veranstaltungen
- Payload
  - `tx_cal_controller[query]`
  - `tx_cal_controller[start_day]: 25.05.2022`
  - `tx_cal_controller[end_day]: 25.05.2023`
  - `tx_cal_controller[category]: 18` -->
  - `tx_cal_controller[submit]: Suchen`
  - `tx_cal_controller[getdate]`
  - `tx_cal_controller[view]`
  - `no_cache: 1`
  - `tx_cal_controller[offset]: 0`

### Kategorieliste und -mapping

Categories:

- id="category_0"
  - Alle Kategorien
- id="category_17"
  - Bildung/Kultur
- id="category_18"
  - Ehrenamt
- id="category_19"
  - Gemeindeleben
- id="category_16"
  - Gottesdienste
- id="category_20"
  - Konzerte/Musik
- id="category_21"
  - Sitzungen/Gremien
- id="category_22"
  - sonstige Termine

### ICS-Link-Extraktion

Extraktion eines gültigen ICS-Links zu o.g. Suchanfrage aus dem HTML:

Selektor:

- `/html/body/article/div[2]/div/div[4]/ul/li[3]/a` --> zu generisch
- `div.export_dropdown ul li[3] a.href` --> zu prüfen

### ICS-Anpassung

- LOCATION: " \* " mit ", " erstezen, um eine gängige Adresszeile zu erhalten
- URL: korrekt per ICS setzen oder weglassen, die URL in der Description mit einer Leerzeile Abstand ergänzen
- CATEGORIES: ergänzen anhand des o.g. Mappings, mit "#" in die Description schreiben
- GEO: entweder für Google Kalender lesbar setzen oder weglassen
- ORGANIZER: ICS-kompatibel setzen

## Datenzugriff

Der Datenzugriff auf diese Middleware erfolgt per HTTP / REST.

TODO: Swagger Doku Link einfügen

## Development

First, run the development server:

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
