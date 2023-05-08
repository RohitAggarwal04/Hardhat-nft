// SPDX-License-Identifier: MIT
import "../../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";

pragma solidity ^0.8.7;

contract basicNft is ERC721 {
    string public constant TOKEN_URI =
        "ipfs://bafybeig37ioir76s7mg5oobetncojcm3c3hxasyd4rvid4jqhy4gkaheg4/?filename=0-PUG.json";
    uint256 private s_tokenCounter;

    event DogMinted(uint256 indexed tokenId);

    constructor() ERC721("Dogie", "DOG") {
        s_tokenCounter = 0;
    }

    function mintNft() public returns (uint256) {
        s_tokenCounter++;
        _safeMint(msg.sender, s_tokenCounter);
        emit DogMinted(s_tokenCounter);
        return s_tokenCounter;
    }

    function tokenURI(uint256) public pure override returns (string memory) {
        return TOKEN_URI;
    }


    

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
