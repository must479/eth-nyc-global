// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/// @title Common Errors
library CommonErrors {
    error ZeroAddress();
    error NotAuthorized();
    error ZeroAmount();
    error ZeroSlippage();
    error IncorrectSwapInformation();
}
