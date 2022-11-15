const { expect } =require("chai");
const { ethers } =require("hardhat");
//✅
//❌
describe("Punk", function(){
  
  let punk, punkContract, owner, addr1, addr2, addr3, addrs;

  beforeEach(async function(){
    punk = await ethers.getContractFactory('Punk');
    ;[owner, addr1, addr2, addr3, ...addrs] = await ethers.getSigners()
    punkContract = await punk.deploy("https://gateway.pinata.cloud/ipfs/QmZWRRtY62ZX5SJDyzTEdpv2evGVB9JBgrBAS63SSj51xa/")
  })

  // good
  describe("Deployment", function(){
    it("should set the right owner ✅", async function(){
      address =  await punkContract.owner();
      expect(address).to.equal(owner.address);
    })
  })

  // good
  describe("setisPublicMintEnabled", function(){
    it("(setisPublicMintEnabled) should be reverted because the caller is not the owner ❌", async function(){
      // we try to set true into isPublicMintEnabled variable
      await expect(punkContract.connect(addr1).setisPublicMintEnabled(true)).to.be.revertedWith('caller is not the owner');
    })

    it("(setisPublicMintEnabled) should be passed because the caller is the owner ✅", async function(){
      // we try to set true into isPublicMintEnabled variable
      await punkContract.connect(owner).setisPublicMintEnabled(true);
      const expectedValue = true;
      expect(await punkContract.isPublicMintEnabled()).to.equal(expectedValue);
    })
  })

  // good
  describe("link IPFS", function(){
    it("(getLink) should be reverted because the caller is not the owner ❌", async function(){
      // we try to get link 
      await expect(punkContract.connect(addr1).getLink()).to.be.revertedWith("caller is not the owner");
    })

    it("(getLink) should be passed because the caller is the owner ✅", async function(){
      // we try to get link 
      expect(await punkContract.connect(owner).getLink()).to.equal("https://gateway.pinata.cloud/ipfs/QmZWRRtY62ZX5SJDyzTEdpv2evGVB9JBgrBAS63SSj51xa/");
    })

    it("(setLink) should be reverted because the caller is not the owner ❌", async function(){
      // we try to set link 
      await expect(punkContract.connect(addr1).setLink("https://.../")).to.be.revertedWith("caller is not the owner");
    })

    it("(setLink) should be passed because the caller is the owner ✅", async function(){
      // we try to set link 
      const expectedValue = "https://.../";
      await punkContract.connect(owner).setLink(expectedValue);
      expect(await punkContract.getLink()).to.equal(expectedValue);
    })

  })

  // good
  describe("Total Supply", function(){
    it("(getTotalSupply) Total supply before minting ✅", async function(){
      //total supply before minting must be equal 0
      const expectedValue = 0;
      expect(await punkContract.getTotalSupply()).to.equal(expectedValue);
    })
    it("(getTotalSupply) Total supply after minting one NFT ✅", async function(){

      // for minting we must be turn isPublicMintEnabled variable to true
      await punkContract.connect(owner).setisPublicMintEnabled(true);
      const quantity = await punkContract.minQuantity();// 1
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await punkContract.mintNFT(addr1.address, quantity, amount);
      const expectedValue = 1;
      expect(await punkContract.getTotalSupply()).to.equal(expectedValue);
    })
  })

  // good
  describe("setisEnableToSell", function(){
    it("(setisEnableToSell) should be reverted because the caller is not the owner ❌", async function(){
      // we try to set true into setisEnableToSell
      await expect(punkContract.connect(addr1).setisEnableToSell(true)).to.be.revertedWith("caller is not the owner");
    })
    it("(setisEnableToSell) should be passed because the caller is the owner ✅", async function(){
      // we try to set true into setisEnableToSell
      await punkContract.connect(owner).setisEnableToSell(true);
      const expectedValue = true;
      expect(await punkContract.isEnableToSell()).to.equal(expectedValue);
    })
  })

  // good
  describe("mintNFT", function(){

    it("should be reverted because the Minting not enabled ❌", async function(){
      const quantity = await punkContract.minQuantity();
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString().toString()), // ether in this case MUST be a string
      } 
      await expect(punkContract.mintNFT(addr1.address, quantity, amount)).to.be.revertedWith("Minting not enabled");
      
    })

    it("should be reverted because the quantity must be between 1 and 3 ❌",async function(){
      // to avoid the first condition of setisPublicMintEnabled
      await punkContract.connect(owner).setisPublicMintEnabled(true);
      
      const quantity = (await punkContract.maxPerWallet()) + 1;
      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      await expect(punkContract.mintNFT(addr1.address, quantity, amount)).to.be.revertedWith("the quantity must be between 1 and 3");
    })

    it("should be reverted because the amount sended is not sufficient ❌", async function(){
      // to avoid the condition of setisPublicMintEnabled, we will turn it to true
      await punkContract.connect(owner).setisPublicMintEnabled(true);

      // to avoid the condition of quantity, we will enter a quantity between minQuantity and maxPerWallet
      const quantity = await punkContract.minQuantity();

      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity - 0.001).toString()), // ether in this case MUST be a string
      } 
      await expect(punkContract.mintNFT(addr1.address, quantity, amount)).to.be.revertedWith("Not enough funds");
    })

    it("should be reverted because each wallet must not contains more than \"maxPerWallet\" NFTS ❌", async function(){
      // to avoid the condition of setisPublicMintEnabled, we will turn it to true
      await punkContract.connect(owner).setisPublicMintEnabled(true);

      // get the value of maxPerWallete
      const maxPerWallet = await punkContract.maxPerWallet();

      // to avoid the condition of quantity, we will enter a max quantity 
      const quantity = maxPerWallet;

      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      
      await punkContract.mintNFT(addr1.address, quantity, amount);

      // check if the wallet contains "maxPerWallet" NFTS
      expect(await punkContract.balanceOf(addr1.address)).to.equal(maxPerWallet);

      // we will try to mint another NFT
      await expect(punkContract.mintNFT(addr1.address, 1, amount)).to.be.revertedWith("Number of nft per wallet exceeded");
    })

    it("should be reverted because the max supply is exceeded ❌", async function(){
      // to avoid the condition of setisPublicMintEnabled, we will turn it to true
      await punkContract.connect(owner).setisPublicMintEnabled(true);

      // get the value of maxPerWallete
      const maxPerWallet = await punkContract.maxPerWallet();

      // to avoid the condition of quantity, we will enter a max quantity 
      const quantity = maxPerWallet;

      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 

      // get max supply
      maxSupply = await punkContract.maxSupply(); // 120

      // we will mint all NFTs

      // 120 / 3 = 40
      for(let i=0; i<maxSupply/quantity; i++){
        await punkContract.mintNFT(addrs[i].address, quantity, amount);
      }
      
      //check if all NFTs are minted successfully
      expect(await punkContract.getTotalSupply()).to.equal(maxSupply);
      
      //we will try to mint another NFT
      await expect(punkContract.mintNFT(addr1.address, 1, amount)).to.be.revertedWith("Max supply exceeded");
    })

  })

  // good
  describe.only("withdraw", function(){
    it("(withdraw) should be reverted because the caller is not the owner ❌", async function(){
      // we try to call withdraw function 
      await expect(punkContract.connect(addr1).withdraw()).to.be.revertedWith("caller is not the owner");      
    })

    it("(withdraw) should be reverted because the balance is 0 ❌", async function(){
      // we try to call withdraw function 
      await expect(punkContract.connect(owner).withdraw()).to.be.revertedWith("Balance is 0");
    })


    it("(withdraw) should be passed because the balance is not 0 ✅", async function(){
      // we will mint some NFTs for getting some balance

      // to avoid the condition of setisPublicMintEnabled, we will turn it to true
      await punkContract.connect(owner).setisPublicMintEnabled(true);

      // get the value of maxPerWallete
      const maxPerWallet = await punkContract.maxPerWallet();

      // to avoid the condition of quantity, we will enter a max quantity 
      const quantity = maxPerWallet;

      // we have to pay 0.005 for mining
      const amount = {
        value: ethers.utils.parseEther((0.005 * quantity).toString()), // ether in this case MUST be a string
      } 
      
      await punkContract.mintNFT(addr1.address, quantity, amount);

      // we will check if the NFTs are minted
      const expectedValue = true;
      realvalue = (await punkContract.getTotalSupply()) > 0;
      expect(realvalue).to.equal(expectedValue);

      // withdraw function
      const accountBalanceBeforeWithdraw = ethers.utils.formatEther(await punkContract.provider.getBalance(owner.address));

      await punkContract.connect(owner).withdraw();

      const accountBalanceAfterWithdraw = ethers.utils.formatEther(await punkContract.provider.getBalance(owner.address));
      expect(accountBalanceAfterWithdraw > accountBalanceBeforeWithdraw).to.equal(true);

    })
  })

  //
})