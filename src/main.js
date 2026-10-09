import { Actor, log } from "apify";
import encarapi from "encarapi";

const { KoreaClient, ChinaClient } = encarapi;

await Actor.init();

const input = (await Actor.getInput()) || {};
const { apiKey, market = "korea", mode = "search", maxItems = 100 } = input;

// Without a key the Actor runs in demo mode: it saves one clearly labelled item
// explaining how to get a key instead of failing. Keeps Apify's daily default-input
// test green (it runs without secrets) and shows new users what to do next.
if (!apiKey) {
  const china = market === "china";
  const site = china ? "https://chinacarapi.com" : "https://encarapi.com";
  await Actor.pushData({
    demo: true,
    message: china
      ? "No API key provided. This Actor returns live Chinese used car listings (Dongchedi, Che168) in English once you add your ChinaCarAPI key (chinacarapi.com) in the input. EnCarAPI keys with the China add-on work too."
      : "No API key provided. This Actor returns live Korean (Encar, KB Chachacha, K Car) and Chinese (Dongchedi, Che168) used car listings once you add your EnCarAPI key in the input.",
    getKey: `${site}/?utm_source=apify&utm_medium=encarapi-apify&utm_content=run#pricing`,
    documentation: `${site}/documentation`,
    exampleInput: china
      ? { apiKey: "YOUR_KEY", market: "china", chinaMake: "BYD", maxItems: 100 }
      : { apiKey: "YOUR_KEY", market: "korea", manufacturer: "Hyundai", maxItems: 100 },
  });
  log.warning(`Demo mode: no API key in the input. Get one at ${site}`);
  await Actor.exit();
}

const PAGE = 100;
let pushed = 0;

async function push(items) {
  const room = maxItems - pushed;
  const batch = items.slice(0, room);
  if (batch.length) await Actor.pushData(batch);
  pushed += batch.length;
  return pushed < maxItems;
}

try {
  if (market === "korea") {
    const korea = new KoreaClient(apiKey);
    if (mode === "details") {
      for (const id of input.vehicleIds || []) {
        if (pushed >= maxItems) break;
        await push([{ id, ...(await korea.vehicle(id, { lang: "en" })) }]);
      }
    } else {
      const params = {
        source: input.koreaSource || "encar",
        manufacturer: input.manufacturer,
        model_group: input.modelGroup,
        model_search: input.modelSearch,
        min_year: input.minYear,
        max_year: input.maxYear,
        max_price: input.maxPriceManwon,
        max_mileage: input.maxMileage,
        frame_clean: input.frameClean || undefined,
        lang: "en",
        sort: "newest",
      };
      for (let page = 1; ; page++) {
        const res = await korea.catalog({ ...params, page, limit: PAGE, count: page === 1 });
        if (page === 1) log.info(`Korea: ${res.Count ?? "?"} matching listings`);
        const items = res.SearchResults || [];
        if (!(await push(items)) || items.length < PAGE) break;
      }
    }
  } else {
    const china = new ChinaClient(apiKey);
    // "all" = both marketplaces: no source param (the API then removes cross-listed duplicates).
    const source = input.chinaSource && input.chinaSource !== "all" ? input.chinaSource : undefined;
    if (mode === "details") {
      for (const id of input.vehicleIds || []) {
        if (pushed >= maxItems) break;
        await push([await china.vehicle(id, { source })]);
      }
    } else {
      const params = {
        source,
        make: input.chinaMake,
        model: input.chinaModel,
        year_min: input.chinaMinYear,
        year_max: input.chinaMaxYear,
        price_max: input.chinaPriceMaxCny,
        mileage_max: input.chinaMaxMileage,
        city: input.chinaCity,
        fuel: input.chinaFuel,
        has_report: input.chinaHasReport || undefined,
        export_ready: input.exportReady || undefined,
        sort: "newest",
      };
      for (let page = 1; ; page++) {
        const res = await china.catalog({ ...params, page, limit: PAGE });
        if (page === 1) log.info(`China: ${res.total ?? "?"} matching listings`);
        const items = res.results || [];
        if (!(await push(items)) || items.length < PAGE) break;
        // The China API serves at most 10,000 results per query.
        if ((page + 1) * PAGE > 10000) {
          log.warning("Reached the 10,000-result limit per search. Narrow the filters for more.");
          break;
        }
      }
    }
  }
  log.info(`Saved ${pushed} items to the dataset.`);
  await Actor.exit();
} catch (e) {
  // 401/403 carry the API message (invalid key, or plan without this source / endpoint).
  await Actor.fail(e.message);
}
