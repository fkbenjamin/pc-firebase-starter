pragma solidity ^0.4.11;

import "./mortal.sol";

/// @title Name Resolver for multiple contracts
/// Resolves contract names to their current version's address
contract NameResolver is owned, mortal {

    mapping (bytes32 => address) public backends;

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
