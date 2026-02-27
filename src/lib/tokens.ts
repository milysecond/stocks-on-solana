export type TokenProvider = 'xStocks' | 'Ondo';

export interface StockToken {
  symbol: string;
  name: string;
  mint: string;
  provider: TokenProvider;
  sector?: string;
}

export const XSTOCKS: StockToken[] = [
  { symbol: 'AAPLx', name: 'Apple', mint: 'XsbEhLAtcf6HdfpFZ5xEMdqW8nfAvcsP5bdudRLJzJp', provider: 'xStocks', sector: 'Tech' },
  { symbol: 'AMZNx', name: 'Amazon', mint: 'Xs3eBt7uRfJX8QUs4suhyU8p2M6DoUDrJyWBa8LLZsg', provider: 'xStocks', sector: 'Retail' },
  { symbol: 'GOOGLx', name: 'Alphabet', mint: 'XsCPL9dNWBMvFtTmwcCA5v3xWPSMEBCszbQdiLLq6aN', provider: 'xStocks', sector: 'Tech' },
  { symbol: 'AMDx', name: 'AMD', mint: 'XsXcJ6GZ9kVnjqGsjBnktRcuwMBmvKWh8S93RefZ1rF', provider: 'xStocks', sector: 'Tech' },
  { symbol: 'ACNx', name: 'Accenture', mint: 'Xs5UJzmCRQ8DWZjskExdSQDnbE6iLkRu2jjrRAB1JSU', provider: 'xStocks', sector: 'Tech' },
  { symbol: 'ABTx', name: 'Abbott', mint: 'XsHtf5RpxsQ7jeJ9ivNewouZKJHbPxhPoEy6yYvULr7', provider: 'xStocks', sector: 'Health' },
  { symbol: 'ABBVx', name: 'AbbVie', mint: 'XswbinNKyPmzTa5CskMbCPvMW6G5CMnZXZEeQSSQoie', provider: 'xStocks', sector: 'Health' },
  { symbol: 'AVGOx', name: 'Broadcom', mint: 'XsgSaSvNSqLTtFuyWPBhK9196Xb9Bbdyjj4fH3cPJGo', provider: 'xStocks', sector: 'Tech' },
  { symbol: 'AZNx', name: 'AstraZeneca', mint: 'Xs3ZFkPYT2BN7qBMqf1j1bfTeTm1rFzEFSsQ1z3wAKU', provider: 'xStocks', sector: 'Health' },
  { symbol: 'BACx', name: 'Bank of America', mint: 'XswsQk4duEQmCbGzfqUUWYmi7pV7xpJ9eEmLHXCaEQP', provider: 'xStocks', sector: 'Finance' },
  { symbol: 'CSCOx', name: 'Cisco', mint: 'Xsr3pdLQyXvDJBFgpR5nexCEZwXvigb8wbPYp4YoNFf', provider: 'xStocks', sector: 'Tech' },
  { symbol: 'CVXx', name: 'Chevron', mint: 'XsNNMt7WTNA2sV3jrb1NNfNgapxRF5i4i6GcnTRRHts', provider: 'xStocks', sector: 'Energy' },
  { symbol: 'CRCLx', name: 'Circle', mint: 'XsueG8BtpquVJX9LVLLEGuViXUungE6WmK5YZ3p3bd1', provider: 'xStocks', sector: 'Crypto' },
  { symbol: 'APPx', name: 'AppLovin', mint: 'XsPdAVBi8Zc1xvv53k4JcMrQaEDTgkGqKYeh7AYgPHV', provider: 'xStocks', sector: 'Tech' },
];

export const ONDO_TOKENS: StockToken[] = [
  { symbol: 'USDY', name: 'Ondo US Dollar Yield', mint: 'A1KLoBrKBde8Ty9qtNQUtq3C2ortoC3u7twggz7sEto6', provider: 'Ondo', sector: 'Yield' },
  { symbol: 'OUSG', name: 'Ondo Short-Term US Govt Bond', mint: 'HHjoYFGeAdCYMDgPiDBCcVnwwjMhMZGtB3PcnJJYT2aW', provider: 'Ondo', sector: 'Bonds' },
];

export const ALL_TOKENS = [...XSTOCKS, ...ONDO_TOKENS];
