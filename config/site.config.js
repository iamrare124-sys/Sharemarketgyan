const stocksConfig = require('./niches/stocks.config')

const NICHE_MAP = {
  stocks: stocksConfig,
}

function loadConfig() {
  const niche = process.env.NICHE || 'stocks'
  const config = NICHE_MAP[niche]
  if (!config) throw new Error(`Unknown NICHE="${niche}"`)
  return config
}

const nicheConfig = loadConfig()
module.exports = { nicheConfig, languageConfig: { mode: process.env.LANGUAGE_MODE || 'english' } }
