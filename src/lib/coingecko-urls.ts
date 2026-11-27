// URL helpers only. Kept apart from coingecko.ts so the static id map stays out of the client bundle.

export function geckoTerminalPoolEmbed(pool: string): string {
  return `https://www.geckoterminal.com/solana/pools/${pool}?embed=1&info=0&swaps=0&grayscale=0&light_chart=0&chart_type=price&resolution=15m&bg_color=0a0a0a`;
}

export function geckoTerminalPoolUrl(pool: string): string {
  return `https://www.geckoterminal.com/solana/pools/${pool}`;
}

export function geckoTerminalTokenUrl(mint: string): string {
  return `https://www.geckoterminal.com/solana/tokens/${mint}`;
}
