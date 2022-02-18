const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', async (accounts) => {

	let sut;

	const ownerAccount = accounts[0];
	const firstUserAccount = accounts[1];
	const secondUserAccount = accounts[2];

	before(async () => {
		sut = await StarNotary.deployed();
	});



});
