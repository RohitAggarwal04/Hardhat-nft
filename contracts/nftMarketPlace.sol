// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

error NFTMarketPlace___PriceMustBeAboveZero();
error NFTMarketPlace___NotApprovedForMarketPlace();
error NFTMarketPlace___AlreadyListed(address nftAddress, uint256 tokenId);
error NFTMarketPlace___NotOwner();
error NFTMarketPlace___NotListed(address nftAddress, uint256 tokenId);
error NFTMarketPlace___PriceNotMet(address nftAddress, uint256 tokenId, uint256 price);
error NFTMarketPlace___NoProceeds();
error NFTMarketPlace___TransferFailed();

contract nftMarketPlace is ReentrancyGuard {
    // Mapping of token ID to its details
    mapping(address => mapping(uint256 => NFT)) private s_nftListing;

    // seller address => balance
    mapping(address => uint256) public s_proceeds;

    event ItemListed(
        address indexed owner,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );
    event NFTBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event NFTSold(address seller, uint256 tokenId, uint256 price);

    event listingCancelled(
        address indexed owner,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    // Struct for NFT data
    struct NFT {
        uint256 price;
        address owner;
    }

    // modifier
    modifier notListed(address nftAddress, uint256 tokenId) {
        NFT memory nft = s_nftListing[nftAddress][tokenId];
        if (nft.price > 0) {
            revert NFTMarketPlace___AlreadyListed(nftAddress, tokenId);
        }
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        NFT memory nft = s_nftListing[nftAddress][tokenId];
        if (nft.price == 0) {
            revert NFTMarketPlace___NotListed(nftAddress, tokenId);
        }
        _;
    }

    modifier onlyOwner(
        address nftAddress,
        uint256 tokenId,
        address sender
    ) {
        IERC721 nft = IERC721(nftAddress);
        if (sender != nft.ownerOf(tokenId)) {
            revert NFTMarketPlace___NotOwner();
        }
        _;
    }

    // Function to list an NFT for sale

    function listNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external notListed(nftAddress, tokenId) onlyOwner(nftAddress, tokenId, msg.sender) {
        if (price <= 0) {
            revert NFTMarketPlace___PriceMustBeAboveZero();
        }
        // 1. send nft to the contract. Transfer => contract "hold" the nft.
        // 2. owners can still hold nft, and give market place approval to sell nft for them .
        // using 2 method as it is cheap and easy to read.

        // Get the NFT data
        IERC721 nft = IERC721(nftAddress);
        if (nft.getApproved(tokenId) != address(this)) {
            revert NFTMarketPlace___NotApprovedForMarketPlace();
        }
        s_nftListing[nftAddress][tokenId] = NFT(price, msg.sender);

        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    // Function to buy an NFT
    function buyNFT(
        address nftAddress,
        uint256 tokenId
    ) external payable isListed(nftAddress, tokenId) nonReentrant {
        NFT memory nft = s_nftListing[nftAddress][tokenId];
        if (msg.value < nft.price) {
            revert NFTMarketPlace___PriceNotMet(nftAddress, tokenId, nft.price);
        }
        s_proceeds[nft.owner] = s_proceeds[nft.owner] + msg.value;
        delete (s_nftListing[nftAddress][tokenId]);
        IERC721(nftAddress).safeTransferFrom(nft.owner, msg.sender, tokenId);
        emit NFTBought(msg.sender, nftAddress, tokenId, nft.price);
    }

    function cancelListing(
        address nftAddress,
        uint256 tokenId
    ) external onlyOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId) {
        delete (s_nftListing[nftAddress][tokenId]);
        emit listingCancelled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    ) external onlyOwner(nftAddress, tokenId, msg.sender) isListed(nftAddress, tokenId) {
        NFT memory nft = s_nftListing[nftAddress][tokenId];
        nft.price = price;
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    function withdraw() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) {
            revert NFTMarketPlace___NoProceeds();
        }
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) {
            revert NFTMarketPlace___TransferFailed();
        }
    }

    /////////////////
    // getter functions //
    /////////////////

    function getListing(address nftAddress, uint256 tokenId) external view returns (NFT memory) {
        return s_nftListing[nftAddress][tokenId];
    }

    function getBalance() external view returns (uint256) {
        return s_proceeds[msg.sender];
    }
}
