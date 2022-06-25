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
    function swap(
        IAggregationExecutor caller,
        SwapDescription calldata desc,
        bytes calldata data
    )
        public
        returns (
            uint256 returnAmount,
            uint256 spentAmount,
            uint256 gasLeft
        )
    {
        ERC20Mock(address(desc.srcToken)).transferFrom(
            msg.sender,
            address(this),
            desc.amount
        );
        ERC20Mock(address(desc.dstToken)).mint(desc.dstReceiver, desc.amount);
        return (0, 0, 0);
    }
}
