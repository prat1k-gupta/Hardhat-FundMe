const { assert, expect, AssertionError } = require("chai")
const { deployments, ethers, getNamedAccounts, network } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function() {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")
          beforeEach(async function() {
              //deploy our fundMe contract
              //using hardhat-deploy
              // const accounts = await ethers.getSigners();
              // const accountZero = accounts[0];
              deployer = (await getNamedAccounts("deployer")).deployer
              //we are using tags which we used in all our scipts
              //to deploy our all contracts
              await deployments.fixture(["all"])
              // we can get the recently deployed contract using ethers.getContract()
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          //This is only for constructor inside FundMe
          describe("constructor", async function() {
              it("sets the aggregator addresses correctly", async function() {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          describe("fund", async function() {
              it("Fails if you don't send enought ETH", async function() {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "Didn't send enough!"
                  )
              })

              it("updated the amount funded data structure", async function() {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmount(deployer)

                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds funder to array of getFunders", async function() {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunders(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function() {
              beforeEach(async function() {
                  await fundMe.fund({ value: sendValue })
              })

              it("withdraw ETH from a single founder", async function() {
                  //arrange
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  //assert
                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance.add(startingDeployerBalance),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("allows us to witdhdraw with multiple accounts", async function() {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  console.log("starting fund " + startingFundMeBalance)
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )
                  console.log("starting deployer " + startingDeployerBalance)
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )

                  //Make sure that the getFunders are reset properly
                  await expect(fundMe.getFunders(0)).to.be.reverted

                  for (let i = 0; i < 6; i++) {
                      assert(
                          await fundMe.getAddressToAmount(accounts[i].address),
                          0
                      )
                  }
              })

              it("only allows the owner to withdraw", async function() {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedAccount = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedAccount.withdraw()
                  ).to.be.revertedWith("fuck off , baap ko bulake lao")
              })

              it("cheaper withdraw from single funder...", async function() {
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert(endingDeployerBalance, 0)
                  assert(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })

              it("cheaper withdraw with multiple accounts", async function() {
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const startingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance = await fundMe.provider.getBalance(
                      deployer
                  )

                  assert(endingFundMeBalance, 0)
              })

              it("only allows the owner to do cheaper withdraw", async function() {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedAccount = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedAccount.cheaperWithdraw()
                  ).to.be.revertedWith("fuck off , baap ko bulake lao")
              })
          })
      })
