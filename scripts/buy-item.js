const { ethers, network } = require("hardhat")

const { moveBlocks } = require("../utils/move-blocks.js")
const TOKEN_ID = 0
async function main() {
    const nftMarketPlace = await ethers.getContract("nftMarketPlace")
    const basicNft = await ethers.getContract("basicNft")

    const listing = await nftMarketPlace.getListing(basicNft.address, tokenId)
    const price = listing.price.toString()

    const tx = await nftMarketPlace.buyNFT(basicNft.address, TOKEN_ID, { value: price })
    await tx.wait(1)
    console.log("NFT bought")

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
