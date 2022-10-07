const { assert } = require("chai");
const { ethers, getNamedAccounts, deployments, network } = require("hardhat");
const {developmentChains} = require("../../helper-hardhat-config"); 

developmentChains.includes(network.name) ? describe.skip : 
describe("FundMe",async function(){
    let fundMe; 
    let deployer;
    let mockV3Aggregator; 
    const sendValue = "38000000000000000";
    console.log(sendValue.toString())
    beforeEach(async function(){
        //1. first we get the deployer 
        //2. we deploy all contracts using all tag 
        //3. we get the deployed contracts out 
        deployer = (await getNamedAccounts()).deployer
        deployments.fixture(["all"]); 
        //getContract take two things one is the contract and other is the signer 
        fundMe = await ethers.getContract("FundMe",deployer); 
    })

    it("allows people to fund and withdraw", async function(){
        await fundMe.fund({value: sendValue})
        await fundMe.withdraw();
        const endingBalance = await fundMe.provider.getBalance(fundMe.address); 
        assert.equal(endingBalance,0); 
    })
})