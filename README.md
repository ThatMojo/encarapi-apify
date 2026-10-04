# Korean & Chinese Used Cars API (Encar, KB Chachacha, K Car, Dongchedi, Che168)

Export live **used car listings from South Korea and China** into an Apify dataset (JSON,
CSV, Excel) using the official [EnCarAPI](https://encarapi.com). No scraping, no proxies,
no captchas: the Actor calls a production API that already mirrors the marketplaces.

- **South Korea:** Encar (Korea's largest used car marketplace), KB Chachacha and K Car,
  deduplicated across platforms. English values for brands, models, fuel and transmission.
- **China:** Dongchedi and Che168 in English, prices in CNY with USD and EUR conversions,
  export-ready filter.

Built for car exporters, importers, dealers and marketplaces sourcing Korean and Chinese
inventory.

## You need an API key

This Actor is a client for the paid EnCarAPI service. Get a key (5-day trial) at
**[encarapi.com](https://encarapi.com)**. Chinese data works with a
[ChinaCarAPI](https://chinacarapi.com) key or an EnCarAPI key with the China add-on. The key
is stored as an encrypted secret input.

## What you get

**Search mode** returns one dataset item per listing, for example (Korea):

```json
{
  "Id": "41000001",
  "Source": "encar",
  "ManufacturerEnglish": "Hyundai",
  "ModelEnglish": "Grandeur",
  "BadgeEnglish": "2.5 Premium",
  "Year": 202203,
  "Price": 2890,
  "Mileage": 31000,
  "FuelTypeEnglish": "Gasoline",
  "Photos": ["..."],
  "Url": "https://fem.encar.com/cars/detail/41000001"
}
```

Korean prices are in 만원 (1 = 10,000 KRW), so `2890` = 28,900,000 KRW.

**Details mode** takes a list of vehicle ids and returns the full record per car: specs,
options, photos, price history and seller. Inspection reports and accident records are
available through the API and SDKs.

## Input

| Field | Description |
|---|---|
| EnCarAPI key | Required, secret |
| Market | South Korea or China |
| Mode | Search listings, or full details for vehicle ids |
| Max results | Stop after this many items |
| Korea filters | Marketplace (Encar / KB Chachacha / K Car / all), brand, model, free-text model search, year, max price, max mileage, accident-free chassis |
| China filters | Brand, model, max price (CNY), export-ready only |

KB Chachacha, K Car and the combined view depend on your plan, see
[encarapi.com/#pricing](https://encarapi.com/#pricing).

## Prefer code?

- Node.js: `npm install encarapi` ([GitHub](https://github.com/ThatMojo/encarapi-node))
- Python: `pip install encarapi` ([GitHub](https://github.com/ThatMojo/encarapi-python))
- AI assistants (Claude, Cursor): [encarapi-mcp](https://github.com/ThatMojo/encarapi-mcp)
- Full reference: [api.encarapi.com/reference](https://api.encarapi.com/reference)

EnCarAPI is an independent service and not affiliated with Encar, KB Chachacha, K Car,
Dongchedi or Che168.
