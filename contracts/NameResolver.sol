pragma solidity ^0.4.11;

/// @title Name Resolver for multiple contracts
/// Resolves contract names to their current version's address
contract NameResolver {
    address owner;
    mapping (bytes32 => address) backends;

    function NameResolver() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function getBackend(string contractName) returns (address) {
        return backends[keccak256(contractName)];
    }

    function changeBackend(string contractName, address newBackend) public onlyOwner() returns (bool) {
        bytes32 key = keccak256(contractName);
        if(newBackend != backends[key]) {
            backends[key] = newBackend;
            return true;
        }
        return false;
    }
}
