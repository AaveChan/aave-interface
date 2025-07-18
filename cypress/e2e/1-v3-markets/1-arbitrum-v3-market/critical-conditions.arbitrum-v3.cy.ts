import { RequestedTokens, tokenSet } from 'cypress/support/helpers/token.helper';

import assets from '../../../fixtures/assets.json';
import constants from '../../../fixtures/constans.json';
import { skipState } from '../../../support/steps/common';
import { configEnvWithTenderlyArbitrumFork } from '../../../support/steps/configuration.steps';
import { borrow, supply, withdraw } from '../../../support/steps/main.steps';
import { checkDashboardHealthFactor } from '../../../support/steps/verification.steps';

const tokensToRequest: RequestedTokens = {
  aETHArbitrumV3: 1,
};

const testData = {
  testCases: {
    borrow: {
      asset: assets.arbitrumMarket.ETH,
      amount: 1,
      apyType: constants.borrowAPYType.default,
      hasApproval: false,
      isRisk: true,
    },
    deposit2: {
      asset: assets.arbitrumMarket.ETH,
      amount: 1,
      hasApproval: true,
    },
    withdraw: {
      asset: assets.arbitrumMarket.ETH,
      isCollateral: true,
      amount: 9999,
      hasApproval: false,
      isRisk: true,
      isMaxAmount: true,
    },
  },
};

describe('CRITICAL CONDITIONS SPEC, ARBITRUM V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyArbitrumFork({
    v3: true,
    tokens: tokenSet(tokensToRequest),
  });
  borrow(testData.testCases.borrow, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.11 }, skipTestState);
  supply(testData.testCases.deposit2, skipTestState, true);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 200 }, skipTestState);
  withdraw(testData.testCases.withdraw, skipTestState, false);
  checkDashboardHealthFactor({ valueFrom: 1.0, valueTo: 1.11 }, skipTestState);
});
