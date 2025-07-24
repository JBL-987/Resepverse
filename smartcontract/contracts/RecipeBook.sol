// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RecipeBook
 * @dev A smart contract for creating, sharing, and trading recipes as NFTs.
 * It allows users to submit recipes, vote on them, and mint them as unique NFTs.
 * These NFTs can then be listed for sale and traded on a secondary market,
 * with royalties for the original creator.
 */
contract RecipeBook is ERC721URIStorage, Ownable, ReentrancyGuard {
    // --- Counters ---
    uint256 private _recipeIdCounter;
    uint256 private _tokenIdCounter;

    // --- Constants ---
    uint256 public constant MAX_ROYALTY_PERCENT = 20; // 20%
    uint256 public constant MAX_PLATFORM_FEE_BPS = 1000; // 10% in basis points
    uint256 public constant BPS_DIVISOR = 10000;

    // --- State Variables ---
    uint256 public platformFeeBps;
    address public feeRecipient;

    // --- Data Structures ---
    struct RecipeData {
        uint256 id;
        address creator;
        string title;
        string ingredients;
        string instructions;
        string imageURL;
        uint256 votes;
        uint256 timestamp;
        bool isNFT;
        uint256 nftTokenId;
    }

    struct RecipeNFTMetadata {
        uint256 recipeId;
        address creator;
        uint256 mintPrice;
        uint256 royaltyPercent; // Royalty in percentage (e.g., 5 for 5%)
        string description;
        uint256 mintedAt;
        bool isForSale;
        uint256 salePrice;
    }

    // --- Mappings and Arrays ---
    mapping(uint256 => RecipeData) public recipes;
    mapping(uint256 => RecipeNFTMetadata) public nftMetadata; // tokenId => metadata
    mapping(uint256 => uint256) public recipeToNFT; // recipeId => tokenId

    // --- Gas-efficient NFT Sale Listing ---
    uint256[] private _nftsForSale;
    mapping(uint256 => uint256) private _nftForSaleIndex; // tokenId => index in _nftsForSale

    // --- Voting & Reputation ---
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public userReputation;

    // --- Events ---
    event RecipeSubmitted(address indexed creator, uint256 recipeId, string title);
    event RecipeVoted(address indexed voter, uint256 recipeId);
    event NFTMinted(address indexed creator, uint256 indexed tokenId, uint256 indexed recipeId, uint256 mintPrice);
    event NFTSold(address indexed seller, address indexed buyer, uint256 indexed tokenId, uint256 price);
    event NFTListedForSale(address indexed owner, uint256 indexed tokenId, uint256 price);
    event NFTRemovedFromSale(address indexed owner, uint256 indexed tokenId);
    event RoyaltyPaid(address indexed recipient, uint256 amount, uint256 indexed tokenId);

    // --- Constructor ---
    constructor(address _feeRecipient, uint256 _initialPlatformFeeBps) ERC721("Recipe Book NFT", "RECIPE") Ownable(msg.sender) {
        feeRecipient = _feeRecipient != address(0) ? _feeRecipient : msg.sender;
        setPlatformFee(_initialPlatformFeeBps);
    }

    // --- Recipe Functions ---

    /**
     * @dev Submits a new recipe.
     */
    function submitRecipe(string memory _title, string memory _ingredients, string memory _instructions, string memory _imageURL) public returns (uint256) {
        _recipeIdCounter++;
        uint256 newId = _recipeIdCounter;
        
        recipes[newId] = RecipeData({
            id: newId,
            creator: msg.sender,
            title: _title,
            ingredients: _ingredients,
            instructions: _instructions,
            imageURL: _imageURL,
            votes: 0,
            timestamp: block.timestamp,
            isNFT: false,
            nftTokenId: 0
        });
        
        emit RecipeSubmitted(msg.sender, newId, _title);
        return newId;
    }

    /**
     * @dev Allows a user to vote for a recipe, increasing the creator's reputation.
     */
    function voteRecipe(uint256 _recipeId) public {
        require(recipes[_recipeId].id != 0, "Invalid recipe id");
        require(!hasVoted[_recipeId][msg.sender], "Already voted");
        
        recipes[_recipeId].votes++;
        hasVoted[_recipeId][msg.sender] = true;
        
        userReputation[recipes[_recipeId].creator]++;
        
        emit RecipeVoted(msg.sender, _recipeId);
    }

    // --- NFT Functions ---

    /**
     * @dev Mints a recipe into an NFT. Can only be called by the recipe creator.
     */
    function mintRecipeNFT(uint256 _recipeId, uint256 _mintPrice, uint256 _royaltyPercent, string memory _description, string memory _tokenURI) public payable nonReentrant returns (uint256) {
        RecipeData storage recipe = recipes[_recipeId];
        require(recipe.id != 0, "Invalid recipe id");
        require(recipe.creator == msg.sender, "Not recipe creator");
        require(!recipe.isNFT, "Recipe already minted as NFT");
        require(_royaltyPercent <= MAX_ROYALTY_PERCENT, "Royalty too high");
        require(msg.value >= _mintPrice, "Insufficient payment");
        
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;
        
        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, _tokenURI);
        
        recipe.isNFT = true;
        recipe.nftTokenId = newTokenId;
        
        nftMetadata[newTokenId] = RecipeNFTMetadata({
            recipeId: _recipeId,
            creator: msg.sender,
            mintPrice: _mintPrice,
            royaltyPercent: _royaltyPercent,
            description: _description,
            mintedAt: block.timestamp,
            isForSale: false,
            salePrice: 0
        });
        
        recipeToNFT[_recipeId] = newTokenId;
        
        // Handle payment distribution
        if (msg.value > 0) {
            uint256 fee = (_mintPrice * platformFeeBps) / BPS_DIVISOR;
            if (fee > 0) {
                (bool success, ) = payable(feeRecipient).call{value: fee}("");
                require(success, "Fee transfer failed");
            }
            
            uint256 refund = msg.value - _mintPrice;
            if (refund > 0) {
                (bool refundSuccess, ) = payable(msg.sender).call{value: refund}("");
                require(refundSuccess, "Refund failed");
            }
        }
        
        emit NFTMinted(msg.sender, newTokenId, _recipeId, _mintPrice);
        return newTokenId;
    }

    /**
     * @dev Lists an NFT for sale.
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
     * @dev Removes an NFT from sale.
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
     * @dev Buys an NFT that is listed for sale.
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
     * @dev Returns all NFTs currently listed for sale. (Gas-efficient)
     */
    function getNFTsForSale() public view returns (uint256[] memory) {
        return _nftsForSale;
    }

    /**
     * @notice This function can be gas-intensive if the user owns many NFTs.
     * @dev For production, consider off-chain indexing or inheriting from ERC721Enumerable.
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

    function getTotalRecipes() public view returns (uint256) {
        return _recipeIdCounter;
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

    // --- Internal & Overrides ---

    /**
     * @dev Adds a token to the gas-efficient sale list.
     */
    function _addNFTToForSaleList(uint256 tokenId) private {
        _nftsForSale.push(tokenId);
        _nftForSaleIndex[tokenId] = _nftsForSale.length - 1;
    }

    /**
     * @dev Removes a token from the gas-efficient sale list.
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
     * @dev Custom burn function that cleans up associated storage.
     * Note: This doesn't override the internal _burn but provides a public burn interface.
     */
    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender || getApproved(tokenId) == msg.sender || isApprovedForAll(ownerOf(tokenId), msg.sender), "Not authorized to burn");
        
        RecipeNFTMetadata storage metadata = nftMetadata[tokenId];
        if (metadata.isForSale) {
            _removeNFTFromForSaleList(tokenId);
        }
        
        uint256 recipeId = metadata.recipeId;
        if (recipeId != 0) {
            recipes[recipeId].isNFT = false;
            recipes[recipeId].nftTokenId = 0;
            delete recipeToNFT[recipeId];
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