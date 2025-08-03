// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RecipeBook
 * @dev A smart contract for creating chef profiles and minting recipe NFTs for free.
 * NFTs can be traded on a secondary market with royalties for the original creator.
 */
contract RecipeBook is ERC721URIStorage, Ownable, ReentrancyGuard {
    // --- Counters ---
    uint256 private _tokenIdCounter;

    // --- Constants ---
    uint256 public constant MAX_ROYALTY_PERCENT = 20; // 20%
    uint256 public constant MAX_PLATFORM_FEE_BPS = 1000; // 10% in basis points
    uint256 public constant BPS_DIVISOR = 10000;

    // --- State Variables ---
    uint256 public platformFeeBps;
    address public feeRecipient;

    // --- Data Structures ---
    struct ChefProfile {
        address chefAddress;
        string name;
        string bio;
        string profileImageURL;
        uint256 reputation;
        uint256 nftsCreated;
        uint256 votesReceived;
        bool isOnboarded;
        bool agentEnabled;
        bool notifications;
        uint8 theme; // 0 = light, 1 = dark
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct RecipeNFTMetadata {
        address creator;
        string title;
        string ingredients;
        string instructions;
        string imageURL;
        string description;
        uint256 votes;
        uint256 royaltyPercent; // Royalty in percentage (e.g., 5 for 5%)
        uint256 mintedAt;
        bool isForSale;
        uint256 salePrice;
    }

    // --- Mappings and Arrays ---
    mapping(uint256 => RecipeNFTMetadata) public nftMetadata; // tokenId => metadata
    mapping(address => ChefProfile) public chefProfiles;
    mapping(address => bool) public chefExists;

    // --- Gas-efficient NFT Sale Listing ---
    uint256[] private _nftsForSale;
    mapping(uint256 => uint256) private _nftForSaleIndex; // tokenId => index in _nftsForSale

    // --- Voting & Reputation ---
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public chefReputation;

    // --- Events ---
    event ChefProfileCreated(address indexed chef, string name, uint256 timestamp);
    event ChefProfileUpdated(address indexed chef, uint256 timestamp);
    event RecipeNFTMinted(address indexed creator, uint256 indexed tokenId, string title);
    event RecipeVoted(address indexed voter, uint256 indexed tokenId);
    event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
    event NFTListedForSale(address indexed owner, uint256 indexed tokenId, uint256 price);
    event NFTRemovedFromSale(address indexed owner, uint256 indexed tokenId);
    event RoyaltyPaid(address indexed recipient, uint256 amount, uint256 indexed tokenId);

    // --- Constructor ---
    constructor(address _feeRecipient, uint256 _initialPlatformFeeBps) 
        ERC721("Recipe Book NFT", "RECIPE") 
        Ownable(msg.sender) 
    {
        feeRecipient = _feeRecipient != address(0) ? _feeRecipient : msg.sender;
        setPlatformFee(_initialPlatformFeeBps);
    }

    // --- Chef Profile Functions ---

    /**
     * @dev Creates a chef profile - FREE
     */
    function createChefProfile(
        string memory _name,
        string memory _bio,
        string memory _profileImageURL
    ) public returns (bool) {
        if (chefExists[msg.sender]) {
            return false; // Chef already exists
        }

        chefProfiles[msg.sender] = ChefProfile({
            chefAddress: msg.sender,
            name: _name,
            bio: _bio,
            profileImageURL: _profileImageURL,
            reputation: 0,
            nftsCreated: 0,
            votesReceived: 0,
            isOnboarded: false,
            agentEnabled: true,
            notifications: true,
            theme: 0, // light theme by default
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });

        chefExists[msg.sender] = true;
        emit ChefProfileCreated(msg.sender, _name, block.timestamp);
        return true;
    }

    /**
     * @dev Updates chef profile information
     */
    function updateChefProfile(
        string memory _name,
        string memory _bio,
        string memory _profileImageURL
    ) public {
        require(chefExists[msg.sender], "Chef profile does not exist");

        ChefProfile storage profile = chefProfiles[msg.sender];
        profile.name = _name;
        profile.bio = _bio;
        profile.profileImageURL = _profileImageURL;
        profile.updatedAt = block.timestamp;

        emit ChefProfileUpdated(msg.sender, block.timestamp);
    }

    /**
     * @dev Updates chef preferences
     */
    function updateChefPreferences(
        bool _agentEnabled, 
        bool _notifications, 
        uint8 _theme
    ) public {
        require(chefExists[msg.sender], "Chef profile does not exist");
        require(_theme <= 1, "Invalid theme value");

        ChefProfile storage profile = chefProfiles[msg.sender];
        profile.agentEnabled = _agentEnabled;
        profile.notifications = _notifications;
        profile.theme = _theme;
        profile.updatedAt = block.timestamp;

        emit ChefProfileUpdated(msg.sender, block.timestamp);
    }

    /**
     * @dev Completes chef onboarding
     */
    function completeOnboarding() public {
        require(chefExists[msg.sender], "Chef profile does not exist");
        
        ChefProfile storage profile = chefProfiles[msg.sender];
        profile.isOnboarded = true;
        profile.updatedAt = block.timestamp;

        emit ChefProfileUpdated(msg.sender, block.timestamp);
    }

    /**
     * @dev Gets chef profile data
     */
    function getChefProfile(address _chef) public view returns (ChefProfile memory) {
        require(chefExists[_chef], "Chef profile does not exist");
        return chefProfiles[_chef];
    }

    /**
     * @dev Checks if chef profile exists
     */
    function doesChefExist(address _chef) public view returns (bool) {
        return chefExists[_chef];
    }

    // --- Recipe NFT Functions ---

    /**
     * @dev Mints a recipe NFT - FREE (no payment required)
     */
    function mintRecipeNFT(
        string memory _title,
        string memory _ingredients,
        string memory _instructions,
        string memory _imageURL,
        string memory _description,
        string memory _tokenURI,
        uint256 _royaltyPercent
    ) public nonReentrant returns (uint256) {
        // Auto-create chef profile if it doesn't exist
        if (!chefExists[msg.sender]) {
            createChefProfile("Anonymous Chef", "", "");
        }

        require(_royaltyPercent <= MAX_ROYALTY_PERCENT, "Royalty too high");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        
        nftMetadata[newTokenId] = RecipeNFTMetadata({
            creator: msg.sender,
            title: _title,
            ingredients: _ingredients,
            instructions: _instructions,
            imageURL: _imageURL,
            description: _description,
            votes: 0,
            royaltyPercent: _royaltyPercent,
            mintedAt: block.timestamp,
            isForSale: false,
            salePrice: 0
        });
        
        // Update chef's NFT count
        chefProfiles[msg.sender].nftsCreated++;
        chefProfiles[msg.sender].updatedAt = block.timestamp;
        
        emit RecipeNFTMinted(msg.sender, newTokenId, _title);
        return newTokenId;
    }

    /**
     * @dev Allows a user to vote for a recipe NFT, increasing the creator's reputation
     */
    function voteRecipeNFT(uint256 _tokenId) public {
        require(_ownerOf(_tokenId) != address(0), "Invalid token id");
        require(!hasVoted[_tokenId][msg.sender], "Already voted");
        
        nftMetadata[_tokenId].votes++;
        hasVoted[_tokenId][msg.sender] = true;
        
        // Update creator's reputation and votes received
        address creator = nftMetadata[_tokenId].creator;
        chefReputation[creator]++;
        
        if (chefExists[creator]) {
            chefProfiles[creator].reputation++;
            chefProfiles[creator].votesReceived++;
            chefProfiles[creator].updatedAt = block.timestamp;
        }
        
        emit RecipeVoted(msg.sender, _tokenId);
    }

    /**
     * @dev Lists an NFT for sale
     */
    function listNFTForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        require(_price > 0, "Price must be > 0");
        
        RecipeNFTMetadata storage metadata = nftMetadata[_tokenId];
        require(!metadata.isForSale, "NFT already listed");

        metadata.isForSale = true;
        metadata.salePrice = _price;

        _addNFTToForSaleList(_tokenId);

        emit NFTListedForSale(msg.sender, _tokenId, _price);
    }

    /**
     * @dev Removes an NFT from sale
     */
    function removeNFTFromSale(uint256 _tokenId) public {
        require(ownerOf(_tokenId) == msg.sender, "Not token owner");
        
        RecipeNFTMetadata storage metadata = nftMetadata[_tokenId];
        require(metadata.isForSale, "NFT not for sale");

        metadata.isForSale = false;
        metadata.salePrice = 0;

        _removeNFTFromForSaleList(_tokenId);

        emit NFTRemovedFromSale(msg.sender, _tokenId);
    }

    /**
     * @dev Buys an NFT that is listed for sale
     */
    function buyNFT(uint256 _tokenId) public payable nonReentrant {
        RecipeNFTMetadata storage metadata = nftMetadata[_tokenId];
        require(metadata.isForSale, "NFT not for sale");
        require(msg.value >= metadata.salePrice, "Insufficient payment");
        
        address seller = ownerOf(_tokenId);
        require(seller != msg.sender, "Cannot buy your own NFT");
        
        uint256 salePrice = metadata.salePrice;
        uint256 royaltyAmount = (salePrice * metadata.royaltyPercent) / 100;
        uint256 platformFeeAmount = (salePrice * platformFeeBps) / BPS_DIVISOR;
        uint256 sellerAmount = salePrice - royaltyAmount - platformFeeAmount;
        
        // --- Effects ---
        metadata.isForSale = false;
        metadata.salePrice = 0;
        _removeNFTFromForSaleList(_tokenId);
        
        // --- Interactions ---
        _transfer(seller, msg.sender, _tokenId);
        
        if (royaltyAmount > 0) {
            (bool royaltySuccess, ) = payable(metadata.creator).call{value: royaltyAmount}("");
            require(royaltySuccess, "Royalty transfer failed");
            emit RoyaltyPaid(metadata.creator, royaltyAmount, _tokenId);
        }
        
        if (platformFeeAmount > 0) {
            (bool feeSuccess, ) = payable(feeRecipient).call{value: platformFeeAmount}("");
            require(feeSuccess, "Platform fee transfer failed");
        }
        
        (bool sellerSuccess, ) = payable(seller).call{value: sellerAmount}("");
        require(sellerSuccess, "Seller payment failed");
        
        if (msg.value > salePrice) {
            (bool refundSuccess, ) = payable(msg.sender).call{value: msg.value - salePrice}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit NFTSold(seller, msg.sender, _tokenId, salePrice);
    }

    // --- View Functions ---

    /**
     * @dev Returns all NFTs currently listed for sale
     */
    function getNFTsForSale() public view returns (uint256[] memory) {
        return _nftsForSale;
    }

    /**
     * @dev Gets all NFTs owned by a specific user
     */
    function getUserNFTs(address user) public view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(user);
        if (tokenCount == 0) {
            return new uint256[](0);
        }
        
        uint256[] memory result = new uint256[](tokenCount);
        uint256 totalTokens = _tokenIdCounter;
        uint256 resultIndex = 0;
        
        for (uint256 i = 1; i <= totalTokens; i++) {
            try this.ownerOf(i) returns (address owner) {
                if (owner == user) {
                    result[resultIndex] = i;
                    resultIndex++;
                }
            } catch {
                // Token doesn't exist, skip
            }
        }
        return result;
    }

    /**
     * @dev Gets all NFTs with their metadata (for browsing)
     */
    function getAllNFTs() public view returns (uint256[] memory tokenIds, RecipeNFTMetadata[] memory metadata) {
        uint256 totalNFTs = _tokenIdCounter;
        tokenIds = new uint256[](totalNFTs);
        metadata = new RecipeNFTMetadata[](totalNFTs);
        
        for (uint256 i = 1; i <= totalNFTs; i++) {
            tokenIds[i - 1] = i;
            metadata[i - 1] = nftMetadata[i];
        }
        
        return (tokenIds, metadata);
    }

    function getTotalNFTs() public view returns (uint256) {
        return _tokenIdCounter;
    }

    // --- Admin Functions ---

    function setPlatformFee(uint256 _feeBps) public onlyOwner {
        require(_feeBps <= MAX_PLATFORM_FEE_BPS, "Fee too high");
        platformFeeBps = _feeBps;
    }
    
    function setFeeRecipient(address _recipient) public onlyOwner {
        require(_recipient != address(0), "Invalid address");
        feeRecipient = _recipient;
    }
    
    function withdrawEmergency() public onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}("");
        require(success, "Emergency withdrawal failed");
    }

    // --- Internal Functions ---

    /**
     * @dev Adds a token to the gas-efficient sale list
     */
    function _addNFTToForSaleList(uint256 tokenId) private {
        _nftsForSale.push(tokenId);
        _nftForSaleIndex[tokenId] = _nftsForSale.length - 1;
    }

    /**
     * @dev Removes a token from the gas-efficient sale list
     */
    function _removeNFTFromForSaleList(uint256 tokenId) private {
        uint256 index = _nftForSaleIndex[tokenId];
        uint256 lastTokenId = _nftsForSale[_nftsForSale.length - 1];

        _nftsForSale[index] = lastTokenId;
        _nftForSaleIndex[lastTokenId] = index;

        _nftsForSale.pop();
        delete _nftForSaleIndex[tokenId];
    }

    /**
     * @dev Custom burn function that cleans up associated storage
     */
    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender || getApproved(tokenId) == msg.sender || isApprovedForAll(ownerOf(tokenId), msg.sender), "Not authorized to burn");
        
        RecipeNFTMetadata storage metadata = nftMetadata[tokenId];
        if (metadata.isForSale) {
            _removeNFTFromForSaleList(tokenId);
        }
        
        delete nftMetadata[tokenId];
        
        // Call the parent burn function
        _burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}