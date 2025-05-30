import { DelegationType } from '@aave/contract-helpers';
import { t, Trans } from '@lingui/macro';
import { FormControl, TextField, Typography } from '@mui/material';
import { constants, utils } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';
import { useEffect, useState } from 'react';
import { TextWithTooltip } from 'src/components/TextWithTooltip';
import { useGovernanceTokens } from 'src/hooks/governance/useGovernanceTokens';
import { usePowers } from 'src/hooks/governance/usePowers';
import { ModalType, useModalContext } from 'src/hooks/useModal';
import { useWeb3Context } from 'src/libs/hooks/useWeb3Context';
import { useRootStore } from 'src/store/root';
import { governanceV3Config } from 'src/ui-config/governanceConfig';
import { GENERAL } from 'src/utils/events';
import { getNetworkConfig } from 'src/utils/marketsAndNetworksConfig';

import { TxErrorView } from '../FlowCommons/Error';
import { GasEstimationError } from '../FlowCommons/GasEstimationError';
import { TxSuccessView } from '../FlowCommons/Success';
import { TxModalTitle } from '../FlowCommons/TxModalTitle';
import { GasStation } from '../GasStation/GasStation';
import { ChangeNetworkWarning } from '../Warnings/ChangeNetworkWarning';
import { DelegationTokenSelector, DelegationTokenType } from './DelegationTokenSelector';
import { DelegationTypeSelector } from './DelegationTypeSelector';
import { GovDelegationActions } from './GovDelegationActions';

export interface Asset {
  symbol: string;
  icon: string;
  value: number;
  address: string;
}

export enum ErrorType {
  NOT_ENOUGH_BALANCE,
  NOT_AN_ADDRESS,
}

type GovDelegationModalContentProps = {
  type: ModalType.RevokeGovDelegation | ModalType.GovDelegation;
};

