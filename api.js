import express from 'express';
import ethers from 'ethers';
import { providerURL, coreAddress } from './config.js';
import coreABI from './core-abi.js';

const provider = new ethers.providers.JsonRpcProvider(providerURL);
const coreContract = new ethers.Contract(coreAddress, coreABI, provider);

const api = express.Router();

const methodNotAllowed = (req, res) => {
  res.sendStatus(405);
};

api
  .route('/verify-address/:address')
  .get(async (req, res, next) => {
    try {
      const { address } = req.params;

      const { agent, delegate, evidence, timestamp } =
        await coreContract.proofOfHumanity(address);

      console.log({ agent, delegate, evidence, timestamp });

      // Check wether the evidence is empty.
      if (!ethers.utils.hexDataLength(evidence)) {
        res.json({
          result: false,
          timestamp: null
        });
        return;
      }

      const isAddressValid = address.toLowerCase() === agent.toLowerCase();

      const R = ethers.utils.hexDataSlice(evidence, 0, 32);
      const agentSignature = ethers.utils.hexDataSlice(evidence, 32, 97);
      const delegateSignature = ethers.utils.hexDataSlice(evidence, 97);

      const verifiedAgent = ethers.utils.verifyMessage(
        ethers.utils.arrayify(R),
        agentSignature
      );
      const isAgentValid = verifiedAgent.toLowerCase() === agent.toLowerCase();

      const hash = ethers.utils.keccak256(
        ethers.utils.hexConcat([R, agent, timestamp, agentSignature])
      );

      const verifiedDelegate = ethers.utils.verifyMessage(
        ethers.utils.arrayify(hash),
        delegateSignature
      );

      const isDelegateValid =
        verifiedDelegate.toLowerCase() === delegate.toLowerCase();

      const result = isAddressValid && isAgentValid && isDelegateValid;

      res.json({
        result,
        timestamp: result
          ? new Date(parseInt(timestamp, 16)).toISOString()
          : null
      });
    } catch (error) {
      next(error);
    }
  })
  .all(methodNotAllowed);

api
  .route('/verify-transaction/:transactionHash')
  .get(async (req, res, next) => {
    try {
      let error = false;

      const { transactionHash } = req.params;

      let transaction = null;
      try {
        transaction = await provider.getTransaction(transactionHash);
      } catch (err) {
        error = err.reason;
      }

      if (!transaction) {
        error = error || 'Transaction not found';
      }

      if (error) {
        res.json({
          error,
          result: false,
          address: null,
          timestamp: null
        });
        return;
      }

      const address = transaction.from;

      const { agent, delegate, evidence, timestamp } =
        await coreContract.proofOfHumanity(address);

      console.log({ agent, delegate, evidence, timestamp });

      // Check wether the evidence is empty.
      if (!ethers.utils.hexDataLength(evidence)) {
        res.json({
          error,
          result: false,
          address,
          timestamp: null
        });
        return;
      }

      const isAddressValid = address.toLowerCase() === agent.toLowerCase();

      const R = ethers.utils.hexDataSlice(evidence, 0, 32);
      const agentSignature = ethers.utils.hexDataSlice(evidence, 32, 97);
      const delegateSignature = ethers.utils.hexDataSlice(evidence, 97);

      const verifiedAgent = ethers.utils.verifyMessage(
        ethers.utils.arrayify(R),
        agentSignature
      );
      const isAgentValid = verifiedAgent.toLowerCase() === agent.toLowerCase();

      const hash = ethers.utils.keccak256(
        ethers.utils.hexConcat([R, agent, timestamp, agentSignature])
      );

      const verifiedDelegate = ethers.utils.verifyMessage(
        ethers.utils.arrayify(hash),
        delegateSignature
      );

      const isDelegateValid =
        verifiedDelegate.toLowerCase() === delegate.toLowerCase();

      const result = isAddressValid && isAgentValid && isDelegateValid;

      res.json({
        error,
        result,
        address,
        timestamp: result
          ? new Date(parseInt(timestamp, 16)).toISOString()
          : null
      });
    } catch (error) {
      next(error);
    }
  })
  .all(methodNotAllowed);

export default api;
