// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20Mock} from "./ERC20Mock.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IAggregationExecutor} from "../interfaces/IAggregationExecutor.sol";
import {IAggregationRouterV4} from "../interfaces/IAggregationRouterV4.sol";

contract AggregationRouterMock {
    struct SwapDescription {
        ERC20 srcToken;
        ERC20 dstToken;
        address payable srcReceiver;
        address payable dstReceiver;
        uint256 amount;
        uint256 minReturnAmount;
        uint256 flags;
        bytes permit;
    }

    // fakes a swap, mints the outToken to the receiver
    function swap(bytes calldata _data)
        public
        returns (
            uint256 returnAmount,
            uint256 spentAmount,
            uint256 gasLeft
        )
    {
        uint256 amountIn = 1;
        // Get swap params
        (
            IAggregationExecutor _caller,
            IAggregationRouterV4.SwapDescription memory _swapDescription,
            bytes memory _tradeData
        ) = abi.decode(
                _data[4:],
                (
                    IAggregationExecutor,
                    IAggregationRouterV4.SwapDescription,
                    bytes
                )
            );
        ERC20Mock(address(_swapDescription.srcToken)).transferFrom(
            msg.sender,
            address(this),
            amountIn
        );
        ERC20Mock(address(_swapDescription.dstToken)).mint(
            _swapDescription.dstReceiver,
            amountIn
        );
        return (0, 0, 0);
    }
}