export const GovDelegationModalContent: React.FC<GovDelegationModalContentProps> = ({ type }) => {
  const { chainId: connectedChainId, readOnlyModeAddress, currentAccount } = useWeb3Context();
  const { gasLimit, mainTxState: txState, txError } = useModalContext();
  const currentNetworkConfig = useRootStore((store) => store.currentNetworkConfig);
  const currentChainId = useRootStore((store) => store.currentChainId);
  const {
    data: { aave, stkAave, aAave },
  } = useGovernanceTokens();
  const { data: powers, refetch } = usePowers();
  // error states

  // selector states
  const [delegationTokenType, setDelegationTokenType] = useState(DelegationTokenType.ALL);
  const [delegationType, setDelegationType] = useState(DelegationType.ALL);
  const [delegate, setDelegate] = useState('');

  const isRevokeModal = type === ModalType.RevokeGovDelegation;

  const onlyOnePowerToRevoke =
    isRevokeModal &&
    !!powers &&
    ((powers.aaveVotingDelegatee === constants.AddressZero &&
      powers.stkAaveVotingDelegatee === constants.AddressZero) ||
      (powers.aavePropositionDelegatee === constants.AddressZero &&
        powers.stkAavePropositionDelegatee === constants.AddressZero));

  useEffect(() => {
    if (onlyOnePowerToRevoke) {
      if (
        powers.aaveVotingDelegatee === constants.AddressZero &&
        powers.stkAaveVotingDelegatee === constants.AddressZero
      )
        setDelegationType(DelegationType.PROPOSITION);
      else setDelegationType(DelegationType.VOTING);
    }
  }, [onlyOnePowerToRevoke, powers]);

  useEffect(() => {
    setDelegate(isRevokeModal ? currentAccount : '');
  }, [isRevokeModal, setDelegate, currentAccount]);

  const tokens = [
    {
      address: governanceV3Config.votingAssets.stkAaveTokenAddress,
      symbol: 'stkAAVE',
      name: 'Staked AAVE',
      amount: stkAave,
      votingDelegatee: powers?.stkAaveVotingDelegatee,
      propositionDelegatee: powers?.stkAavePropositionDelegatee,
      type: DelegationTokenType.STKAAVE,
    },
    {
      address: governanceV3Config.votingAssets.aaveTokenAddress,
      symbol: 'AAVE',
      name: 'AAVE',
      amount: aave,
      votingDelegatee: powers?.aaveVotingDelegatee,
      propositionDelegatee: powers?.aavePropositionDelegatee,
      type: DelegationTokenType.AAVE,
    },
    {
      address: governanceV3Config.votingAssets.aAaveTokenAddress,
      symbol: 'aAAVE',
      name: 'aAAVE',
      amount: aAave,
      votingDelegatee: powers?.aAaveVotingDelegatee,
      propositionDelegatee: powers?.aAavePropositionDelegatee,
      type: DelegationTokenType.aAave,
    },
  ];

  // handle delegate address errors
  let delegateAddressBlockingError: ErrorType | undefined = undefined;
  if (delegate !== '' && !utils.isAddress(delegate)) {
    delegateAddressBlockingError = ErrorType.NOT_AN_ADDRESS;
  }

  // render error messages
  const handleDelegateAddressError = () => {
    switch (delegateAddressBlockingError) {
      case ErrorType.NOT_AN_ADDRESS:
        return (
          // TODO: fix text
          <Trans>Not a valid address</Trans>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (txState.success) refetch();
  }, [txState.success, refetch]);

  // is Network mismatched
  const govChain =
    currentNetworkConfig.isFork &&
    currentNetworkConfig.underlyingChainId === governanceV3Config.coreChainId
      ? currentChainId
      : governanceV3Config.coreChainId;
  const isWrongNetwork = connectedChainId !== govChain;

  const networkConfig = getNetworkConfig(govChain);

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />;
  }
  if (txState.success)
    return <TxSuccessView action={<Trans>{isRevokeModal ? 'Revoke' : 'Delegation'}</Trans>} />;
  return (
    <>
      <TxModalTitle title={isRevokeModal ? 'Revoke power' : 'Set up delegation'} />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning networkName={networkConfig.name} chainId={govChain} />
      )}
      {(isRevokeModal &&
        !!powers &&
        ((powers.aaveVotingDelegatee === constants.AddressZero &&
          powers.stkAaveVotingDelegatee === constants.AddressZero) ||
          (powers.aavePropositionDelegatee === constants.AddressZero &&
            powers.stkAavePropositionDelegatee === constants.AddressZero))) || (
        <>
          <Typography variant="description" color="text.secondary" sx={{ mb: 1 }}>
            <Trans>{isRevokeModal ? 'Power to revoke' : 'Power to delegate'}</Trans>
          </Typography>
          <DelegationTypeSelector
            delegationType={delegationType}
            setDelegationType={setDelegationType}
          />
        </>
      )}

      {isRevokeModal ? (
        <Typography variant="description" color="text.secondary" sx={{ mt: 6, mb: 2 }}>
          <Trans>Balance to revoke</Trans>
        </Typography>
      ) : (
        <TextWithTooltip
          text="Balance to delegate"
          variant="description"
          textColor="text.secondary"
          wrapperProps={{ mt: 6, mb: 2 }}
          event={{
            eventName: GENERAL.TOOL_TIP,
            eventParams: {
              tooltip: 'Balance to delegate',
              funnel: 'Governance Delegation',
            },
          }}
        >
          <Trans>
            Choose how much voting/proposition power to give to someone else by delegating some of
            your AAVE, stkAAVE or aAave balance. Your tokens will remain in your account, but your
            delegate will be able to vote or propose on your behalf. If your AAVE, stkAAVE or aAave
            balance changes, your delegate&apos;s voting/proposition power will be automatically
            adjusted.
          </Trans>
        </TextWithTooltip>
      )}

      <DelegationTokenSelector
        setDelegationTokenType={setDelegationTokenType}
        delegationTokenType={delegationTokenType}
        delegationTokens={tokens}
        delegationType={delegationType}
        filter={isRevokeModal}
      />
      {!isRevokeModal && (
        <>
          <Typography variant="description" color="text.secondary" mb={1}>
            <Trans>Recipient address</Trans>
          </Typography>
          <FormControl
            error={delegateAddressBlockingError !== undefined}
            variant="standard"
            fullWidth
          >
            <TextField
              variant="outlined"
              fullWidth
              value={delegate}
              onChange={(e) => setDelegate(e.target.value)}
              placeholder={t`Enter ETH address`}
              error={delegateAddressBlockingError !== undefined}
              helperText={handleDelegateAddressError()}
              data-cy={`delegationAddress`}
            />
          </FormControl>
        </>
      )}
      <GasStation
        gasLimit={parseUnits(gasLimit || '0', 'wei')}
        chainId={governanceV3Config.coreChainId}
      />

      {txError && <GasEstimationError txError={txError} />}

      <GovDelegationActions
        delegationType={delegationType}
        delegationTokenType={delegationTokenType}
        delegatee={delegate}
        isWrongNetwork={isWrongNetwork}
        blocked={delegateAddressBlockingError !== undefined || delegate === ''}
        isRevoke={isRevokeModal}
      />
    </>
  );
};
