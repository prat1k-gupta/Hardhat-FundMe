//SPDX-License-Identifier: MIT

pragma solidity 0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol"; 

library PriceConverter{

    function getPrice(AggregatorV3Interface priceFeed) internal view returns (uint256) {
        //chains: rinkeby, goerli 
        //we need dynamic priceFeed address for different networks 
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        (
            /*uint80 roundID*/,
            int256 price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return uint256(price) * 1e10;
    }

    function getConversionRate(uint256 ethAmount,AggregatorV3Interface priceFeed) internal view returns(uint256) {
        uint256 latestPrice = getPrice(priceFeed); 
        return (ethAmount*latestPrice)/ 1e18; 
    }

}