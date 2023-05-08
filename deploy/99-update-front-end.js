const { ethers, network } = require("hardhat")
const fs = require("fs")
require("dotenv").config()
// nextjs-nft-marketplace/moralis/constants/network-mapping.json
const frontEndContractsFiles = "../nextjs-nft-marketplace/moralis/constants/networkMapping.json"
const frontEndAbiLocation = "../nextjs-nft-marketplace/moralis/constants/"
module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("updating front end")
        await updateContractAddresses()
        await updateABI()
    }
}

async function updateABI() {
    const nftMarketPlace = await ethers.getContract("nftMarketPlace")
    fs.writeFileSync(
        `${frontEndAbiLocation}NftMarketPlace.json`,
        nftMarketPlace.interface.format(ethers.utils.FormatTypes.json)
    )

    const basicNft = await ethers.getContract("basicNft")
    fs.writeFileSync(
        `${frontEndAbiLocation}basicNft.json`,
        basicNft.interface.format(ethers.utils.FormatTypes.json)
    )
}

async function updateContractAddresses() {
    const nftMarketPlace = await ethers.getContract("nftMarketPlace")
    const chainId = network.config.chainId
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFiles, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["nftMarketPlace"].includes(nftMarketPlace.address)) {
            contractAddresses[chainId]["nftMarketPlace"].push(nftMarketPlace.address)
        }
    } else {
        contractAddresses[chainId] = { nftMarketPlace: [nftMarketPlace.address] }
    }

    fs.writeFileSync(frontEndContractsFiles, JSON.stringify(contractAddresses))
}

module.exports.tags = ["all", "frontend"]
