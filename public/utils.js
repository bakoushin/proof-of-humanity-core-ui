function getNetworkNameByChainId (chainId) {
  const networkNameByChainId = {
    1: 'Mainnet',
    3: 'Ropsten',
    4: 'Rinkeby',
    5: 'Goerli',
    1337: 'Ganache'
  }

  return networkNameByChainId[chainId] || chainId;
}

export { getNetworkNameByChainId };