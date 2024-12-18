import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
 polygon,
  holesky
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Stake app',
  projectId: 'YOUR_PROJECT_ID',
  chains: [
    holesky,
polygon
  ],
  ssr: true,
});