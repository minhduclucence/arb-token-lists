import { providers } from 'ethers';
import dotenv from 'dotenv';
import { getL2Network, MultiCaller } from '@arbitrum/sdk';
import { getArgvs } from './options';

dotenv.config();

export const getNetworkConfig = async () => {
  const argv = getArgvs();
  const networkID = argv.l2NetworkID;
  console.log('Using L2 networkID:', networkID);

  const l2Rpc = (() => {
    if (networkID === 42161) return 'https://arb1.arbitrum.io/rpc';
    else if (networkID === 421611) return 'https://rinkeby.arbitrum.io/rpc';
    else if (networkID === 42170) return 'https://nova.arbitrum.io/rpc';
    else if (networkID === 421613)
      return 'https://goerli-rollup.arbitrum.io/rpc';
    throw new Error('No L2 RPC detected');
  })();
  const arbProvider = new providers.JsonRpcProvider(l2Rpc);
  const l2Network = await getL2Network(arbProvider);

  const expectedEnv = (() => {
    if (l2Network.partnerChainID === 1) return 'MAINNET_RPC';
    else if (l2Network.partnerChainID === 4) return 'RINKEBY_RPC';
    else if (l2Network.partnerChainID === 5) return 'GOERLI_RPC';
    throw new Error('No L1 RPC detected');
  })();
  const l1Rpc = process.env[expectedEnv];
  if (!l1Rpc) throw new Error(`Please set ${expectedEnv}`);

  const ethProvider = new providers.JsonRpcProvider(l1Rpc);

  const l1MultiCaller = await MultiCaller.fromProvider(ethProvider);
  const l2MultiCaller = await MultiCaller.fromProvider(arbProvider);

  return {
    l1: {
      provider: ethProvider,
      multiCaller: l1MultiCaller,
    },
    l2: {
      network: l2Network,
      provider: arbProvider,
      multiCaller: l2MultiCaller,
    },
  };
};
