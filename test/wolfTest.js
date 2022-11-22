const { expect } =require("chai");
const { ethers } =require("hardhat");
//✅
//❌
describe("Punk", function(){
  
  let wolf, wolfContract, owner, addr1, addr2, addr3, addrs;

  beforeEach(async function(){
    wolf = await ethers.getContractFactory('Punk');
    ;[owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners()
    wolfContract = await wolf.deploy("https://gateway.pinata.cloud/ipfs/QmaXdVYjGRscsa87CBk16CsRpZqpkBWH2BeSsKG5xsiAru/")
    // https://gateway.pinata.cloud/ipfs/QmZWRRtY62ZX5SJDyzTEdpv2evGVB9JBgrBAS63SSj51xa/ punk
    // https://gateway.pinata.cloud/ipfs/QmaXdVYjGRscsa87CBk16CsRpZqpkBWH2BeSsKG5xsiAru/ wolf
  })

  // good
  describe("Deployment", function(){
    it("should set the right owner ✅", async function(){
      address =  await wolfContract.owner();
      expect(address).to.equal(owner.address);
    })
  }) 

  // good
  describe("setisPublicMintEnabled", function(){
    it("(setisPublicMintEnabled) should be reverted because the caller is not the owner ❌", async function(){
      // we try to set true into isPublicMintEnabled variable
      await expect(wolfContract.connect(addr1).setisPublicMintEnabled(true)).to.be.revertedWith('caller is not the owner');
    })

    it("(setisPublicMintEnabled) should be passed because the caller is the owner ✅", async function(){
      // we try to set true into isPublicMintEnabled variable
      await wolfContract.connect(owner).setisPublicMintEnabled(true);
      const expectedValue = true;
      expect(await wolfContract.isPublicMintEnabled()).to.equal(expectedValue);
    })
  })

  // good
  describe("link IPFS", function(){
    it("(getLink) should be reverted because the caller is not the owner ❌", async function(){
      // we try to get link 
      await expect(wolfContract.connect(addr1).getLink()).to.be.revertedWith("caller is not the owner");
    })

    it("(getLink) should be passed because the caller is the owner ✅", async function(){
      // we try to get link 
      expect(await wolfContract.connect(owner).getLink()).to.equal("https://gateway.pinata.cloud/ipfs/QmZWRRtY62ZX5SJDyzTEdpv2evGVB9JBgrBAS63SSj51xa/");
    })

    it("(setLink) should be reverted because the caller is not the owner ❌", async function(){
      // we try to set link 
      await expect(wolfContract.connect(addr1).setLink("https://.../")).to.be.revertedWith("caller is not the owner");
    })

    it("(setLink) should be passed because the caller is the owner ✅", async function(){
      // we try to set link 
      const expectedValue = "https://.../";
      await wolfContract.connect(owner).setLink(expectedValue);
      expect(await wolfContract.getLink()).to.equal(expectedValue);
    })

  })

  // good
  describe("Total Supply", function(){
    it("(getTotalSupply) Total supply before minting ✅", async function(){
      //total supply before minting must be equal 0
      const expectedValue = 0;
      expect(await wolfContract.getTotalSupply()).to.equal(expectedValue);
    })
    it("(getTotalSupply) Total supply after minting one NFT ✅", async function(){

      // for minting we must be turn isPublicMintEnabled variable to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);
      const quantity = await wolfContract.minQuantity();// 1
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await wolfContract.mintNFT(addr1.address, quantity, amount);
      const expectedValue = 1;
      expect(await wolfContract.getTotalSupply()).to.equal(expectedValue);
    })
  })

  // good
  describe("setisEnableToSell", function(){
    it("(setisEnableToSell) should be reverted because the caller is not the owner ❌", async function(){
      // we try to set true into setisEnableToSell
      await expect(wolfContract.connect(addr1).setisEnableToSell(true)).to.be.revertedWith("caller is not the owner");
    })
    it("(setisEnableToSell) should be passed because the caller is the owner ✅", async function(){
      // we try to set true into setisEnableToSell
      await wolfContract.connect(owner).setisEnableToSell(true);
      const expectedValue = true;
      expect(await wolfContract.isEnableToSell()).to.equal(expectedValue);
    })
  })

  // good
  describe("mintNFT", function(){

    it("should be reverted because the Minting not enabled ❌", async function(){
      const quantity = await wolfContract.minQuantity();
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString().toString()), // ether in this case MUST be a string
      } 
      await expect(wolfContract.mintNFT(addr1.address, quantity, amount)).to.be.revertedWith("Minting not enabled");
      
    })

    it("should be reverted because the quantity must be between 1 and 3 ❌",async function(){
      // to avoid the first condition of setisPublicMintEnabled
      await wolfContract.connect(owner).setisPublicMintEnabled(true);
      
      const quantity = (await wolfContract.maxPerWallet()) + 1;
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await expect(wolfContract.mintNFT(addr1.address, quantity, amount)).to.be.revertedWith("the quantity must be between 1 and 3");
    })

    it("should be reverted because the amount sended is not sufficient ❌", async function(){
      // to avoid the condition of setisPublicMintEnabled, we will turn it to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);

      // to avoid the condition of quantity, we will enter a quantity between minQuantity and maxPerWallet
      const quantity = await wolfContract.minQuantity();

      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity - 0.001).toString()), // ether in this case MUST be a string
      } 
      await expect(wolfContract.mintNFT(addr1.address, quantity, amount)).to.be.revertedWith("Not enough funds");
    })

    it("should be reverted because each wallet must not contains more than \"maxPerWallet\" NFTS ❌", async function(){
      // to avoid the condition of setisPublicMintEnabled, we will turn it to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);

      // get the value of maxPerWallete
      const maxPerWallet = await wolfContract.maxPerWallet();

      // to avoid the condition of quantity, we will enter a max quantity 
      const quantity = maxPerWallet;

      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      
      await wolfContract.mintNFT(addr1.address, quantity, amount);

      // check if the wallet contains "maxPerWallet" NFTS
      expect(await wolfContract.balanceOf(addr1.address)).to.equal(maxPerWallet);

      // we will try to mint another NFT
      await expect(wolfContract.mintNFT(addr1.address, 1, amount)).to.be.revertedWith("Number of nft per wallet exceeded");
    })

    it("should be reverted because the max supply is exceeded ❌", async function(){
      // to avoid the condition of setisPublicMintEnabled, we will turn it to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);

      // get the value of maxPerWallete
      const maxPerWallet = await wolfContract.maxPerWallet();

      // to avoid the condition of quantity, we will enter a max quantity 
      const quantity = maxPerWallet;

      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 

      // get max supply
      maxSupply = await wolfContract.maxSupply(); // 120

      // we will mint all NFTs

      // 120 / 3 = 40
      for(let i=0; i<maxSupply/quantity; i++){
        await wolfContract.mintNFT(addrs[i].address, quantity, amount);
      }
      
      //check if all NFTs are minted successfully
      expect(await wolfContract.getTotalSupply()).to.equal(maxSupply);
      
      //we will try to mint another NFT
      await expect(wolfContract.mintNFT(addr1.address, 1, amount)).to.be.revertedWith("Max supply exceeded");
    })

  })

  // good
  describe("withdraw", function(){
    it("(withdraw) should be reverted because the caller is not the owner ❌", async function(){
      // we try to call withdraw function 
      await expect(wolfContract.connect(addr1).withdraw()).to.be.revertedWith("caller is not the owner");      
    })

    it("(withdraw) should be reverted because the balance is 0 ❌", async function(){
      // we try to call withdraw function 
      await expect(wolfContract.connect(owner).withdraw()).to.be.revertedWith("Balance is 0");
    })


    it("(withdraw) should be passed because the balance is not 0 ✅", async function(){
      // we will mint some NFTs for getting some balance

      // to avoid the condition of setisPublicMintEnabled, we will turn it to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);

      // get the value of maxPerWallete
      const maxPerWallet = await wolfContract.maxPerWallet();

      // to avoid the condition of quantity, we will enter a max quantity 
      const quantity = maxPerWallet;

      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      
      await wolfContract.mintNFT(addr1.address, quantity, amount);

      // we will check if the NFTs are minted
      const expectedValue = true;
      realvalue = (await wolfContract.getTotalSupply()) > 0;
      expect(realvalue).to.equal(expectedValue);

      // withdraw function
      const accountBalanceBeforeWithdraw = ethers.utils.formatEther(await wolfContract.provider.getBalance(owner.address));

      await wolfContract.connect(owner).withdraw();

      const accountBalanceAfterWithdraw = ethers.utils.formatEther(await wolfContract.provider.getBalance(owner.address));
      expect(accountBalanceAfterWithdraw > accountBalanceBeforeWithdraw).to.equal(true);

    })
  })

  // good
  describe("balanceOf", function(){
    it("(balanceOf) it should return 0 ✅", async function(){
      // we try to call balanceOf function 
      const expectedValue = 0;

      expect( await wolfContract.balanceOf(addr1.address)).to.equal(expectedValue);      
    })

    it("(balanceOf) it should return 1 ✅", async function(){
      
      // for minting we must be turn isPublicMintEnabled variable to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);
      const quantity = await wolfContract.minQuantity();// 1
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await wolfContract.mintNFT(addr1.address, quantity, amount);
      const expectedValue = 1;

      // we will check if the total supply was increased
      expect(await wolfContract.getTotalSupply()).to.equal(expectedValue);

      // we will check if the blanceOf of this address was increased
      expect( await wolfContract.balanceOf(addr1.address)).to.equal(expectedValue);
    })
  })

  // good
  describe("transferFrom", function(){
    it("(transferFrom) it should be reverted because the NFT has not yet been created ❌", async function(){
      // we try to transfer an NFT 

      const tokenId = 1
      await expect(wolfContract.transferFrom(addr1.address, addr2.address, tokenId)).to.be.revertedWith("invalid token ID");

    })

    it("(transferFrom) it should be reverted because the sender is not the owner of the NFT ❌", async function(){
      // we try to transfer an NFT
      // for minting we must be turn isPublicMintEnabled variable to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);
      const quantity = await wolfContract.minQuantity();// 1
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await wolfContract.mintNFT(owner.address, quantity, amount);
      const expectedValue = 1;

      // we will check if the total supply was increased
      expect(await wolfContract.getTotalSupply()).to.equal(expectedValue);

      const tokenId = 1
      await expect(wolfContract.transferFrom(addr1.address, addr2.address, tokenId)).to.be.revertedWith("transfer from incorrect owner");
    })

    it("(transferFrom) it should be passed because the sender is the owner of the NFT ✅", async function(){
      // we try to transfer an NFT
      // for minting we must be turn isPublicMintEnabled variable to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);
      const quantity = await wolfContract.minQuantity();// 1
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await wolfContract.mintNFT(owner.address, quantity, amount);
      const expectedValue = 1;

      // we will check if the total supply was increased
      expect(await wolfContract.getTotalSupply()).to.equal(expectedValue);

      const balanceOfBeforeTransfer = await wolfContract.balanceOf(addr1.address) //0

      //we transfer NFT from the owner to the new owner(addr1)
      const tokenId = 1
      await wolfContract.transferFrom(owner.address, addr1.address, tokenId);

      const balanceOfAfterTransfer = await wolfContract.balanceOf(addr1.address) // 1

      expect(balanceOfAfterTransfer > balanceOfBeforeTransfer).to.equal(true);

    })
  })

  // approve
  describe.only("setApprovalForAll & approve", function(){
    it("(setApprovalForAll) it should be reverted because isEnableToSell is false ❌", async function(){
      // we try to call setApprovalForAll 
      await expect(wolfContract.connect(addr1).setApprovalForAll(addr2.address, true)).to.be.revertedWith("isEnableToSell");
    })

    it("(setApprovalForAll) it should be passed because isEnableToSell is true ✅", async function(){
      // we try to call setApprovalForAll 
      await wolfContract.connect(owner).setisEnableToSell(true)
      await wolfContract.connect(addr1).setApprovalForAll(addr2.address, true)
    })

    it("(approve) it should be reverted because isEnableToSell is false ❌", async function(){
      // we try to call approve function 
      const tokenId = 1
      await expect(wolfContract.connect(addr1).approve(addr2.address, tokenId)).to.be.revertedWith("isEnableToSell");
    })

    it("(approve) it should be reverted because the NFT has not yet been created ❌", async function(){
      // we try to call approve function
      const tokenId = 1
      await wolfContract.connect(owner).setisEnableToSell(true)
      await expect(wolfContract.connect(addr1).approve(addr2.address, tokenId)).to.be.revertedWith("invalid token ID");
    })

    it("(approve) it should be reverted because the sender is not the owner of the NFT ❌", async function(){
      // we try to call approve function
      
      await wolfContract.connect(owner).setisEnableToSell(true);
      // for minting we must be turn isPublicMintEnabled variable to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);
      const quantity = await wolfContract.minQuantity();// 1
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await wolfContract.mintNFT(addr1.address, quantity, amount);
      const expectedValue = 1;

      // we will check if the total supply was increased
      expect(await wolfContract.getTotalSupply()).to.equal(expectedValue);

      const tokenId = 1
      
      await expect(wolfContract.connect(addr3).approve(addr2.address, tokenId)).to.be.revertedWith("transfer from incorrect owner");

    })

    it("(approve) it should be passed because the NFT was created & the isEnableToSell is true and the sender is the owner of the NFT✅", async function(){
      // we try to call approve function
      
      await wolfContract.connect(owner).setisEnableToSell(true);
      // for minting we must be turn isPublicMintEnabled variable to true
      await wolfContract.connect(owner).setisPublicMintEnabled(true);
      const quantity = await wolfContract.minQuantity();// 1
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await wolfContract.mintNFT(addr1.address, quantity, amount);
      const expectedValue = 1;

      // we will check if the total supply was increased
      expect(await wolfContract.getTotalSupply()).to.equal(expectedValue);

      const tokenId = 1
      await wolfContract.connect(addr1).approve(addr2.address, tokenId)
      //await expect(wolfContract.connect(addr1).approve(addr2.address, tokenId)).to.be.revertedWith("invalid token ID");
    })

  })

})