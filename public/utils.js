function getNetworkNameByChainId (chainId) {
  const networkNameByChainId = {
    1: 'Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    5: 'Goerli',
    1337: 'Ganache',
    80001: 'Polygon Mumbai Testnet'
  }

  return networkNameByChainId[chainId] || chainId;
}

export { getNetworkNameByChainId };