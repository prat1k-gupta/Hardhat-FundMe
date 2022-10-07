const { getNamedAccounts, ethers } = require("hardhat")

async function main() {
    const { deployer } = await getNamedAccounts("deployer")
    const fundMe = await ethers.getContract("FundMe", deployer)

    console.log("funding contract.......")
    const transactionResponse = await fundMe.fund({
        value: "38000000000000000"
    })
    const transactionReceipt = await transactionResponse.wait(1)
    console.log("withdrawing.....")
    const withdrawResponse = await fundMe.withdraw(); 
    await withdrawResponse.wait(1);
    console.log("got it back!!")
}
//0xe7f1725e7734ce288f8367e1bb143e90bb3f0512

main()
    .then(() => process.exit(0))
    .then(err => {
        console.log(err)
        process.exit(1)
    })
