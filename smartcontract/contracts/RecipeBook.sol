// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract RecipeBook {
    uint256 private _recipeIdCounter;
    address public owner;

    struct Recipe {
        uint256 id;
        string title;
        string description;
        string imageUrl;
        address creator;
    }

    Recipe[] public recipes;

    event RecipeAdded(uint256 id, string title, address creator);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    function addRecipe(string memory _title, string memory _description, string memory _imageUrl) public {
        _recipeIdCounter++;
        uint256 newId = _recipeIdCounter;
        recipes.push(Recipe({
            id: newId,
            title: _title,
            description: _description,
            imageUrl: _imageUrl,
            creator: msg.sender
        }));
        emit RecipeAdded(newId, _title, msg.sender);
    }

    function getAllRecipes() public view returns (Recipe[] memory) {
        return recipes;
    }

    function getRecipe(uint256 _id) public view returns (Recipe memory) {
        require(_id > 0 && _id <= _recipeIdCounter, "Invalid recipe id");
        return recipes[_id - 1];
    }

    function getTotalRecipes() public view returns (uint256) {
        return _recipeIdCounter;
    }

    function transferOwnership(address newOwner) public onlyOwner {
        require(newOwner != address(0), "New owner is the zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    function renounceOwnership() public onlyOwner {
        emit OwnershipTransferred(owner, address(0));
        owner = address(0);
    }
}