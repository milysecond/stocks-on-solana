/**
 * Sunrise listings on Solana, copied from the official app payload at
 * https://app.sunrise.xyz/tokens on 17 Nov 2026.
 * Token pages are https://app.sunrise.xyz/tokens/<mint> (symbol paths 404).
 * Only these mints get a Trade on Sunrise link. Do not infer listings from tickers.
 */

export type SunriseListing = {
  symbol: string;
  name: string;
  mint: string;
  assetClass: 'stock' | 'commodity' | 'crypto' | 'stablecoin' | 'unknown';
};

export const SUNRISE_LISTINGS: SunriseListing[] = [
  { symbol: "PAXG", name: "PAX Gold", mint: "5GgRAEmv8ZxF2PR5hY72Qs5x1bnQ6UK2RbTPoqJ3wSwW", assetClass: "commodity" },
  { symbol: "AAVE", name: "Aave", mint: "AavE1kKKnesPw4MuRJmJ9jZs9QzEE8CPxQ3ViczUDfc1", assetClass: "crypto" },
  { symbol: "AFC", name: "Arsenal FC", mint: "Dst93spXQEXxFzwYbFrQRnFYBYpw7AzB2QyALEeP4NGQ", assetClass: "crypto" },
  { symbol: "AKT", name: "Akash", mint: "5d3fjPDdkYbtYcAMR9PC2TANaEyhzuyP8JxTEwqjVgBZ", assetClass: "crypto" },
  { symbol: "APE", name: "ApeCoin", mint: "C1MHyoTJpRTeS9AQCyspNVu2EWAYCZwmJ1jNkEArFP1f", assetClass: "crypto" },
  { symbol: "ARB", name: "Arbitrum", mint: "ARBzQTYDCW2KnVEjs1Mc81LekB1ibVFZKbSVmorkoT9d", assetClass: "crypto" },
  { symbol: "ASTER", name: "Aster", mint: "ASTERYpc2EhivYWSbtuWPuCMdXtZGmHwtH93NqYVw45Z", assetClass: "crypto" },
  { symbol: "AVAX", name: "Avalanche", mint: "avaxGHCq3T7hoxd73oY2KY9hJSTaeMibXvHy5KNzh5D", assetClass: "crypto" },
  { symbol: "BILL", name: "Billions Network", mint: "Bi11Je4MH3PpyCNiuTAepRbsA5U6DK3DJy79ZFthddX", assetClass: "crypto" },
  { symbol: "BLEND", name: "Fluent", mint: "BWsnyEa1XtsNRdgPaDoA1WVUonF7BBGZTd2zc72NQsWT", assetClass: "crypto" },
  { symbol: "BONER.com", name: "BONER.com", mint: "bonerpW3GSWw9RHsMKRE757EohtsYDf1kpDdxG2S4t1", assetClass: "crypto" },
  { symbol: "BP", name: "Backpack", mint: "BPxxfRCXkUVhig4HS1Lh7kZqV6SPJhzfEk4x6fVBjPCy", assetClass: "crypto" },
  { symbol: "CASHCAT", name: "Cash Cat", mint: "CashcatZMRn4Jv8sPQZUSsbTLi2PcPe1ssqbHcnaJqSS", assetClass: "crypto" },
  { symbol: "CHIP", name: "USD.AI", mint: "chipCAT7vi5CZtbZsn9z7iMPXvFwyAnKz3QFu8XVuHm", assetClass: "crypto" },
  { symbol: "CHZ", name: "Chiliz", mint: "6eftxVbSAunVEoxUWdGhPdxg5UdsJ8Wkwy5w5YFuxouw", assetClass: "crypto" },
  { symbol: "Cake", name: "PancakeSwap Token", mint: "4qQeZ5LwSz6HuupUu8jCtgXyW1mYQcNbFAW1sWZp89HL", assetClass: "crypto" },
  { symbol: "DOGE", name: "Dogecoin", mint: "DoGEV7LASBkQbibMc5k5vKnTZoMg423GpJ5QtJEGfm7R", assetClass: "crypto" },
  { symbol: "ENA", name: "Ethena", mint: "72QvBVwpxqmheEPfaCwWSWqEFsUy3rhWt6JhQBMNTwD1", assetClass: "crypto" },
  { symbol: "HYPE", name: "Hyperliquid", mint: "98sMhvDwXj1RQi5c5Mndm3vPe9cBqPrbLaufMXFNMh5g", assetClass: "crypto" },
  { symbol: "INJ", name: "Injective", mint: "1NJMqVM4PadjuzYmeB7zV7q7DV8oB3ExaQCd9x6KsLz", assetClass: "crypto" },
  { symbol: "INX", name: "Infinex", mint: "inxKXw9V2NDZE7hDijzpJaKKUb97NEPJDTCEEiYg4yY", assetClass: "crypto" },
  { symbol: "LINK", name: "Chainlink", mint: "LinkhB3afbBKb2EQQu7s7umdZceV3wcvAUJhQAfQ23L", assetClass: "crypto" },
  { symbol: "LIT", name: "Lighter", mint: "EicWvteVi2fWepEzS3FYWsnuPoP6caZfjnKqNvydLjCH", assetClass: "crypto" },
  { symbol: "MEGA", name: "MegaETH", mint: "megaA5QDK1qLXtjpvg9oCFMvxT9d5BCMrVTBddnM5kV", assetClass: "crypto" },
  { symbol: "MON", name: "Monad", mint: "CrAr4RRJMBVwRsZtT62pEhfA9H5utymC2mVx8e7FreP2", assetClass: "crypto" },
  { symbol: "MORPHO", name: "Morpho", mint: "Morpho2VPeTr2E1Jx6monxCzF7mqwUnjz74RdwLXYyP", assetClass: "crypto" },
  { symbol: "NEAR", name: "NEAR", mint: "3ZLekZYq2qkZiSpnSvabjit34tUkjSwD1JFuW9as9wBG", assetClass: "crypto" },
  { symbol: "ONDO", name: "Ondo", mint: "ondohH8Vssxiqcy5u6Efi4AYN17KZrzQtv2a91dnrgW", assetClass: "crypto" },
  { symbol: "PEAQ", name: "peaq", mint: "PEAQjk7SRS6rXHVFFmpRr7zrC4g5ZuEebpwTxvaLr3b", assetClass: "crypto" },
  { symbol: "PEPE", name: "Pepe", mint: "PEPEqnuuCDbBC89p1u9vpnP1KQ2oj1xTcQBsjt9X55m", assetClass: "crypto" },
  { symbol: "PONS", name: "Pons", mint: "poNSfquKq512ApeYjVghwViSun4x1MhCqHVH2Paq4jN", assetClass: "crypto" },
  { symbol: "PSG", name: "Paris Saint-Germain", mint: "5eyib4qghYGHNh7VvxSFGYLFJSanjq9hug9fR52kksnm", assetClass: "crypto" },
  { symbol: "QNT", name: "Quant", mint: "qntUzPUsJ51abNP7VYNxkmsQ4RnvEZAhavUxsCxpxH4", assetClass: "crypto" },
  { symbol: "SHIB", name: "SHIBA INU", mint: "shib5gSoVKPjwkXrxRk7SbQFzb2R9rQB3TgQWYX4RwW", assetClass: "crypto" },
  { symbol: "SLX", name: "Solstice", mint: "SLXdx4BUt2v9uJQNzWqSfzTJ9UKLUDsvxHFMEEdrfgq", assetClass: "crypto" },
  { symbol: "SOL", name: "Solana", mint: "native", assetClass: "crypto" },
  { symbol: "SUI", name: "Sui", mint: "suifhC9gU1VbJAPYPTBkHJyyyStKGLLYPVDTmPoqbvA", assetClass: "crypto" },
  { symbol: "SV151", name: "Scarlet & Violet 151", mint: "SV151D5pjygAKA8aJJcKzm4wFnRX5G92Fye94jQJk7g", assetClass: "crypto" },
  { symbol: "TAO", name: "Bittensor", mint: "taoC6xyv2v8tDLcev4uaGUgV4vdQsWJrGft2kcBRrBY", assetClass: "crypto" },
  { symbol: "UNI", name: "Uniswap", mint: "uniHfuPhEQSrtpzXpJZDCSq53yaejKKpNhFUiKoHKHV", assetClass: "crypto" },
  { symbol: "VVV", name: "Venice Token", mint: "VVV4UdRywr7SLafPHzqXwRCw7myXkmgCtitXUvj8g8c", assetClass: "crypto" },
  { symbol: "WBTC", name: "Wrapped Bitcoin", mint: "3NZ9JMVBmGAqocybic2c7LQCJScmgsAZ6vQqTDzcqmJh", assetClass: "crypto" },
  { symbol: "WETH", name: "Wrapped Ether", mint: "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs", assetClass: "crypto" },
  { symbol: "WLD", name: "Worldcoin", mint: "WLDTE73PPdfFFjhpBz8Yuhvx5N45gvgEgyMXqwa3rFn", assetClass: "crypto" },
  { symbol: "XPL", name: "Plasma", mint: "XPLTrL1ZH3tZJBdFWbbtrNjK9qoqZWfuhQJnXibbdfT", assetClass: "crypto" },
  { symbol: "ZAMA", name: "Zama", mint: "4Zp52aF4hZi9fzH19xpbWKYKQvgLyCN67KFbrQDqeTKh", assetClass: "crypto" },
  { symbol: "ZEC", name: "Zcash", mint: "A7bdiYdS5GjqGFtxf17ppRHtDKPkkRqbKtR27dxvQXaS", assetClass: "crypto" },
  { symbol: "cbADA", name: "Coinbase Wrapped ADA", mint: "cbADAmv9issuPfhFwyQG3xac4DGPd1LDSt1oz7vwJsg", assetClass: "crypto" },
  { symbol: "cbLTC", name: "Coinbase Wrapped LTC", mint: "cbLTC4T5NpzSUtQ7ekgEMZGaUPVJY1ko6BUikqa4gGf", assetClass: "crypto" },
  { symbol: "USDC", name: "USD Coin", mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", assetClass: "stablecoin" },
  { symbol: "USDS", name: "USDS", mint: "USDSwr9ApdHk5bvJKMjzff41FfuX8bSxdKcR81vTwcA", assetClass: "stablecoin" },
  { symbol: "USDT", name: "Tether USD", mint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", assetClass: "stablecoin" },
  { symbol: "USDV", name: "Solomon USDv", mint: "USDvUSpnhCr9yBgj3UyVrD239HRUv4RsHwH2FxsWuMk", assetClass: "stablecoin" },
  { symbol: "USDe", name: "Ethena USDe", mint: "DEkqHyPN7GMRJ5cArtQFAWefqbZb33Hyf6s5iCwjEonT", assetClass: "stablecoin" },
  { symbol: "AAPL", name: "Apple - Backpack Securities", mint: "AAPLEDt8RpzPgXyhvFzkMBofvFSQw9gpeMCoUdPdLnB8", assetClass: "stock" },
  { symbol: "ABNB", name: "Airbnb - Backpack Securities", mint: "ABNB56TteaTZG1S3DY2W8VMncQmHMvNCGaZgAba49CLP", assetClass: "stock" },
  { symbol: "AMC", name: "AMC Entertainment - Backpack Securities", mint: "AMC1qwR9KhiyrQBRPrxnfo4JfMeMZqEBvt5tgTytNNoc", assetClass: "stock" },
  { symbol: "AMD", name: "Advanced Micro Devices - Backpack Securities", mint: "AMD8XwJXgQ9WV45Wyj9yFLejxzf2J6VM1PJY8bJEjeES", assetClass: "stock" },
  { symbol: "AMZN", name: "Amazon - Backpack Securities", mint: "AMZNw7cwU9L9c7ewZXxTws2PwQYxBGm2Rxg3FLDBJz9B", assetClass: "stock" },
  { symbol: "ARM", name: "Arm Holdings - Backpack Securities", mint: "ARMbSB1MBRQrY6PNMao1HdQ431VafC6JRJCsGZ2Yv3iJ", assetClass: "stock" },
  { symbol: "AVGO", name: "Broadcom - Backpack Securities", mint: "AVGoo4BQGsEfAmu4HU2deZTaTmLoqB3q3EzKXqAANGYD", assetClass: "stock" },
  { symbol: "BA", name: "The Boeing Company - Backpack Securities", mint: "BArimz1PcKZr8PcPh3tcZ2dg4S7FJLk3cw6R5F8GsHKg", assetClass: "stock" },
  { symbol: "BABA", name: "Alibaba Group Holding - Backpack Securities", mint: "BABANGA4JE7Kkam4nTrALAwAVgsNJUuFJnnkF7S16BZp", assetClass: "stock" },
  { symbol: "BB", name: "BlackBerry - Backpack Securities", mint: "BBosJLw8ZzoATiEyywiifx7AgmrD2Cm3XjFWbhbRhChy", assetClass: "stock" },
  { symbol: "BE", name: "Bloom Energy - Backpack Securities", mint: "BEBVfXZ8uCxRBuunEbW9wcq9r7W9ySNo14oJBJkDgpZx", assetClass: "stock" },
  { symbol: "BLK", name: "BlackRock - Backpack Securities", mint: "BLKKYfF41c6xRPrtX1rdYbxLE1xxEdZUnxQsB5hcZ8Nf", assetClass: "stock" },
  { symbol: "BOT", name: "RoboStrategy - Backpack Securities", mint: "BoTx8y9ynfdxf5ZjWtCoBVkff52qKA82ysaLU8ZM6d8T", assetClass: "stock" },
  { symbol: "BROS", name: "Dutch Bros - Backpack Securities", mint: "BRVaZKg6J9iF2BEsdpsxJ9NyvN9PPxPZuoQUX2v8qqkk", assetClass: "stock" },
  { symbol: "BULL", name: "Webull Corporation Class A Ordinary Shares - Backpack Securities", mint: "BULL151gUXcFV5wXEUqu9Am2L7Qt4bTJRLRuAUjkcspC", assetClass: "stock" },
  { symbol: "CBRS", name: "Cerebras Systems - Backpack Securities", mint: "CBRSFBbQPpp77NpMcwbTN6fhBHmZM94oFLJvruytw4Fi", assetClass: "stock" },
  { symbol: "CHWY", name: "Chewy - Backpack Securities", mint: "CHWYHz2zfKajomqPV9it26n7vu7AgZZfqGHXCWtGWuJg", assetClass: "stock" },
  { symbol: "CMG", name: "Chipotle Mexican Grill - Backpack Securities", mint: "CMGi497VQA9RiHVWpQi5B847vN8RLaEwcMhB5kEUhkAQ", assetClass: "stock" },
  { symbol: "COPX", name: "Global X Copper Miners ETF - Backpack Securities", mint: "CzLTZppPdZtTjyq3WGpHLstoc3GLhu7zH5Zg6xUa6Gv5", assetClass: "stock" },
  { symbol: "COST", name: "Costco Wholesale - Backpack Securities", mint: "CZEB3WNZuF2Yz1z2H81RcCk8T7fsw82KB33zqamASVsg", assetClass: "stock" },
  { symbol: "CRWV", name: "CoreWeave - Backpack Securities", mint: "CRWVJeR2yEZuDUKYfGuKCHvLz8ywn4LGvovHfy5WiFmi", assetClass: "stock" },
  { symbol: "CYPH", name: "Cypherpunk Technologies - Backpack Securities", mint: "CYPHuMmCL1GxJWa2tsPhLKykC7GrHJTCHwbXD4g5uawK", assetClass: "stock" },
  { symbol: "DELL", name: "Dell Technologies - Backpack Securities", mint: "DELL2aRKQz7DMq5DrKLtkn47ZCnbxXPZXrSGbkmd13wy", assetClass: "stock" },
  { symbol: "DJT", name: "Trump Media & Technology Group Corp. Common Stock - Backpack Securities", mint: "DJTu7vi8norVzdVAffgvb39VP7wjKeTsgaMBJrzfxvoF", assetClass: "stock" },
  { symbol: "DKNG", name: "DraftKings - Backpack Securities", mint: "DKNGQFNGQmoBdXSRGKJ8tTu7uPDasw5JDcfMmWniNfow", assetClass: "stock" },
  { symbol: "DNUT", name: "Krispy Kreme, Inc. Common Stock - Backpack Securities", mint: "DNUTsCvKbKwu2RM72cUuW3TD9YpzArzACcqYQssjPLSk", assetClass: "stock" },
  { symbol: "DRAM", name: "Roundhill Memory ETF - Backpack Securities", mint: "DRAMjSWR7HRfJKjRkvQWYL2bcaejaVhuxEcjf4pAY4Cw", assetClass: "stock" },
  { symbol: "EWY", name: "iShares MSCI South Korea ETF - Backpack Securities", mint: "EWY4owSJYMpwN33qGDu5gGxpkQkpMJu8ZUsQJaNZG5dv", assetClass: "stock" },
  { symbol: "EWZ", name: "iShares MSCI Brazil ETF - Backpack Securities", mint: "EWZzCki1igp2y73UyUM4RCG4QUVMQAtnrQUVNaDHzDxJ", assetClass: "stock" },
  { symbol: "FLWS", name: "1-800-FLOWERS.COM - Backpack Securities", mint: "FLWSojG1gB5VStYR3Sb4nQFRt43UBYkqih1j2CpVLqgd", assetClass: "stock" },
  { symbol: "FLY", name: "Firefly Aerospace - Backpack Securities", mint: "FLYRq3en8r2Z69gN3KyAnDrvnitEJNkwPYY7favinHeD", assetClass: "stock" },
  { symbol: "FWDI", name: "Forward Industries, Inc. - Backpack Securities", mint: "FWDtiB5fXHdVAewPqvHPL2dh4aBC1C6GacQbePoQXKjz", assetClass: "stock" },
  { symbol: "GOOGL", name: "Alphabet - Backpack Securities", mint: "GooGLMvZtJZXHdNZy95RUrAMCCKxV6ghK3qE5ddBgVm5", assetClass: "stock" },
  { symbol: "GPRO", name: "GoPro - Backpack Securities", mint: "GPRR2u6NS5yBQHWGauoJ9HXgjrTH8dDsrBfTV5zAYvDH", assetClass: "stock" },
  { symbol: "GRND", name: "Grindr - Backpack Securities", mint: "GRNDYDpqwpCm6jVxpbh4xT5AM4r3p391qYsKTHqgaET2", assetClass: "stock" },
  { symbol: "HIMS", name: "Hims & Hers Health - Backpack Securities", mint: "HiMSSzzwkZkrXJ4PGVJRdtfLaANeAztjjcgk5Dxe7Lwx", assetClass: "stock" },
  { symbol: "HOOD", name: "Robinhood Markets - Backpack Securities", mint: "HooDYv5RewLRiMLnEVq3VJqdqxhuE6c5eYvqejMC3e9A", assetClass: "stock" },
  { symbol: "HTZ", name: "Hertz Global Holdings, Inc Common Stock - Backpack Securities", mint: "HTZsLG4zqaNvWMwXSLHH3GG5KyJpKwpBRsKVdMG6hvzP", assetClass: "stock" },
  { symbol: "IBM", name: "International Business Machines - Backpack Securities", mint: "BMKdM4yUxX12moFqVk195k7coMbaybd4RUKCUdm7D1Sk", assetClass: "stock" },
  { symbol: "ICE", name: "Intercontinental Exchange - Backpack Securities", mint: "CEQnejxG1FPzMS6UiLbcxNiMKrZM3x6GTZucpJoSeByy", assetClass: "stock" },
  { symbol: "INTC", name: "Intel - Backpack Securities", mint: "iNTCy1qTsUEZQe3DSocLz1ZXXai34Gdw8THQh5rxFaF", assetClass: "stock" },
  { symbol: "IONQ", name: "IonQ - Backpack Securities", mint: "NQ5hSuXQZrbnrwcDVk2qN73njjd3E3v3badYHnj5thF", assetClass: "stock" },
  { symbol: "IREN", name: "IREN - Backpack Securities", mint: "RENzhrJQgmAnfcLhU1U5XwAMc6TC15UA6jCbPBaasnj", assetClass: "stock" },
  { symbol: "JNJ", name: "Johnson & Johnson - Backpack Securities", mint: "JNJg1znKdF712Phe7L7z52AATAvEjEytBdN2w8Lnh1Y", assetClass: "stock" },
  { symbol: "LLY", name: "Eli Lilly and Company - Backpack Securities", mint: "LLYuwZ33keFihgwoxXsBawy31AiRFLFSva32TYq5TvD", assetClass: "stock" },
  { symbol: "LMT", name: "Lockheed Martin - Backpack Securities", mint: "LMT3i1BHgixFqPUgcyteJhnEz2dpy9i3cYy4pi9BoeV", assetClass: "stock" },
  { symbol: "LULU", name: "lululemon athletica inc. - Backpack Securities", mint: "LULUmT9VMttkfAJE236LXJcYJ2tTP7nunrSWR5G1BdS", assetClass: "stock" },
  { symbol: "LUV", name: "Southwest Airlines Co. - Backpack Securities", mint: "LUV9GB51PNZNRyzzyYK3rtqFfvDvWtRiXZ34wVq2HrX", assetClass: "stock" },
  { symbol: "META", name: "Meta Platforms - Backpack Securities", mint: "METAaH6MMZZgy2CTEJq3QdNi7AFVTV3NxHFBfFgLEDd", assetClass: "stock" },
  { symbol: "MGM", name: "MGM Resorts International - Backpack Securities", mint: "MGMuubtUEirmkhfEQdmGUh4pr7HuUdMWcZXFtpPbVJD", assetClass: "stock" },
  { symbol: "MNST", name: "Monster Beverage - Backpack Securities", mint: "MNSTy46haEN7sEaeXAWBXG6zHaRikCvqf3krAEDzxr2", assetClass: "stock" },
  { symbol: "MRNA", name: "Moderna - Backpack Securities", mint: "MRNAzXzhNcaEXJPibHEn8cd4vyekCDiivTyEwswLUCT", assetClass: "stock" },
  { symbol: "MRVL", name: "Marvell Technology - Backpack Securities", mint: "MRVLSjkR2ceUBukujaD3xCyHP1H3B2SzpsNTZF546jo", assetClass: "stock" },
  { symbol: "MSFT", name: "Microsoft - Backpack Securities", mint: "MSFThX899B1DddH5jkyMpdArWXzP85VXLYDrbGGcRJM", assetClass: "stock" },
  { symbol: "MSTR", name: "Strategy - Backpack Securities", mint: "MSTRdWXMeZxdE8osAQy3fA4rvTY5rgummDSMEx6U7Nz", assetClass: "stock" },
  { symbol: "MU", name: "Micron Technology - Backpack Securities", mint: "MUxEsUKSMACyw5fZf68wxf5FLnZVhtU9CwH8uNNGay1", assetClass: "stock" },
  { symbol: "NBIS", name: "Nebius Group N.V. - Backpack Securities", mint: "NBiSF3UaVUFtRzHwAfxyHsBCAZWGEKnMpewAE4oh7BG", assetClass: "stock" },
  { symbol: "NFLX", name: "Netflix - Backpack Securities", mint: "NFLX7qV57zuVxCoHy3s1jiGZyALraLNwttbxdvmYJLJ", assetClass: "stock" },
  { symbol: "NKE", name: "NIKE - Backpack Securities", mint: "NKEda5nHhNGgjrE9nDdMvaEmkmJ96qqxzBVZEcKmjSg", assetClass: "stock" },
  { symbol: "NOK", name: "Nokia Oyj - Backpack Securities", mint: "N7Q5fYX7YRnDQksfdBKnoUb3awm92n7QNAD35X3Rq1X", assetClass: "stock" },
  { symbol: "NVDA", name: "Nvidia - Backpack Securities", mint: "NVDAVuiB7hwd3m5Wa1JuHNovPaPG6BH1QNztbKFxNjv", assetClass: "stock" },
  { symbol: "OPNW", name: "OpenWorld - Backpack Securities", mint: "oPNWKYTYJyEs2RbpjUXfCTxrNtiTjTcz3ipvUvBBAH2", assetClass: "stock" },
  { symbol: "PFE", name: "Pfizer - Backpack Securities", mint: "PFER6ENqP8r8NF3CqVt4mFowxsin3V5MLidBNQFCC3x", assetClass: "stock" },
  { symbol: "PTN", name: "Palatin Technologies, Inc. Common Stock - Backpack Securities", mint: "PTNzAfFAB4LvoUQEUUGrFMyUoRLExMYjH6CcfyQfsVP", assetClass: "stock" },
  { symbol: "PUSA", name: "Powerus Corporation - Backpack Securities", mint: "PUSAG1stksTcAoK9MjinEHUwAYRJsbovywYCk37m6hy", assetClass: "stock" },
  { symbol: "QQQ", name: "Invesco QQQ Trust - Backpack Securities", mint: "QQQvDYxG7g11Rr4rnaJqDddmP9ocH74YhE3mDaG37R9", assetClass: "stock" },
  { symbol: "QUBT", name: "Quantum Computing - Backpack Securities", mint: "QUBTAD8C9bMU9LvmMNgKPhrmBGbHvxpu6vfWQtThxxw", assetClass: "stock" },
  { symbol: "RACE", name: "Ferrari - Backpack Securities", mint: "RACEyWiM2ztEZcJx2AHXU2eWjhxU57x3vXn92b39dLD", assetClass: "stock" },
  { symbol: "RBLX", name: "Roblox - Backpack Securities", mint: "RBLXDGRD64AtRamHMFVcjqne3Ar7NLWtFtYNtsrf1cE", assetClass: "stock" },
  { symbol: "RDDT", name: "Reddit - Backpack Securities", mint: "RDDTGbhHwVXfyCvQMXzzowKjf5qrYBZAnehoXW83ooh", assetClass: "stock" },
  { symbol: "RIOT", name: "Riot Platforms - Backpack Securities", mint: "RUKx7nBgm94pwRPbVm99xYVdcTDTUyGs8Cw3VSYQXHf", assetClass: "stock" },
  { symbol: "RIVN", name: "Rivian Automotive - Backpack Securities", mint: "RcZmt84VMJv9bDhKqmw1uWDahYrUT468VwAChTnfD8p", assetClass: "stock" },
  { symbol: "RKLB", name: "Rocket Lab - Backpack Securities", mint: "RKLBnAXGqv31iZomqsuAWkQm1aqC7JwwvbCfzGdqAhz", assetClass: "stock" },
  { symbol: "RUM", name: "RUM Group Inc. - Backpack Securities", mint: "RUMsPfFZFnN1ZmGANwP7FNMJMjKH4m9RiMePrtVtLe7", assetClass: "stock" },
  { symbol: "SCHH", name: "Schwab U.S. REIT ETF - Backpack Securities", mint: "SCHHJ3jRdSjeFEVAaLrnYdx3Brphn92Ys7z1qkiCtPX", assetClass: "stock" },
  { symbol: "SHOP", name: "Shopify - Backpack Securities", mint: "SH55hfaipFAbwT42nQYhRoM5o5t61QpkmJ6p62vXB3m", assetClass: "stock" },
  { symbol: "SKHY", name: "SK Hynix - Backpack Securities", mint: "SKHYhSjuRWHgikq8eRKbtBbpABgJSkd7ytQV14i9EQ3", assetClass: "stock" },
  { symbol: "SNAP", name: "Snap - Backpack Securities", mint: "SNAPcESrvnH8yUdgeMF6xm1hym9b6hW6s8YeqeHdZFz", assetClass: "stock" },
  { symbol: "SNDK", name: "Sandisk - Backpack Securities", mint: "SNDKbwMUQvZhnLnxLduradgLHG5KrPuKwpnrkkGRhfH", assetClass: "stock" },
  { symbol: "SPCX", name: "SpaceX - Backpack Securities", mint: "SPCXxcqXj6e5dJDVNovHN8744zkbhM2bYudU45BimGb", assetClass: "stock" },
  { symbol: "SPHR", name: "Sphere Entertainment Co. - Backpack Securities", mint: "SPHRp8cZaSQBTp1KMNP4V1X821SXhXWt4Q2yLdyHzju", assetClass: "stock" },
  { symbol: "SPY", name: "State Street SPDR S&P 500 ETF Trust - Backpack Securities", mint: "SPYBo66VJPFjh1pXMb9Le53kDYWTK1zzYVDeVRWtsbi", assetClass: "stock" },
  { symbol: "SQQQ", name: "ProShares UltraPro Short QQQ - Backpack Securities", mint: "SQQQAa3gUxgnqcEsdjPA4RQNQBgB97TnG2hJhk2WaGE", assetClass: "stock" },
  { symbol: "TKO", name: "TKO Group Holdings - Backpack Securities", mint: "TKVC45Wshi9sjunhyTAyg7xHRVCSHoSe4AebGiFDkDC", assetClass: "stock" },
  { symbol: "TSLA", name: "Tesla - Backpack Securities", mint: "TSLAqBbv4CNCnzWFeB7LmydAyEiNMJtve7DYKLpdK4S", assetClass: "stock" },
  { symbol: "TSM", name: "Taiwan Semiconductor Manufacturing Company - Backpack Securities", mint: "TSM2Hiuf7Z9REcwZFQvsBEekBYCYziWBABfFnj6V6gQ", assetClass: "stock" },
  { symbol: "TTWO", name: "Take-Two Interactive Software - Backpack Securities", mint: "TTWofwAge91oFhZs7kpQdyrVRkmevgM88xijGvQFbKo", assetClass: "stock" },
  { symbol: "UPS", name: "United Parcel Service - Backpack Securities", mint: "UPSqUeMHcWbkdg784XuBUEF9DtySSnW9ur5LAVdcuB9", assetClass: "stock" },
  { symbol: "URA", name: "Global X Uranium ETF - Backpack Securities", mint: "URARfsinxCRw4JpvQhuT4CxavdZXZEMjv9ZwWmWpwag", assetClass: "stock" },
  { symbol: "USO", name: "United States Oil Fund, LP - Backpack Securities", mint: "USNv3NkKA27Dh4nsHJDPhW4VoEcTQmjoZyJt2dqdwFu", assetClass: "stock" },
  { symbol: "UVXY", name: "ProShares Ultra VIX Short-Term Futures ETF - Backpack Securities", mint: "UVXY4ojmAMTaPwUmrRmcuxWHjMHCbz3BxX2RBMzjYKx", assetClass: "stock" },
  { symbol: "WEN", name: "The Wendy's Company - Backpack Securities", mint: "WENAZ2WyPbmgvUcKfQ8hyMDfBQP9bZ65hsZ5KTFrRGZ", assetClass: "stock" },
  { symbol: "WULF", name: "TeraWulf - Backpack Securities", mint: "WULFeyfrj1VJKD9HhRTcW8R4g5HefUA11HDEdBv2WxD", assetClass: "stock" },
];

export const SUNRISE_MINTS: ReadonlySet<string> = new Set(SUNRISE_LISTINGS.map((t) => t.mint));

/**
 * TODO(Sal): Sunrise does not publish a referral query parameter.
 * Checked 17 Nov 2026: app.sunrise.xyz token pages and swap query params
 * (fromToken, toToken, fromChain, toChain, fromAmount), docs.sunrise.xyz,
 * and the Rewards link (frontiertraders.com/campaigns). No ref / referral / code param.
 * Replace SUNRISE_REF with the real code and set SUNRISE_REF_PARAM to the
 * query key when you have both. Until SUNRISE_REF_PARAM is set, links omit the code
 * so we do not invent a parameter name.
 */
export const SUNRISE_REF = 'TODO';

/** Query parameter that should carry SUNRISE_REF. null = param name unknown. */
export const SUNRISE_REF_PARAM: string | null = null;

const SUNRISE_APP = 'https://app.sunrise.xyz';

function withSunriseRef(url: string): string {
  const param = SUNRISE_REF_PARAM;
  if (!param || !SUNRISE_REF) return url;
  const next = new URL(url);
  next.searchParams.set(param, SUNRISE_REF);
  return next.toString();
}

/** Sunrise app home (swap terminal). */
export function getSunriseHomeUrl(): string {
  return withSunriseRef(SUNRISE_APP);
}

/** Token directory. */
export function getSunriseTokensUrl(): string {
  return withSunriseRef(`${SUNRISE_APP}/tokens`);
}

/**
 * Trade / token page for a mint that Sunrise itself lists.
 * Returns null when the mint is not on https://app.sunrise.xyz/tokens.
 */
export function getSunriseTradeUrl(token: { mint: string }): string | null {
  if (!token.mint || !SUNRISE_MINTS.has(token.mint)) return null;
  return withSunriseRef(`${SUNRISE_APP}/tokens/${token.mint}`);
}
