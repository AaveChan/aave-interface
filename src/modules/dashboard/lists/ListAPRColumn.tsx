import { ReserveIncentiveResponse } from '@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives';
import { Box } from '@mui/material';
import { ReactNode } from 'react';
import { MeritIncentivesButton } from 'src/components/incentives/IncentivesButton';
import { CustomMarket } from 'src/ui-config/marketsConfig';
import { Side } from 'src/utils/utils';

import { IncentivesCard } from '../../../components/incentives/IncentivesCard';
import { ListColumn } from '../../../components/lists/ListColumn';

interface ListAPRColumnProps {
  value: number;
  market: CustomMarket;
  incentives?: ReserveIncentiveResponse[];
  symbol: string;
  tooltip?: ReactNode;
  children?: ReactNode;
}

export const ListAPRColumn = ({
  value,
  market,
  incentives,
  symbol,
  tooltip,
  children,
}: ListAPRColumnProps) => {
  return (
    <ListColumn>
      <Box sx={{ display: 'flex column' }}>
        <IncentivesCard value={value} incentives={incentives} symbol={symbol} />
        <MeritIncentivesButton symbol={symbol} market={market} side={Side.SUPPLY} />
        {tooltip}
      </Box>
      {children}
    </ListColumn>
  );
};
