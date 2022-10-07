//old method
//imports
//main function 
//calling main function 
const { getChainId } = require("hardhat")
const {networkConfig,developmentChains} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    //deployment object
    const { deploy, log } = deployments
    //deploy will actually deploy the code and
    //log will console log the details like address from to

    //deployer is basically is the account responsible to deploy
    //we get the deployer from hardhat-config.js
    //where we added the deployer in namedAccounts

    const { deployer } = await getNamedAccounts()
    //we get the chain id from network we are gonna use
    const chainId = network.config.chainId
    console.log(chainId)

    //if chainid is x then ethUsdAddress
    // let ethUsdPriceFeedAddress = networkConfig[chainId]["ethUdPriceFeed"]
    //^^^ this above will get priceFeed address for chains like goerli and peolygon which has a aggregatorv3 contract deployed on testnet
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    //But for the contract that doesn't exist , we deploy a minimal version of the contract
    //which is we will mock the contract on our local machine and deploy it on harhdhat or localhost
    const args= [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], //priceFEeed address passing argumensts to constructor
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        await verify(fundMe.address,args)
    }
    // const fundMeDeployed = await ethers.getContract("FundMe", deployer)
    // const fundMeOwner = await fundMeDeployed.getOwner() 
    // console.log(`owner address is ${fundMeOwner}`)
     log("----------------------------------------")
}
module.exports.tags = ["all","fundme"]