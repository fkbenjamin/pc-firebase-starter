# PassChain

Authors: Rob-Jago Flötgen, Florian Liss, Lars Lütjens, Niklas Reiter

Created for blc-psi 2017

## Installation

### Download

PassChain uses `npm` as Package Manager, `webpack` for compilation and `React` for the frontend. It uses `Parity` as a client ot interact with the Ethereum Blockchain

Install Parity (one line installer for Mac and Ubuntu) or [full installation guideline](https://github.com/paritytech/parity):

```bash
bash <(curl https://get.parity.io -Lk)
```

Clone the repository into your favorite folder:

```
$ cd ~/favorite-folder/
$ git clone git@github.com:fkbenjamin/pc-firebase-starter.git passchain
```

Download dependencies:

```
$ cd passchain/
$ npm install -g webpack
$ npm install
```

To build:

```
webpack --watch
```

Files will be build into `dist/`. To access the dapp from parity, symlink your folder to the parity/apps folder:

### Make app visible in Parity

([Source of the following paragraph](https://github.com/paritytech/parity/wiki/Tutorial-Part-1))

To get Parity to discover your dapp, it needs to be placed into a place that Parity will see it - its local "dapps" directory. We will make a symbolic link for our dapp's dist directory (containing all of the ready-built dapp) in Parity's dapp directory.

Parity's directory structure is different depending on your system. For Mac, Parity's local dapp directory sits at `$HOME/Library/Application Support/io.parity.ethereum/dapps`, so you'll need to enter:

```
For Mac systems
ln -s $PWD/dist $HOME/Library/Application\ Support/io.parity.ethereum/dapps/mydapp
```

For Linux it's `$HOME/.local/share/io.parity.ethereum/dapps` - in this case you'd want to enter:

```
# For Linux systems
ln -s $PWD/dist $HOME/.local/share/io.parity.ethereum/dapps/mydapp
```

For Windows, it's in `%APPDATA%/Parity/Ethereum/dapps` - here you'd want to enter:

```
%=For Windows systems=%
mklink /D "%APPDATA%/Parity/Ethereum/dapps/mydapp" "%cd%/dist"
```

Once you have it linked, you should start (or restart, if already running) Parity and head to the Applications page of Parity Wallet. There you'll see your new dapp.

You should be able to access your Dapp now via Parity on http://127.0.0.1:8180/#/app/firebase-starter

### Deploy contract infrastructure

PassChain uses six contracts to store data and to interact with the user. Either you can use the predefined addresses in the code or deploy the contracts by yourself. For deploying the contracts you need to:

```bash
$ cd ./contracts/
./contracts$ mkdir out
./contracts$ solc -o out/ --bin --abi --optimize --overwrite Embassy.sol Citizen.sol Nation.sol NameRegistry.sol Immigration.sol
```

You won't get a feedback but there will be *.abi and *.sol files in the out/ folder. Use these files to deploy each contract to the Blockchain one after another. This order is recommended to meet the dependencies of the contracts:

1. NameRegistry
2. Storage
4. Citizen
3. Embassy
4. Immigration
5. Nation

Contracts will have links to each other to call their functions so you have to make sure all pointers are correctly set before using the infrastructure.

For further explanation of the contracts' functions and the dependencies please refer to the documentation.

### Link contracts to app

Open app.jsx in `src/client/scripts/app.jsx` and change the following lines to your contracts's addresses:

```javascript
//all contracts
this.contract = parity.bonds.makeContract('0xca16D554f2974F32C16212c6C39e678dA958b50e', abi.getStorageABI()); // v0.6
this.immigration = parity.bonds.makeContract('0x42Da049B7E5c7AAcF5506cE7198b1a7B23070C93', abi.getImmigrationABI()); //v0.8
this.citizen = parity.bonds.makeContract('0x90f8092B9f6E596D8D2937c971D64B93f866dD80', abi.getCitizenABI()); // v0.4
this.nation = parity.bonds.makeContract('0x75e0292B68FaADc14B4Ac64E7ED6D6A1b2706654', abi.getNationABI()); // v0.5
this.embassy = parity.bonds.makeContract('0x13477Ff61aF4337434ACC1df74c31Dff68E368a5', abi.getEmbassyABI()); // v0.7
this.nameresolver = parity.bonds.makeContract('0x53708Ea1EF858086Afcb2E063E5CA7CDF7EC9d76', abi.getNameresolverABI()); // v0.4
```

The ABI of your contracts have to go into `ABI.jsx`. Please change the respectives ABIs.

### Setup a firebase instance

Some data is not stored on the Ethereum Blockchain as it is simply too expensive to store large amounts of data. This includes the Passports and the Pass pictures. If you do not want to use the default Firebase project for this, you have to create your own Firebase project and add the URL to it to `fireclass.jsx`.
