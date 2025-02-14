import { Trans } from '@lingui/macro';

import { Link } from '../primitives/Link';
import { TextWithTooltip } from '../TextWithTooltip';

export const EthenaAirdropTooltip = () => {
  return (
    <TextWithTooltip
      wrapperProps={{ ml: 2 }}
      color="warning.main"
      iconSize={20}
      icon={<image href="/icons/other/ethena.svg" width={25} height={25} />}
    >
      <>
        <Trans>
          {`This asset is eligible for Sats. Aave Labs does not
          guarantee the program and accepts no liability.\n`}
        </Trans>
        <br />
        <br />
        <Trans>{'Learn more about Ethena Stats program'}</Trans>{' '}
        <Link
          href="https://app.ethena.fi/liquidity"
          sx={{ textDecoration: 'underline' }}
          variant="caption"
          color="text.secondary"
        >
          {'here'}
        </Link>
        {'.'}
      </>
    </TextWithTooltip>
  );
};
