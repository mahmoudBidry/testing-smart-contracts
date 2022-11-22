// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Punk is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    string private link;
    uint256 public mintPrice;
    uint256 public maxSupply;
    uint256 public maxPerWallet;
    uint256 public minQuantity;
    uint public totalSupply;
    bool public isPublicMintEnabled;
    bool public isEnableToSell;

    constructor(string memory _link) payable ERC721("Punk", "PS"){
        mintPrice = 0.005 ether;
        maxSupply = 120;
        maxPerWallet = 3;
        minQuantity = 1;
        isPublicMintEnabled = false;
        isEnableToSell = false;
        setLink(_link);
        totalSupply = 0; 
        // https://gateway.pinata.cloud/ipfs/QmZWRRtY62ZX5SJDyzTEdpv2evGVB9JBgrBAS63SSj51xa/ punk
        // https://gateway.pinata.cloud/ipfs/QmaXdVYjGRscsa87CBk16CsRpZqpkBWH2BeSsKG5xsiAru/ wolf
    }

    function setLink(string memory _link) public onlyOwner {
        link = _link;
    }

    function getLink() public view onlyOwner returns(string memory){
        return link;
    }

    function getTotalSupply() public view returns(uint256){
        return totalSupply;
    }

    function setisPublicMintEnabled(bool isPublicMintEnabled_) public onlyOwner{
        isPublicMintEnabled = isPublicMintEnabled_;
    }

    function setisEnableToSell(bool isEnableToSell_) public onlyOwner{
        isEnableToSell = isEnableToSell_;
    }

    function mintNFT(address to, uint256 quantity) public payable {
        require(isPublicMintEnabled, "Minting not enabled");
        require(quantity >= minQuantity && quantity <= maxPerWallet, "the quantity must be between 1 and 3");
        require(msg.value >= mintPrice * quantity,"Not enough funds");
        require(balanceOf(to) + quantity <= maxPerWallet, "Number of nft per wallet exceeded");
        require(getTotalSupply() + quantity <= maxSupply,"Max supply exceeded");

        for (uint256 i =0; i<quantity; i++){
            _tokenIdCounter.increment();
            uint256 tokenId = _tokenIdCounter.current();
            string memory uri = string(abi.encodePacked(link, Strings.toString(getTotalSupply()), ".json"));
            _safeMint(to, tokenId);
            _setTokenURI(tokenId, uri);
            totalSupply +=1;
        }        
    }

    // function transferBetweenWallets(address _from, address _to, uint256 _tokenId) public {
    //     require(isPublicMintEnabled, "Minting not enabled");
    //     require(_exists(_tokenId), "Token doesn't exist");
    //     require(getTotalSupply() == maxSupply, "you can't transfer NFTS before sold out");
    //     transferFrom(_from, _to, _tokenId);
    // }

    function withdraw() public onlyOwner{
        require(address(this).balance > 0, "Balance is 0");
        payable(owner()).transfer(address(this).balance);
    }

    // --------------------------------------------------------------------------------------------------

    // override functions
    function balanceOf(address _owner) public view override returns (uint256) {
        return ERC721.balanceOf(_owner);
    }

    function transferFrom(address _from, address _to, uint256 _tokenId) public override {
        ERC721._transfer(_from, _to, _tokenId);
    }

    function setApprovalForAll(address _operator, bool _approved)  public override{
        require(isEnableToSell, "isEnableToSell");
        _setApprovalForAll(msg.sender, _operator, _approved);
    }

    // we cant test this function with JS 
    function _setApprovalForAll(address to, address _operator, bool _approved) internal override {
        require(isEnableToSell, "isEnableToSell");
        super._setApprovalForAll(to, _operator, _approved);
    }

    function approve(address to, uint256 tokenId) public virtual override {
        require(isEnableToSell, "isEnableToSell");
        require(ownerOf(tokenId) == msg.sender, "transfer from incorrect owner");
        _approve(to, tokenId);
    }

    // override ERC721URIStorage
    function _burn(uint256 tokenId) internal override {
        super._burn(tokenId);
    }
    function tokenURI(uint256 tokenId) public view override returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}

// override ERC721Enumerable
// function _beforeTokenTransfer(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable){
//     super._beforeTokenTransfer(from, to, tokenId);
// }

// function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool){
//     return super.supportsInterface(interfaceId);
// }