// SPDX-License-Identifier: MIT

pragma solidity >=0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract StarNotary is ERC721 {

	struct Star {
		string name;
	}

	mapping(uint => Star) public tokenIdToStarInfo;
	mapping(uint => uint) public starsForSale;

	constructor() ERC721("Star Notary", "SN") {

	}

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

}