//SPDX-License-Identifier: MIT

pragma solidity ^0.8.8; 

//To Do 
//Get funds from users 
//withdraw funds 
//set a minimum funding value in USD


import "./PriceConverter.sol";
contract FundMe{
    
    address private immutable i_owner; 

    AggregatorV3Interface private s_priceFeed; 
    // we gonna pass priceFeed to the constructor

    using PriceConverter for uint256; 
    
    uint256 public constant MINIMUM_USD = 50 * 1e18; 
    //address is a data type
    address[] private s_funders; 

    mapping(address => uint256) private s_addressToAmount; 

    //it's like middleware 
    modifier onlyOwner{ 
        require(i_owner == msg.sender, "fuck off , baap ko bulake lao"); 
        _; 
    }

    constructor(address s_priceFeedAddress) { 
        i_owner = msg.sender; 
        s_priceFeed = AggregatorV3Interface(s_priceFeedAddress); 
    }


    receive() external payable{
        fund();  
    }

    //if the calldata not find the appropriate function we access the fall back function 
    fallback() external payable{
        fund(); 
    }

    //payable means you need to also send some value 
    function fund() public payable{
        //want to be able to set a minimum fund amount 
        // 1. How do we send Eth to this contract 
        //msg.value is in WEI that is 10^18 wei == 1 eth
        require(msg.value.getConversionRate(s_priceFeed) > MINIMUM_USD, "Didn't send enough!");
        s_funders.push(msg.sender);
        s_addressToAmount[msg.sender] = msg.value; 
        //1e18 is 10^18 in wei that is 1 ethereum 
        //if the value didn't met the condition then it will revert and undo any changes 
        //that happened in contract 

        // function getConversionRate() public {}

    }

    function withdraw() public payable onlyOwner {
        //we will reset the mapping
        for(uint256 funderIndex = 0; funderIndex<s_funders.length ; funderIndex++){
            address funder = s_funders[funderIndex]; 
            s_addressToAmount[funder] = 0;
        }

        //Now we will reset the Array 
        s_funders = new address[](0); 

        //withdraw fund from contract 
        //transfer directly revert back 
        //send return bool
        //call return bool and value
        
        //we typecasted msg.sender from address to payable address so that we can transfer the fund
        // payable(msg.sender).transfer(address(this).balance); 

        // //send function 
        // //(this).balance returns the balance of current contract that is FundMe contract
        // bool sendSuccess = payable(msg.sender).send(address(this).balance); 
        // require(sendSuccess,"Transfer Failed");

        //call function
        (bool sendSuccess, /*bytes memory dataReturned*/) = payable(msg.sender).call{value: address(this).balance}(""); 
        require(sendSuccess,"Transfer Failed");
    }

    function cheaperWithdraw() public payable onlyOwner{
        address[] memory funders = s_funders; 
        for(uint256 fundersIndex = 0; fundersIndex<funders.length; fundersIndex++){
            s_addressToAmount[funders[fundersIndex]] = 0; 
        }
        s_funders = new address[](0);

        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }  

    //function to get owner
    function getOwner() public view returns(address){
        return i_owner; 
    }
    //function to get funders

    function getFunders(uint256 index) public view returns(address){
        return s_funders[index];
    }
    //function to get address to amount
    function getAddressToAmount(address funder) public view returns(uint256){
        return s_addressToAmount[funder]; 
    }

    function getPriceFeed() public view returns(AggregatorV3Interface){
        return s_priceFeed;
    }
}