// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract MXNBRewardsDistributor {
    IERC20 constant MXNB_TOKEN =
        IERC20(0x82B9e52b26A2954E113F94Ff26647754d5a4247D);

    address owner;

    uint256 constant DEFAULT_REWARD = 20 * 10 ** 6;

    mapping(address => uint256) public allocatedRewards;

    mapping(address => uint256) public claimCounts;

    address[] rewardAddresses;

    event RewardDistributed(address indexed recipient, uint256 amount);
    event RewardAllocated(address indexed recipient, uint256 amount);
    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );
    event ClaimCountIncreased(address indexed recipient, uint256 newClaimCount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function allocateReward(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient address");

        if (allocatedRewards[_recipient] == 0) {
            rewardAddresses.push(_recipient);
        }

        allocatedRewards[_recipient] = DEFAULT_REWARD;
        emit RewardAllocated(_recipient, DEFAULT_REWARD);
    }

    function allocateCustomReward(
        address _recipient,
        uint256 _amount
    ) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient address");
        require(_amount > 0, "Amount must be greater than 0");

        if (allocatedRewards[_recipient] == 0) {
            rewardAddresses.push(_recipient);
        }

        allocatedRewards[_recipient] = _amount;
        emit RewardAllocated(_recipient, _amount);
    }

    function distributeReward(address _recipient) external onlyOwner {
        require(_recipient != address(0), "Invalid recipient address");

        uint256 rewardAmount = allocatedRewards[_recipient];

        if (rewardAmount == 0) {
            return;
        }

        require(
            MXNB_TOKEN.balanceOf(address(this)) >= rewardAmount,
            "Insufficient contract balance"
        );

        allocatedRewards[_recipient] = 0;

        require(
            MXNB_TOKEN.transfer(_recipient, rewardAmount),
            "Token transfer failed"
        );

        claimCounts[_recipient]++;
        emit ClaimCountIncreased(_recipient, claimCounts[_recipient]);

        emit RewardDistributed(_recipient, rewardAmount);
    }

    function getAllocatedReward(
        address _recipient
    ) external view returns (uint256) {
        return allocatedRewards[_recipient];
    }

    function getClaimCount(address _recipient) external view returns (uint256) {
        return claimCounts[_recipient];
    }

    function getContractBalance() external view returns (uint256) {
        return MXNB_TOKEN.balanceOf(address(this));
    }

    function emergencyWithdraw(address _to) external onlyOwner {
        require(_to != address(0), "Invalid recipient address");
        uint256 balance = MXNB_TOKEN.balanceOf(address(this));
        require(balance > 0, "No tokens to withdraw");
        require(MXNB_TOKEN.transfer(_to, balance), "Token transfer failed");
    }

    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "New owner cannot be zero address");
        emit OwnershipTransferred(owner, _newOwner);
        owner = _newOwner;
    }
}
