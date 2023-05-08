const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify.js")

module.exports = async function ({ getNamedAccounts, deployments }) {
    const { deployer } = await getNamedAccounts()
    const { deploy, log } = await deployments

    log("-------------------------")

    const args = []
    const basicNft = await deploy("basicNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmation || 1,
    })

    if (!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
        console.log("Verifying...")
        await verify(basicNft.address, args)
    }
}

module.exports.tags = ["basicNft"]
