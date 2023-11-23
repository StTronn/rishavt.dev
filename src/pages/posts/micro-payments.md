---
title: "Micro Payments: Payment Channel & Lightning Network"
description: "Understanding Micro Payments and how to implement it"
publishDate: "Tuesday, Nov 23 2023"
author: "Rishav Thakur"
heroImage: "/assets/blog/introducing-astro.jpg"
alt: "Blog Image"
layout: "../../layouts/BlogPost.astro"
---


# 1 Way Channeli
The gist of 1 way transaction is that you lock the sender transaction for a given period of time and you share signed transaction sending from that output to the reciver off chain.

You can define this as 3 function 

### Lock(amount,sender) 

### Send(signed_transaction) (off chain)
sender sends the signed transaction to reciver where amount <=lock_amount. This is sent Off chain

### Collect(signed_transaction) 
reciver relays one of the transaction to the blockchain he got from sender off chain and 


### Cancel()
Once the lock time expires the sender gets his money back if collect hasn't been called  


## Bitcoin Implementation

### Locking and Cancel
There is a 2 step process to Lock a transaction, the sender create a multi-sig transaction which between reciver and sender,
Lets call the transaction Id for this transaction TxId_multi

but before it relays the transaction to the blockchain it asks the reciver to sign txId_multi and sending the amount back to alice but with a lock time of lets say week, This is bascially a refund transaction.

So sender has locked his/her money which requires both parties signature and will get a total refund if nothing happens in a week

If we see from above function we have implemented Lock and Cancel with a time period of a week. 


![lock.png](/assets/blog/micro-payments/lock.png)
![refund.png](/assets/blog/micro-payments/refund.png)

### Send and Collect
For collect Sender simply sends a transaction spending from the relayed transaction output and giving few coins to the reciver and keeping the change 

This is simillar to refund transaction expect the sender signs it and sends it to receiver, where he can sign it as well and collect the money. 


Note in Refund transaction it is slightly opposite that the reciver sends his/her signature and gives it to sender where as here it is sender sending the signature


## Ethereum Implementation

### Locking and Cancel 
We create a smart contract which takes the sender tokens when creating contract and allows the contract to self destruct after the lock period time and send the money back to sender 

reciver can see the contract and know that the money is locked

### Send and Collect 
Sender sends his/her signed transaction with some amount tx <- sign(amount,sender_pk)
Sends the tx off chain to the reciver

Collect function expects a transaction sees the amount and sees if the signer is sender then sends the funds to the caller of Collect function 

reciver can call Collect function passing the signed transaction by sender.

```
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.5/contracts/utils/cryptography/ECDSA.sol";
import "github.com/OpenZeppelin/openzeppelin-contracts/blob/release-v4.5/contracts/security/ReentrancyGuard.sol";

contract UniDirectionalPaymentChannel is ReentrancyGuard {
    using ECDSA for bytes32;

    address payable public sender;
    address payable public receiver;

    uint private constant DURATION = 7 * 24 * 60 * 60;
    uint public expiresAt;

    constructor(address payable _receiver) payable {
        require(_receiver != address(0), "receiver = zero address");
        sender = payable(msg.sender);
        receiver = _receiver;
        expiresAt = block.timestamp + DURATION;
    }

    function _getHash(uint _amount) private view returns (bytes32) {
        // NOTE: sign with address of this contract to protect agains
        // replay attack on other contracts
        return keccak256(abi.encodePacked(address(this), _amount));
    }

    function getHash(uint _amount) external view returns (bytes32) {
        return _getHash(_amount);
    }

    function _getEthSignedHash(uint _amount) private view returns (bytes32) {
        return _getHash(_amount).toEthSignedMessageHash();
    }

    function getEthSignedHash(uint _amount) external view returns (bytes32) {
        return _getEthSignedHash(_amount);
    }

    function _verify(uint _amount, bytes memory _sig) private view returns (bool) {
        return _getEthSignedHash(_amount).recover(_sig) == sender;
    }

    function verify(uint _amount, bytes memory _sig) external view returns (bool) {
        return _verify(_amount, _sig);
    }

    function close(uint _amount, bytes memory _sig) external nonReentrant {
        require(msg.sender == receiver, "!receiver");
        require(_verify(_amount, _sig), "invalid sig");

        (bool sent, ) = receiver.call{value: _amount}("");
        require(sent, "Failed to send Ether");
        selfdestruct(sender);
    }

    function cancel() external {
        require(msg.sender == sender, "!sender");
        require(block.timestamp >= expiresAt, "!expired");
        selfdestruct(sender);
    }
}


```


