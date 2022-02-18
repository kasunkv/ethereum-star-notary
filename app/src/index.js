import Web3 from "web3";
import StarNotary from "../../build/contracts/StarNotary.json";

const App = {
  web3: null,
  account: null,
  meta: null,

  start: async function() {
    const { web3 } = this;

    try {
      // get contract instance
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = StarNotary.networks[networkId];
      this.meta = new web3.eth.Contract(
        StarNotary.abi,
        deployedNetwork.address,
      );

      // get accounts
      const accounts = await web3.eth.getAccounts();
      this.account = accounts[0];

      this.refreshBalance();
    } catch (error) {
      console.error("Could not connect to contract or chain.");
    }
  },

  refreshBalance: async function() {
    const { balanceOf } = this.meta.methods;
    const balance = await balanceOf(this.account).call();

		const addressElement = document.getElementById("walletAddress");
		addressElement.innerHTML = this.account;

    const balanceElement = document.getElementById("walletBalance");
    balanceElement.innerHTML = `${balance} star(s)`;
  },

  setStatus: function(message) {
    const status = document.getElementById("status");
    status.innerHTML = message;
		if (status.classList.contains('hide')) {
			status.classList.remove('hide');
		}
  },

  createStar: async function() {
    const { createStar } = this.meta.methods;

		const starNameElement = document.getElementById("starName");
		const starIdElement = document.getElementById("starId");

    const name = starNameElement.value;
    const id = starIdElement.value;

    await createStar(name, id).send({from: this.account});

		starNameElement.value = '';
		starIdElement.value = '';

		App.setStatus("New Star Owner is " + this.account + ".");
  },

	findStar: async function() {
		const { lookUpTokenIdToStarInfo } = this.meta.methods;

		const starIdToFindElement = document.getElementById("starIdToFind");
		const id = starIdToFindElement.value;

		const starName = await lookUpTokenIdToStarInfo(id).call();

		starIdToFindElement.value = '';

		if (starName) {
			App.setStatus(`Star Found :) The Star name is ${starName}`);
		} else {
			App.setStatus(`Star not found. :(`);
		}


	}
};

window.App = App;

window.addEventListener("load", function() {
  if (window.ethereum) {
    // use MetaMask's provider
    App.web3 = new Web3(window.ethereum);
    window.ethereum.enable(); // get permission to access accounts
  } else {
    console.warn(
      "No web3 detected. Falling back to http://127.0.0.1:8545. You should remove this fallback when you deploy live",
    );
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    App.web3 = new Web3(
      new Web3.providers.HttpProvider("http://127.0.0.1:8545"),
    );
  }

  App.start();
});
