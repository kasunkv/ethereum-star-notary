const StarNotary = artifacts.require('StarNotary');

contract('StarNotary', async (accounts) => {

	let sut;

	const ownerAccount = accounts[0];
	const firstUserAccount = accounts[1];
	const secondUserAccount = accounts[2];

	before(async () => {
		sut = await StarNotary.deployed();
	});

	it('Can create a star', async () => {
		const tokenId = 1;

		await sut.createStar('Awesome Star', tokenId, { from: ownerAccount });
		const starName = await sut.tokenIdToStarInfo.call(tokenId);

		assert.equal(starName, 'Awesome Star');
	});

	it('Lets user1 put up their star for sale', async () => {
		const starId = 2;
		const starPrice = web3.utils.toWei('0.01', 'ether');

		await sut.createStar('More Awesome Star', starId, { from: firstUserAccount });
		await sut.putStarUpForSale(starId, starPrice, { from: firstUserAccount });

		const salePrice = await sut.starsForSale.call(starId);

		assert.equal(salePrice, starPrice);
	});

	it('Lets user1 get the funds after the sale', async () => {
		const starId = 3;
		const starPrice = web3.utils.toWei('0.01', 'ether');
		const balance = web3.utils.toWei('0.05', 'ether');

		await sut.createStar('More More Awesome Star', starId, { from: firstUserAccount });
		await sut.putStarUpForSale(starId, starPrice, { from: firstUserAccount });


		const balanceOfFirstUserBeforeTransaction = await web3.eth.getBalance(firstUserAccount);
		await sut.buyStar(starId, { from: secondUserAccount, value: balance });
		const balanceOfFirstUserAfterTransaction = await web3.eth.getBalance(firstUserAccount);

		const value1 = Number(balanceOfFirstUserBeforeTransaction) + Number(starPrice);
		const value2 = Number(balanceOfFirstUserAfterTransaction);

		assert.equal(value1, value2);
	});

	it('lets user2 buy a star, if it is put up for sale', async() => {
    const starId = 4;
    const starPrice = web3.utils.toWei(".01", "ether");
    const balance = web3.utils.toWei(".05", "ether");

    await sut.createStar('Super Awesome Star', starId, {from: firstUserAccount});
    await sut.putStarUpForSale(starId, starPrice, {from: firstUserAccount});

    await sut.buyStar(starId, {from: secondUserAccount, value: balance});
		const newOwner = await sut.ownerOf.call(starId);

    assert.equal(newOwner, secondUserAccount);
	});

	it('lets user2 buy a star and decreases its balance in ether', async() => {
		const starId = 5;
		const starPrice = web3.utils.toWei(".01", "ether");
		const balance = web3.utils.toWei(".05", "ether");

		await sut.createStar('Super Super Awesome Star', starId, {from: firstUserAccount});
		await sut.putStarUpForSale(starId, starPrice, {from: firstUserAccount});

		const balanceOfSecondUserBeforeTransaction = await web3.eth.getBalance(secondUserAccount);

		await sut.buyStar(starId, {from: secondUserAccount, value: balance});

		const balanceAfterSecondUserBuysStar = await web3.eth.getBalance(secondUserAccount);

		const value = Number(balanceOfSecondUserBeforeTransaction) - Number(balanceAfterSecondUserBuysStar);

		assert.isTrue(balanceAfterSecondUserBuysStar < balanceOfSecondUserBeforeTransaction);

	});

	it('can add the star name and star symbol properly', async() => {
    const tokenName = await sut.name();
		const tokenSymbol = await sut.symbol();

		assert.equal(tokenName, 'Star Notary');
		assert.equal(tokenSymbol, 'SN');
	});

	it('lets 2 users exchange stars', async() => {
		// 1. create 2 Stars with different tokenId
		const starId1 = 6;
		await sut.createStar('Super Nova', starId1, {from: firstUserAccount});

		const starId2 = 7
		await sut.createStar('Super Super Nova', starId2, {from: secondUserAccount});

		// 2. Call the exchangeStars functions implemented in the Smart Contract
		// first user wants to exchange the stars with second user
		await sut.exchangeStars(starId1, starId2, {from: firstUserAccount});

		// 3. Verify that the owners changed
		const starId1Owner = await sut.ownerOf.call(starId1);
		const starId2Owner = await sut.ownerOf.call(starId2);

		assert.equal(starId1Owner, secondUserAccount);
		assert.equal(starId2Owner, firstUserAccount);
	});

	it('lets a user transfer a star', async() => {
		// 1. create a Star with different tokenId
		const starId = 8;
		await sut.createStar('Super Duper Nova', starId, {from: firstUserAccount});

		const originalOwner = await sut.ownerOf.call(starId);

		// 2. use the transferStar function implemented in the Smart Contract
		await sut.transferStar(secondUserAccount, starId, {from: firstUserAccount});
		const newOwner = await sut.ownerOf.call(starId);

		// 3. Verify the star owner changed.
		assert.notEqual(originalOwner, newOwner);
		assert.equal(newOwner, secondUserAccount);
	});

	it('lookUptokenIdToStarInfo test', async() => {
		// 1. create a Star with different tokenId
		const starId = 9;
		await sut.createStar('I ran out of names', starId, {from: firstUserAccount});

		// 2. Call your method lookUptokenIdToStarInfo
		const starName = await sut.lookUpTokenIdToStarInfo.call(starId);

		// 3. Verify if you Star name is the same
		assert.equal(starName, 'I ran out of names');
	});

});
