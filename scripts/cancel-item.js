const { ethers, network } = require("hardhat")

const { moveBlocks } = require("../utils/move-blocks.js")
const TOKEN_ID = 0
async function main() {
    const nftMarketPlace = await ethers.getContract("nftMarketPlace")
    const basicNft = await ethers.getContract("basicNft")
    const tx = await nftMarketPlace.cancelListing(basicNft.address, TOKEN_ID)
    await tx.wait(1)
    console.log("NFT Cancelled")

    if ((network.config.chainId = "31337")) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
