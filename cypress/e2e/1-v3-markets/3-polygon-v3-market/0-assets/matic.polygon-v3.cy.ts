import assets from '../../../../fixtures/assets.json';
import constants from '../../../../fixtures/constans.json';
import { skipState } from '../../../../support/steps/common';
import { configEnvWithTenderlyPolygonFork } from '../../../../support/steps/configuration.steps';
import {
  borrow,
  changeCollateral,
  changeCollateralNegative,
  repay,
  supply,
  withdraw,
} from '../../../../support/steps/main.steps';
import {
  borrowsUnavailable,
  dashboardAssetValuesVerification,
} from '../../../../support/steps/verification.steps';

const testData = {
  testCases: {
    deposit: {
      asset: assets.polygonV3Market.POL,
      amount: 1.09,
      hasApproval: true,
    },
    collateral: {
      switchOff: {
        asset: assets.polygonV3Market.POL,
        isCollateralType: true,
        hasApproval: true,
      },
      switchOn: {
        asset: assets.polygonV3Market.POL,
        isCollateralType: false,
        hasApproval: true,
      },
      switchNegative: {
        asset: assets.polygonV3Market.POL,
        isCollateralType: true,
      },
    },
    borrow: [
      {
        asset: assets.polygonV3Market.POL,
        amount: 0.06,
        apyType: constants.borrowAPYType.default,
        hasApproval: false,
      },
    ],
    withdraw: [
      {
        asset: assets.polygonV3Market.POL,
        isCollateral: true,
        amount: 0.01,
        hasApproval: false,
      },
      {
        asset: assets.polygonV3Market.POL,
        isCollateral: true,
        amount: 0.01,
        hasApproval: true,
        forWrapped: true,
      },
    ],
    repay: [
      {
        asset: assets.polygonV3Market.POL,
        apyType: constants.apyType.variable,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.polygonV3Market.POL,
        apyType: constants.apyType.variable,
        repayableAsset: assets.polygonV3Market.WPOL,
        amount: 0.01,
        hasApproval: false,
        repayOption: constants.repayType.default,
      },
      {
        asset: assets.polygonV3Market.POL,
        apyType: constants.apyType.variable,
        repayableAsset: assets.polygonV3Market.aWPOL,
        amount: 0.01,
        hasApproval: true,
        repayOption: constants.repayType.default,
      },
    ],
  },
  verifications: {
    finalDashboard: [
      {
        type: constants.dashboardTypes.deposit,
        assetName: assets.polygonV3Market.POL.shortName,
        amount: 1.06,
        collateralType: constants.collateralType.isCollateral,
        isCollateral: true,
      },
      {
        type: constants.dashboardTypes.borrow,
        assetName: assets.polygonV3Market.POL.shortName,
        amount: 0.03,
        apyType: constants.borrowAPYType.variable,
      },
    ],
  },
};
//due frozen Matic
describe('MATIC INTEGRATION SPEC, POLYGON V3 MARKET', () => {
  const skipTestState = skipState(false);
  configEnvWithTenderlyPolygonFork({ market: 'fork_proto_polygon_v3', v3: true });

  supply(testData.testCases.deposit, skipTestState, true);
  describe('Check Collateral switching', () => {
    changeCollateral(testData.testCases.collateral.switchOff, skipTestState, false);
    borrowsUnavailable(skipTestState);
    changeCollateral(testData.testCases.collateral.switchOn, skipTestState, false);
  });
  testData.testCases.borrow.forEach((borrowCase) => {
    borrow(borrowCase, skipTestState, true);
  });
  changeCollateralNegative(testData.testCases.collateral.switchNegative, skipTestState, false);
  testData.testCases.withdraw.forEach((withdrawCase) => {
    withdraw(withdrawCase, skipTestState, false);
  });
  testData.testCases.repay.forEach((repayCase) => {
    repay(repayCase, skipTestState, false);
  });
  dashboardAssetValuesVerification(testData.verifications.finalDashboard, skipTestState);
});
