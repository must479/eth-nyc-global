// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";

import {IUniswapV2Router02} from "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import {IERC20} from "@uniswap/v2-periphery/contracts/interfaces/IERC20.sol";
import {ISuperfluid, IInstantDistributionAgreementV1, IConstantFlowAgreementV1, StreamInDistributeOut, ISuperToken} from "./base/StreamInDistributeOut.sol";
import {IAggregationExecutor} from "./interfaces/IAggregationExecutor.sol";
import {IAggregationRouterV4} from "./interfaces/IAggregationRouterV4.sol";
import {AggregationExecutorMock} from "./mocks/AggregationExecutorMock.sol";
import {CommonErrors} from "./libraries/CommonErrors.sol";
import {KeeperCompatibleInterface} from "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";

/// @title Contract to Stream in, Swap, then Distribute out.
contract StreamSwapDistribute is
    StreamInDistributeOut,
    KeeperCompatibleInterface
{
    /// @dev 1inch V4 Router for swapping tokens
    IUniswapV2Router02 internal immutable _uniRouter;
    IAggregationRouterV4 internal immutable _router;
    uint256 private constant _SHOULD_CLAIM_FLAG = 0x04;
    // TODO: modify this
    address public immutable AGGREGATION_ROUTER_V4 =
        0xb2B99928F08539Fb21a7e605355208f681643D42;

    // Chainlink vars
    uint256 public interval;
    uint256 public lastTimeStamp;

    // Swap description
    struct SwapDescription {
        IERC20 srcToken;
        IERC20 dstToken;
        address payable srcReceiver;
        address payable dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
        bytes permit;
    }

    constructor(
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        IInstantDistributionAgreementV1 ida,
        ISuperToken inToken,
        ISuperToken outToken,
        IUniswapV2Router02 uniRouter,
        IAggregationRouterV4 router,
        uint256 updateInterval
    ) StreamInDistributeOut(host, cfa, ida, inToken, outToken) {
        _uniRouter = uniRouter;
        _router = router;

        // approve router to transfer the underlying `inToken` on behalf of this contract
        /* IERC20(inToken.getUnderlyingToken()).approve(
            address(router),
            type(uint256).max
        );
        console.log('here'); */

        // approve `outToken` to upgrade the underlying `outToken` on behalf of this contract.
        IERC20(outToken.getUnderlyingToken()).approve(
            address(outToken),
            type(uint256).max
        );

        // approve router to transfer the underlying `inToken` on behalf of this contract
        IERC20(inToken.getUnderlyingToken()).approve(
            address(uniRouter),
            type(uint256).max
        );

        // Update Chainlink
        interval = updateInterval;
        lastTimeStamp = block.timestamp;
    }

    /// @dev Before action callback. This swaps the `inToken` for the `outToken`, then returns the
    /// amount to distribute out in the `executeAction` function.
    /// @return distributionAmount amount to distribute after the callback.
    function _beforeDistribution()
        internal
        override
        returns (uint256 distributionAmount)
    {
        uint256 _receivedAmount;
        address _receiver = address(this);

        bool useUni = true;

        // Downgrade the full balance of the `_inToken`.
        _inToken.downgrade(_inToken.balanceOf(address(this)));

        // Get the underlying address of the `_inToken`.
        address inTokenUnderlying = _inToken.getUnderlyingToken();

        // Get the amount of `_inToken`s to swap
        uint256 amountIn = IERC20(inTokenUnderlying).balanceOf(address(this));

        if (useUni) {
            // Create the `path` of swaps for the Uniswap Router.
            address[] memory path = new address[](2);
            path[0] = inTokenUnderlying;
            path[1] = _outToken.getUnderlyingToken();

            // Swap the full balance of underlying `_inToken` for the underlying `_outToken`.
            // Set the deadline for 1 minute into the future.
            _uniRouter.swapExactTokensForTokens(
                amountIn,
                0,
                path,
                address(this),
                type(uint256).max
            );
        } else {
            // use 1inch
            SwapDescription memory swapData = SwapDescription({
                srcToken: IERC20(_inToken.getUnderlyingToken()),
                dstToken: IERC20(_outToken.getUnderlyingToken()),
                srcReceiver: payable(msg.sender),
                dstReceiver: payable(address(this)),
                amount: amountIn,
                minReturnAmount: 0,
                flags: 0x04,
                permit: ""
            });

            AggregationExecutorMock aggExec = new AggregationExecutorMock();

            bytes memory _data = abi.encode(
                IAggregationExecutor(aggExec),
                swapData,
                ""
            );

            // Get swap params
            (
                IAggregationExecutor _caller,
                IAggregationRouterV4.SwapDescription memory _swapDescription,
                bytes memory _tradeData
            ) = abi.decode(
                    _data,
                    (
                        IAggregationExecutor,
                        IAggregationRouterV4.SwapDescription,
                        bytes
                    )
                );

            // Check for incorrect swap information
            if (
                _swapDescription.dstReceiver != _receiver ||
                address(_swapDescription.srcToken) !=
                address(_inToken.getUnderlyingToken()) ||
                address(_swapDescription.dstToken) !=
                address(_outToken.getUnderlyingToken()) ||
                _swapDescription.amount != amountIn ||
                _swapDescription.flags != _SHOULD_CLAIM_FLAG
            ) revert CommonErrors.IncorrectSwapInformation();

            // Conduct swap
            (_receivedAmount, , ) = _router.swap(
                _caller,
                _swapDescription,
                _tradeData
            );
        }

        // Get the full balance of the underlying `_outToken`.
        // Implicitly return the `upgrade`d amount by the end of the function.
        distributionAmount = IERC20(_outToken.getUnderlyingToken()).balanceOf(
            address(this)
        );

        //Upgrade the full underlying `_outToken` balance.
        _outToken.upgrade(distributionAmount);
    }

    /// @dev Modify interval
    function modifyInterval(uint256 updateInterval_) public {
        updateInterval = updateInterval_;
    }

    /// @dev Checks upkeep
    /// @param checkData Check data
    /// @return upkeepNeeded Whether upkeep needed
    function checkUpkeep(bytes calldata checkData)
        public
        view
        override
        returns (
            bool upkeepNeeded,
            bytes memory /* performData */
        )
    {
        upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    /// @dev Performs upkeep
    /// @param performData Perform data
    function performUpkeep(
        bytes calldata performData /* performData */
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep(performData);
        require(upkeepNeeded, "Time interval not met");
        lastTimeStamp = block.timestamp;
        executeAction();
    }
}
