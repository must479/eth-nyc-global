// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IAggregationExecutor} from "../interfaces/IAggregationExecutor.sol";

/// @title Mocks AggregationExecutor
contract AggregationExecutorMock is IAggregationExecutor {
    // fakes a swap
    function callBytes(address msgSender, bytes calldata data)
        external
        payable
    {
        return;
    }
}
