### Considerations while writing the contracts

. A root contract will used to link other contracts --> Name Resolve Contract
. Memory costs of the contracts scales quadratically --> Hence, more smaller contracts are more sensible than some big contracts
. Contracts can only read from their own memory and storage --> Getters must be present
. Contracts call each other using 'Message calls' which provide payload data and some gas. --> Some mechanic must provide contracts with sufficient gas
. Libraries are implemented with 'delegatecalls'. They don't change the context of the call but load code from a different contract.
. `require(condition)` calls at the start of a function return when the condition is not met. Compare to Swift's `guard` statement. But they consume all gas.
. Contracts cannot be called by themselves.
