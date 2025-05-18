import { createMemo, createSignal, For, Match, Show, Switch } from "solid-js";

import "baboolastyles/public/plastic.css";

function CurrencyConverter() {
  const currencies = createSignal<
    {
      name: string;
      exchangeRateFromUsd: number;
    }[]
  >([]);
  fetch(
    "https://api.freecurrencyapi.com/v1/latest?apikey=" +
      import.meta.env.VITE_CURRENCYCONVERTER_KEY
  )
    .then((r) => r.json())
    .then((r) => {
      console.log(r);
      Object.entries(r.data).forEach((entry) => {
        currencies[1]((v) => {
          v.push({
            name: entry[0],
            exchangeRateFromUsd: entry[1] as number,
          });
          return [...v];
        });
      });
    });

  const from = createSignal("USD");

  const to = createSignal("EUR");

  const inputMoney = createSignal(0);

  const finalAmt = createMemo(() => {
    if (!currencies[0]().length) return 0;
    const usd = otherCurrencyToUsd(inputMoney[0](), from[0]());
    return usdToCurrency(usd, to[0]());
    function otherCurrencyToUsd(amount: number, currency: string) {
      const c = currencies[0]()!.find((c) => c.name === currency);
      return amount / (c?.exchangeRateFromUsd ?? 1);
    }
    function usdToCurrency(usd: number, currency: string) {
      return (
        usd *
        (currencies[0]()!.find((c) => c.name === currency)
          ?.exchangeRateFromUsd ?? 1)
      );
    }
  });

  return (
    <>
      <Show when={currencies[0]()?.length}>
        <div class="cnt plastic">
          <h2>Convert Currency</h2>
          <div class="inputs">
            <div class="input-cnt">
              <select
                onInput={(e) => {
                  from[1](e.target.value);
                }}
              >
                <For each={currencies[0]()}>
                  {(c) => {
                    return (
                      <option selected={from[0]() === c.name} value={c.name}>
                        {c.name}
                      </option>
                    );
                  }}
                </For>
              </select>
              <input
                value={inputMoney[0]()}
                type="number"
                onInput={(e) => {
                  inputMoney[1](e.target.valueAsNumber);
                }}
              />
            </div>
            to
            <div class="input-cnt">
              <select
                onInput={(e) => {
                  to[1](e.target.value);
                }}
              >
                <For each={currencies[0]()}>
                  {(c) => {
                    return (
                      <option selected={to[0]() === c.name} value={c.name}>
                        {c.name}
                      </option>
                    );
                  }}
                </For>
              </select>
              <input readOnly value={finalAmt()} type="number" />
            </div>
          </div>
        </div>
      </Show>
    </>
  );
}

interface NewsArticle {
  link: string;
  source: string;
  title: string;
  summary: string;
  publishDate: string;
  language: string;
  images: string[];
}
function News() {
  const newsArticles = createSignal<NewsArticle[]>([]);

  function fetchArticles(page: number, query: string) {
    const url =
      "https://api.finlight.me/v1/articles?query=" +
      encodeURIComponent(query) +
      "&page=" +
      page;
    const options = {
      method: "GET",
      headers: {
        accept: "*/*",
        "X-API-KEY": import.meta.env.VITE_FINLIGHT_KEY,
      },
    };

    fetch(url, options)
      .then((response) => response.json())
      .then((data) => {
        newsArticles[1]((v) => {
          v.push(...data.articles);
          return structuredClone(v);
        });
        if (page < 4) {
          fetchArticles(page + 1, query);
        }
      })
      .catch(() => {});
  }

  const q = createSignal("finance");
  fetchArticles(1, q[0]());

  return (
    <>
      <div class="toolbar">
        <input
          placeholder="Search news..."
          style={{
            "flex-grow": "1",
          }}
          type="text"
          onChange={(e) => {
            q[1](e.target.value);
          }}
        />

        <button
          onClick={() => {
            if (!q[0]()?.length) return;
            newsArticles[1]([]);
            fetchArticles(1, q[0]());
          }}
        >
          <span>Search</span>
        </button>
      </div>
      <div
        class="articles"
        style={{
          "padding-top": "5rem",
        }}
      >
        <For each={newsArticles[0]()}>
          {(article) => {
            return (
              <>
                <a href={article.link} target="_blank" class="news-article">
                  <img
                    src={
                      article.images?.[0] ||
                      (q[0]() === "finance"
                        ? "https://upload.wikimedia.org/wikipedia/commons/3/3c/Numismatics_and_Notaphily_icon.png"
                        : "https://upload.wikimedia.org/wikipedia/commons/1/11/News_cropped.png")
                    }
                  />
                  <div class="text">
                    <h2>{article.title}</h2>
                    <p>{article.summary}</p>
                    <p class="pubdate">Published 2025-05-05</p>
                  </div>
                </a>
              </>
            );
          }}
        </For>
      </div>
    </>
  );
}

enum Tab {
  News,
  CurrencyConverter,
}
function App() {
  const tabs = [
    {
      text: "News",
      value: Tab.News,
    },
    {
      text: "Currency Converter",
      value: Tab.CurrencyConverter,
    },
  ];
  const selectedTab = createSignal(Tab.News);
  return (
    <>
      <div class="menu">
        <For each={tabs}>
          {(tab) => {
            return (
              <div
                onClick={() => {
                  selectedTab[1](tab.value);
                }}
                classList={{
                  selected: selectedTab[0]() === tab.value,
                }}
              >
                {tab.text}
              </div>
            );
          }}
        </For>
      </div>
      <div class="app-content">
        <Switch>
          <Match when={selectedTab[0]() === Tab.News}>
            <News />
          </Match>
          <Match when={selectedTab[0]() === Tab.CurrencyConverter}>
            <CurrencyConverter />
          </Match>
        </Switch>
      </div>
    </>
  );
}

export default App;
