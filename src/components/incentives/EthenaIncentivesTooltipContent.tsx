import { AaveV3Ethereum, AaveV3EthereumLido } from '@bgd-labs/aave-address-book';
import { Trans } from '@lingui/macro';
import { Box } from '@mui/material';

import { Link } from '../primitives/Link';

export const EthenaAirdropTooltipContent = ({
  points,
  rewardedAsset,
}: {
  points: number;
  rewardedAsset?: string;
}) => {
  return (
    <Box>
      <Trans>
        {`This asset is eligible for ${(<b>{points}x</b>)} Ethena Rewards`}
        {rewardedAsset &&
        (rewardedAsset === AaveV3Ethereum.ASSETS.GHO.V_TOKEN ||
          rewardedAsset === AaveV3EthereumLido.ASSETS.GHO.V_TOKEN)
          ? ' if you have USDe or sUSDe in collateral'
          : ''}
        {`.\n`}
      </Trans>
      <br />
      <Trans>{'Learn more about Ethena Rewards program'}</Trans>{' '}
      <Link
        href="https://app.ethena.fi/join"
        sx={{ textDecoration: 'underline' }}
        variant="caption"
        color="text.secondary"
      >
        {'here'}
      </Link>
      {'.'}
      <br />
      <br />
      <Trans>
        {`Aave Labs does not
          guarantee the program and accepts no liability.\n`}
      </Trans>
    </Box>
  );
};
