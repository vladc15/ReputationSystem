pragma solidity >=0.7.0 <0.9.0;

contract DIDRegistry {
    mapping(address => string) public dids; // mapping between address and DID

    event DIDRegistered(address indexed user, string did);

    function registerDID(string calldata did) external {
        require(bytes(dids[msg.sender]).length == 0, "DID already registered.");
        dids[msg.sender] = did;
        emit DIDRegistered(msg.sender, did);
    }

    function isRegistered(address user) external view returns (bool) {
        return bytes(dids[user]).length > 0;
    }

    function getDID(address user) external view returns (string memory) {
        require(bytes(dids[user]).length > 0, "DID not registered.");
        return dids[user];
    }
}
