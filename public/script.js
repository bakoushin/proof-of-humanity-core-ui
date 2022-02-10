'use strict';

import coreABI from './core-abi.js';
import { getNetworkNameByChainId } from './utils.js';

document.addEventListener('DOMContentLoaded', () => {
  const connectWallet = document.getElementById('connect-wallet');
  const connectWalletButton = document.getElementById('connect-wallet-button');
  const walletAddress = document.getElementById('wallet-address');
  const walletAddressLabel = document.getElementById('wallet-address-label');

  const main = document.getElementById('main');
  const ownerTools = document.getElementById('owner-tools');

  const chainError = document.getElementById('chain-error');
  const chain = document.getElementById('chain');
  const chainId = chain.textContent.trim();
  chain.textContent = getNetworkNameByChainId(chainId); 

  const addDelegate = document.getElementById('add-delegate');
  const delegateAddress = document.getElementById('delegate-address');
  const addDelegateError = document.getElementById('add-delegate-error');
  const addDelegateSuccess = document.getElementById('add-delegate-success');
  const addDelegateSuccessAddress = document.getElementById(
    'add-delegate-success-address'
  );
  const addDelegateSpinner = document.getElementById('add-delegate-spinner');

  const verifyProof = document.getElementById('verify-proof');
  const verifyProofInput = document.getElementById('verify-proof-input');
  const verifyProofSuccess = document.getElementById('verify-proof-success');
  const verifyProofError = document.getElementById('verify-proof-error');
  const verifyProofSuccessMessage = document.getElementById(
    'verify-proof-success-message'
  );
  const verifySpinner = document.getElementById('verify-spinner');

  const coreAddress = document
    .getElementById('core-address')
    .textContent.trim();
  const coreOwner = document.getElementById('core-owner').textContent.trim();

  let coreContract;
  let address;

  connectWalletButton.addEventListener('click', async () => {
    try {
      await ethereum.request({ method: 'eth_requestAccounts' });
      window.web3 = new Web3(window.ethereum);

      const accounts = await web3.eth.getAccounts();
      address = accounts[0];

      coreContract = new web3.eth.Contract(coreABI, coreAddress);

      if (chainId && chainId !== (await web3.eth.getChainId()).toString()) {
        chainError.classList.remove('hidden');
      }
            
      walletAddress.textContent = address;
      if (coreOwner.toLowerCase() === address.toLowerCase()) {
        walletAddressLabel.textContent = 'Owner';
        walletAddressLabel.classList.remove('hidden');
        ownerTools.classList.remove('hidden');
      }
      connectWallet.classList.add('hidden');
      main.classList.remove('hidden');
    } catch (error) {
      console.error(error);
    }
  });

  addDelegate.addEventListener('submit', async (event) => {
    event.preventDefault();

    addDelegateSuccessAddress.textContent = null;
    addDelegateSuccess.classList.add('hidden');

    const delegate = delegateAddress.value.trim();

    if (!delegate) {
      return;
    }

    addDelegateSpinner.classList.remove('hidden');
    addDelegateError.textContent = null;

    try {
      coreContract.once(
        'EvidenceDelegateAdded',
        { filter: { evidenceDelegate: delegate } },
        (error, event) => {
          if (error) {
            console.error(error);
            return;
          }
          const evidenceDelegate = event?.returnValues?.evidenceDelegate;
          if (evidenceDelegate !== delegate) {
            return;
          }
        }
      );

      await coreContract.methods
        .addEvidenceDelegate(delegate)
        .send({ from: address });

      delegateAddress.value = '';

      addDelegateSuccessAddress.textContent = delegate;
      addDelegateSuccess.classList.remove('hidden');
      addDelegateSpinner.classList.add('hidden');
    } catch (error) {
      console.error(error);
      addDelegateError.textContent = 'Error';
    }
  });

  verifyProof.addEventListener('submit', async (event) => {
    event.preventDefault();

    const inputToVerify = verifyProofInput.value.trim();

    if (!inputToVerify) {
      return;
    }

    const addressMatch = /^0x[a-fA-F0-9]{40}$/;
    const transactionHashMatch = /^0x([A-Fa-f0-9]{64})$/;
    
    const isAddress = addressMatch.test(inputToVerify);
    const isTransaction = transactionHashMatch.test(inputToVerify);

    if (!isAddress && !isTransaction) {
      verifyProofError.textContent = 'Invalid input';
      verifySpinner.classList.add('hidden');
      return;
    }

    verifyProofSuccess.classList.add('hidden');
    verifySpinner.classList.remove('hidden');
    verifyProofSuccessMessage.textContent = null;
    verifyProofError.textContent = null;

    try {
      let addressToVerify = inputToVerify;

      if (isTransaction) {
        const tx = await web3.eth.getTransaction(inputToVerify);
        if (!tx) {
          verifyProofError.textContent = 'Transaction not found';
          verifySpinner.classList.add('hidden');
          return;
        }
        addressToVerify = tx.from;
      }

      const { agent, delegate, evidence, timestamp } =
        await coreContract.methods
          .proofOfHumanity(addressToVerify)
          .call({ from: address });

      if (!evidence) {
        verifyProofError.textContent = 'Proof-of-humanity not found';
        verifySpinner.classList.add('hidden');
        return;
      }

      const isAddressValid =
        addressToVerify.toLowerCase() === agent.toLowerCase();

      const evidenceBytes = web3.utils.hexToBytes(evidence);
      const R = evidenceBytes.slice(0, 32);
      const agentSignature = evidenceBytes.slice(32, 97);
      const delegateSignature = evidenceBytes.slice(97);

      const verifiedAgent = await web3.eth.personal.ecRecover(
        web3.utils.bytesToHex(R),
        web3.utils.bytesToHex(agentSignature)
      );
      const isAgentValid = verifiedAgent.toLowerCase() === agent.toLowerCase();

      const hash = web3.utils.keccak256(
        web3.utils.bytesToHex([
          ...R,
          ...web3.utils.hexToBytes(agent),
          ...web3.utils.hexToBytes(timestamp),
          ...agentSignature
        ])
      );

      const verifiedDelegate = await web3.eth.personal.ecRecover(
        hash,
        web3.utils.bytesToHex(delegateSignature)
      );

      const isDelegateValid =
        verifiedDelegate.toLowerCase() === delegate.toLowerCase();

      const dateString = new Date(parseInt(timestamp, 16)).toISOString();

      const successMessage = isTransaction ? 
        `Humanity of transaction sender proven ${dateString}` :
        `Humanity proven ${dateString}`;

      if (isAddressValid && isAgentValid && isDelegateValid) {
        verifyProofSuccessMessage.textContent = successMessage;
        verifyProofSuccess.classList.remove('hidden');
        verifyProofError.textContent = null;
      } else {
        verifyProofError.textContent = 'Invalid proof-of-humanity';
        verifyProofSuccessMessage.textContent = null;
        verifyProofSuccess.classList.add('hidden');
      }

      verifySpinner.classList.add('hidden');

    } catch (error) {
      console.error(error);
      verifyProofError.textContent = 'Error';
    }
  });
});
