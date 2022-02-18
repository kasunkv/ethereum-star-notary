// SPDX-License-Identifier: MIT

pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

	struct Star {
		string name;
	}

	mapping(uint => Star) public tokenIdToStarInfo;
	mapping(uint => uint) public starsForSale;

	// Name and the symbol for the token can be passed in as base constructor arguments,
	// ERC721.sol from openzeppelin implements the properties needed to hold the values
	constructor() ERC721("Star Notary", "SN") { }

	function createStar(string memory _name, uint _tokenId) public {
		Star memory newStar = Star(_name);
		tokenIdToStarInfo[_tokenId] = newStar;

		_safeMint(msg.sender, _tokenId);
	}

	function putStarUpForSale(uint _tokenId, uint _price) public {
		require(ownerOf(_tokenId) == msg.sender, "You can't sell a star that you don't own");

		starsForSale[_tokenId] = _price;
	}

	function buyStar(uint _tokenId) public payable {
		require(starsForSale[_tokenId] > 0, "Star is not up for sale");

		uint starCost = starsForSale[_tokenId];
		address ownerAddress = ownerOf(_tokenId);

		require(msg.value > starCost, "Not enough ether to buy the star");

		// to bypass the checks that are inplace in other transfaer functions, using the _transfer function
		_transfer(ownerAddress, msg.sender, _tokenId);

		payable(ownerAddress).transfer(starCost);

		if (msg.value > starCost) {
			payable(msg.sender).transfer(msg.value - starCost);
		}
	}

	function lookUpTokenIdToStarInfo(uint _tokenId) public view returns (string memory) {
		return tokenIdToStarInfo[_tokenId].name;
	}

	function exchangeStars(uint _tokenId1, uint _tokenId2) public {
		require(_exists(_tokenId1) && _exists(_tokenId2), "Both tokens must exist");
		require(starsForSale[_tokenId1] == 0 && starsForSale[_tokenId2] == 0, "Tokens can not be up for sale");

		address token1Owner = ownerOf(_tokenId1);
		address token2Owner = ownerOf(_tokenId2);

		require(token1Owner == msg.sender || token2Owner == msg.sender, "You must own one of the tokens to exchange");

		// Value of the token is ignored as per the requirement
		// Token must not be up for sale to be exchanged. (assumption)
		if (token1Owner == msg.sender) { // Sender is the owner of token1
			_transfer(token2Owner, msg.sender, _tokenId2); // transfer token2 to msg.sender
			_transfer(msg.sender, token2Owner, _tokenId1); // transder token1 to token2 owner
		} else {
			_transfer(token1Owner, msg.sender, _tokenId1); // transfer token1 to msg.sender
			_transfer(msg.sender, token1Owner, _tokenId2); // transfer token2 to token1 Owner
		}
	}

	function transferStar(address _to, uint _tokenId) public {
		require(ownerOf(_tokenId) == msg.sender, "Must own the token to transfer");

		_transfer(msg.sender, _to, _tokenId);
	}

}