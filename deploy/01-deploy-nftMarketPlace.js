const { network, ethers } = require("hardhat")
const {
    networkConfig,
    developmentChains,
    VERIFICATION_BLOCK_CONFIRMATIONS,
} = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    const waitBlockConfirmations = developmentChains.includes(network.name)
        ? 1
        : VERIFICATION_BLOCK_CONFIRMATIONS

    const nftMarketPlace = await deploy("nftMarketPlace", {
        from: deployer,
        args: [],
        log: true,
        waitConfirmations: waitBlockConfirmations,
    })
    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        log("Verifying...")
        await verify(nftMarketPlace.address, [])
    }
}
module.exports.tags = ["main", "nftMarketPlace", "all"]
