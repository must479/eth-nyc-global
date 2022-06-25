// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {IAggregationExecutor} from "../interfaces/IAggregationExecutor.sol";

contract AggregationExecutorMock is IAggregationExecutor {
    // fakes a swap, mints the outToken to the receiver
    function callBytes(address msgSender, bytes calldata data)
        external
        payable
    {
        return;
    }
}
