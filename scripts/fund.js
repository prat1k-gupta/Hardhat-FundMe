const {getNamedAccounts, ethers} = require("hardhat");

async function main(){
    const {deployer} = await getNamedAccounts("deployer"); 
    const fundMe = await ethers.getContract("FundMe",deployer);
    
    console.log("funding contract.......");
    const transactionResponse = await fundMe.fund({
        value: "38000000000000000"
    })
    const transactionReceipt = await transactionResponse.wait(1); 

    
}

main()
.then(()=> process.exit(0))
.then((err)=>{
    console.log(err); 
    process.exit(1); 
})