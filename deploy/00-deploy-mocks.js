
//This is script is written to deploy the mockV3Aggregator to get a price feed 
//on our localhost or hardhat network 

const {network} = require("hardhat")
const {developmentChains,DECIMALS,INTTIAL_ANSWER} = require("../helper-hardhat-config")

module.exports = async ({getNamedAccounts,deployments})=>{
    const {deploy,log} = deployments; 
    const {deployer} = await getNamedAccounts();
    console.log(network.name);      
    if(developmentChains.includes(network.name)){
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INTTIAL_ANSWER]
        })
        log("Mocks deployed!")
        log("-----------------------------------")        
    }
    // const mockV3Aggregator = 
}

module.exports.tags = ["all","mocks"]; 