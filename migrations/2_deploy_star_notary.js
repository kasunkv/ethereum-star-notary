const StarNotary = artifacts.require("StarNotary");

module.exports = async function(deployer) {
  await deployer.deploy(StarNotary);
};
