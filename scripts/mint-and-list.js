const { ethers, network, hre } = require("hardhat")

const { moveBlocks } = require("../utils/move-blocks.js")
async function main() {
    const PRICE = ethers.utils.parseEther("0.01")

    const nftMarketPlace = await ethers.getContract("nftMarketPlace")
    const basicNft = await ethers.getContract("basicNft")
    console.log("Minting nft")

    const minttx = await basicNft.mintNft()
    const minttxReciept = await minttx.wait(1)
    const tokenId = minttxReciept.events[0].args.tokenId
    console.log("Approving nft")

    const approval = await basicNft.approve(nftMarketPlace.address, tokenId)
    await approval.wait(1)
    console.log("Listing nft")

    const tx = await nftMarketPlace.listNFT(basicNft.address, tokenId, PRICE)
    await tx.wait(1)
    console.log("Listed")

    if (network.config.chainId == "31337") {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
