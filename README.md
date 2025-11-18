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

Because the prototype is built as a static HTML/CSS/JS app, simply open `index.html` in a browser. Optionally use a lightweight static server such as `npx serve` to enable local file uploads in the Market Data section:

```bash
npx serve -s .
```

Then visit the reported URL (typically http://localhost:3000).

## Data model

Sample data for communities, competitors, plans, inventory, sales, recommendations, and data sources lives in `data.js`. Update or connect this file to live APIs or databases to power production workflows.
