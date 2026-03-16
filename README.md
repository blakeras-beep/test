# MarketField

MarketField is a lightweight prototype web app for division leaders and land teams to master local market intelligence and inventory start strategy.

## Features

- Community overview dashboard with KPIs, competitive positioning, price/SF distributions, and inventory visibility.
- Competitor workflow with map-style visualization, manual entry form, inclusion toggles, and detailed plan/spec tables.
- Market data ingestion stubs including file upload preview, field mapping UI, and sales table.
- Prescriptive Start Strategy engine with editable assumptions, automated plan mix, start counts, pricing guidance, and narrative summary.
- Report & export center for generating one-pagers, start packs, and competitor decks.
- Settings hub for website scraping logs, data sources, and re-running imports.

## Running locally

The prototype uses native ES modules, which most browsers block when loading files directly from disk. Run the bundled static server to ensure the app boots correctly and to enable the file-upload workflow:

```bash
npm install # no dependencies, but keeps scripts available
npm start
```

Then visit [http://localhost:4173](http://localhost:4173) (or the port shown in the terminal). Any static hosting solution will also work as long as it serves the files over HTTP/HTTPS.

## Data model

Sample data for communities, competitors, plans, inventory, sales, recommendations, and data sources lives in `data.js`. Update or connect this file to live APIs or databases to power production workflows.
