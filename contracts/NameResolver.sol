pragma solidity ^0.4.11;

/// @title Name Resolver for multiple contracts
/// Resolves contract names to their current version's address
contract NameResolver {
    address owner;
    // Mapping is public and can be retrieved by any frontend
    mapping (string => address) public backends;
    // TODO: Consider adding history of previous backends

    function NameResolver() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    function changeBackend(string contractName, address newBackend) public
    onlyOwner()
    returns (bool) {
        if(newBackend != backends[contractName]) {
            backends[contractName] = newBackend;
            return true;
        }

        return false;
    }
}
