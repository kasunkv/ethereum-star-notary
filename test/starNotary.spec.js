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

});
