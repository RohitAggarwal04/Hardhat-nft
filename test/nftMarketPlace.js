const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")

developmentChains.includes(network.name) &&
    describe("NFT MarketPlace Unit Test", function () {
        let player, nftMarketPlaceContract, basicNft, basicNftContract, nftMarketPlace
        const chainId = network.config.chainId
        const TOKEN_ID = 0
        const PRICE = ethers.utils.parseEther("0.1")
        beforeEach(async function () {
            const { deployer } = await getNamedAccounts()
            accounts = await ethers.getSigners()
            player = accounts[1]

            await deployments.fixture("all")
            nftMarketPlace = await ethers.getContract("nftMarketPlace")
            basicNft = await ethers.getContract("BasicNft")
            await basicNft.mintNft()
            await basicNft.approve(nftMarketPlace.address, TOKEN_ID)
        })

        describe("listNFT", function () {
            it("emits an event after listing nft", async () => {
                expect(await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE)).to.emit(
                    "ItemListed"
                )
            })

            it("", async () => {
                await nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE)
                const error = `NFTMarketPlace___AlreadyListed("${basicNft.address}",${TOKEN_ID})`
                await expect(
                    nftMarketPlace.listNFT(basicNft.address, TOKEN_ID, PRICE)
                ).to.be.revertedWith(error)
            })

            it("exclusively allow owners to list nft", async () => {
                const nftMarketPlaceconnectedwithuser = nftMarketPlace.connect(player)
                await basicNft.approve(player.address, TOKEN_ID)
                await expect(
                    nftMarketPlaceconnectedwithuser.listNFT(basicNft.address, TOKEN_ID, PRICE)
                ).to.be.revertedWith("NFTMarketPlace___NotOwner")
            })
        })
    })
