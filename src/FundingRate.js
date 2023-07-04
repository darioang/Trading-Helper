import React, { useEffect, useState } from 'react';
import Navbar from './Navbar.js';
import ccxt from 'ccxt';
import { DataGrid } from '@mui/x-data-grid';

function FundingRate() {
  const [rows, setRows] = useState([]);
  const [columns] = useState([
    { field: 'Symbol', headerName: 'Symbol', width: 150 },
    { field: 'Price Change 24h', headerName: 'Price Change 24h', width: 200 },
    { field: 'Funding', headerName: 'Funding', width: 150 },
    { field: 'Current Funding Annualised', headerName: 'Current Funding Annualised', width: 300 },
    { field: 'Funding 24hr avg.', headerName: 'Funding 24hr avg.', width: 200 },
    { field: 'Funding 3d avg.', headerName: 'Funding 3d avg.', width: 200 },
    { field: 'Volume 24h', headerName: 'Volume 24h', width: 200 },
    { field: 'Open Interest', headerName: 'Open Interest', width: 200 },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBybitPerpData = async () => {
      const exchange = new ccxt.bybit();
      exchange.proxy = 'http://localhost:8080/';

      try {
        setIsLoading(true);
        await exchange.loadMarkets();
        const markets = await exchange.fetchMarkets();

        // Filter perps
        const perps = markets.filter(
          (market) => market.type === 'swap' && market.settle === 'USDT'
        );

        const promises = [];

        exchange.rateLimit = 5000;

        for (const symbol of perps) {
          promises.push(exchange.fetchFundingRateHistory(symbol.symbol));
        }

        const results = await Promise.all(promises);
        const funding_24 = [];
        const funding_3d = [];

        const current_time = Date.now();

        for (let i = 0; i < results.length; i++) {
          const symbol = perps[i];
          const funding_rates = results[i];

          let rate_24 = 0;
          let rate_3d = 0;

          for (const rate of funding_rates) {
            if (rate && rate.timestamp) {
              const timeDiff = current_time - rate.timestamp;
              if (timeDiff < 24 * 60 * 60 * 1000) {
                rate_24 += parseFloat(rate.fundingRate);
              }
              if (timeDiff < 3 * 24 * 60 * 60 * 1000) {
                rate_3d += parseFloat(rate.fundingRate);
              }
            }
          }

          rate_24 = (rate_24 * 365 * 100).toFixed(2);
          rate_3d = ((rate_3d / 3) * 365 * 100).toFixed(2);

          funding_24.push(rate_24);
          funding_3d.push(rate_3d);
        }

        const symbols = [];
        const priceChange24h = [];
        const volume24h = [];
        const funding = [];
        const fundingAnnualised = [];
        const openInterest = [];

        const fetchTickers = async () => {
          const tickers = await exchange.fetchTickers();
          return tickers;
        };

        // Fetch 24-hour stats for each perp
        for (const perp of perps) {
          const tickers = await fetchTickers();
          const symbol = perp.symbol;
          const ticker = tickers[symbol];
          const base = perp.base;
          const price_change_24h = ticker.percentage;
          const volume_24h = ticker.quoteVolume;
          const funding_val = parseFloat(ticker.info.fundingRate) * 100;
          const oi = ticker.info.openInterestValue;
          const funding_interval = parseFloat(perp.info.fundingInterval);
          const funding_annualised = funding_val * (365 * 24 * 60) / funding_interval;

          symbols.push(base);
          priceChange24h.push(parseFloat(price_change_24h));
          volume24h.push(parseFloat(volume_24h));
          funding.push(parseFloat(funding_val));
          fundingAnnualised.push(parseFloat(funding_annualised));
          openInterest.push(parseFloat(oi));
        }

        const data = symbols.map((symbol, index) => ({
          id: index + 1,
          Symbol: symbol,
          'Price Change 24h': parseFloat(priceChange24h[index]),
          Funding: parseFloat(funding[index]),
          'Current Funding Annualised': parseFloat(fundingAnnualised[index]),
          'Funding 24hr avg.': funding_24[index],
          'Funding 3d avg.': funding_3d[index],
          'Volume 24h': parseFloat(volume24h[index]),
          'Open Interest': parseFloat(openInterest[index]),
        }));

        setRows(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching Bybit data:', error);
        setIsLoading(false);
      }
    };

    fetchBybitPerpData();
  }, []);

  return (
    <div>
      <Navbar />
      <div style={{ height: 900, marginTop: 20, width: '100%' }}>
        {isLoading ? ( // Render loading symbol if isLoading is true
            <div>Loading...</div>
          ) : (
            <DataGrid rows={rows} columns={columns} />
          )}
      </div>
    </div>
  );
}

export default FundingRate;