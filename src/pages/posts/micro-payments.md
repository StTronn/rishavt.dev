---
title: "Scaling Blockchain Payments: Payment Channel & Lightning Network"
description: "Understanding how payment channel works"
publishDate: "Tuesday, Nov 23 2023"
author: "Rishav Thakur"
heroImage: "/assets/blog/introducing-astro.jpg"
alt: "Blog Image"
layout: "../../layouts/BlogPost.astro"
---

# The Need for micro Payments
I will dive into this more in some other article but to quickly highlight on this. With mass adoption and digital assets/information/services increasing in value over time there is a need for fast/native monetization into this products. Also these services and information have a model of pay as you go and generally requires a small amount of payment. To build this type of payment model we have to reduce the payment cost/time for the user and the merchant. A fricton free low cost micropayment is required for the upcoming digital world we will be living in. Some examples can be newsletter, twitch streams.



# Payment Channel
In blockchain it cost a certain transaction fees to put a transaction on the blockchain. Also it is slow for example in bitcoin it takes 10mins for a new block to come up. Using bitcoin transaction for paying 1$ every 5 minute between you and some streaming,gaming service will cost you more in fees and will take time.

To solve this we can create a payment channel where you lock your funds for some duration by publishing a transaction on blockchain. Now both parties know the amount is locked once locked the sender can give reciver a transaction off chain relasing some amount from the locked transaction to the reciever. 


# 1 Way Channel
The gist of 1 way transaction is that you lock the sender transaction for a given period of time. Then you share signed transaction sending from locked transaction output to the reciver off chain.

You can define this as 3 function 

### Lock(amount,sender) 
Sender locks his/her amount with an refund expiry

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

# Bi Directional Payment Channel 
The problem with one way channel is that once a transaction is shared off-chain there is no real way of saying oh let's cancel this transaction.


To do this we create a form of revokable transactions on both parties, we have 2 set of transaction owned by each party, each party can revoke the transaction. Once both of them 
have revoked the transaction a new transaction can be formed.

So the basic idea is you create a fund transaction in 2-2 multi sig and now you have 2 commitment transaction on each side which spends from the fund output. 
Each commitment  transaction is created by 
The revokable transaction is designed with an expiry time where they both get back the money back after the expiry period.

## Funding Transaction
An initial channel Funding Transaction is created whereby one or both channel counterparties fund the inputs of this transaction. Both parties create
the inputs and outputs for this transaction but do not sign the transaction.

The output for this Funding Transaction is a single 2-of-2 multisignature script with both participants in this channel, henceforth named Alice
and Bob. Both participants do not exchange signatures for the Funding
Transaction until they have created spends from this 2-of-2 output refunding the original amount back to its respective funders. The purpose of not
signing the transaction allows for one to spend from a transaction which
does not yet exist.

![funding.png](/assets/blog/micro-payments/funding.png)

In short the idea is to create a funding transaction and two commitment transaction spending from that transaction which allows both parties to redeem there funds back from the funding transaction.
Note the commitment transaction are exchanged off-chain and aggreed to first before the funding transaction is relayed to blockchain



## Adding Revokability on both parties 
Once the commitment transaction is shared we want a way to generate a new set of transactions that gives more money to reciever. The sender can create such a transaction off-chain and send to the reciever, the problem here is that the sender can push the original commitment transaction on blockchain cause it still is valid. So to ensure the payment is done reciever must have some proof that the old commitment transaction held by the 
sender is invalid.



![revoke1.png](/assets/blog/micro-payments/revoke1.png)
![revoke2.png](/assets/blog/micro-payments/revoke2.png)

The way revokable transaction works is that the output is valid to the the orignator address after 100 blocks confirmation or to the address of holder_public_key+orignator_rev_public. So by default the transaction is going to the orignator but if he/she wants to revoke it they share the private key of orignator_rev_public_key which allows holder to take this money hence revoking the claim of money by orignator cause the holder can claim this before 100 blocks confirmation and move it by creating another transaction. 

Now whenever balance is needed to be updated between the 2 parties, the sender creates a new transaction the reciver acknowledges it by sending the corresponding transaction for the new updated balance and also revoking the previous transaction and finally sender revokes the previous transaction.

## Another way to look at Bi Directional Payment channel 
One way to think about is that the parties agree on both their balances. So they lock the money and set balance at the time of contract creation.

Now to update the balances both parties can submit claim to the blockchain, Let's say Alice submits the claim saying she gets 0.2 eth more, we update the recivables and increase the claim period so that Bob can also submit his claim. If the claim period expires we assume he didn't get money and let withdraw happen.

Our Claim function checks wether the transaction is the newest one or not. If not it disregards it.

### What happens when there is a dispute
Lets take an example 

Initial State:

Alice and Bob each deposit 10 ETH into the payment channel contract. The contract records: Alice's balance = 10 ETH, Bob's balance = 10 ETH.
First Transaction:

Alice pays Bob 1 ETH. They both sign a new balance record: Alice's balance = 9 ETH, Bob's balance = 11 ETH.
Second Transaction:

Bob pays Alice 0.5 ETH. New balance record (signed): Alice's balance = 9.5 ETH, Bob's balance = 10.5 ETH.

Now Alice submits the final transaction that is 9.5 ETH to the claim function the claim function gives some time to bob to submit a claim as well before closing the channel. Now bob's tries to cheat and submit the First transaction to the claim function where Alice gets 9 and Bob 11 instead of 10.5. The First transaction has a lower nonce than the second transaction so it gets rejected.

Also the contract has a normal expiry time in case if no transaction is exchanged the inital balances is refunded after 100 blocks to respective party

I will add the solidity code for this soon.


# Hashed Timelock contracts (HTLCs)
Let's say you want to make the payment to multiple people opening direct payment channels with these multiple people is costly, But there might be an indirect path i.e if you want to pay to carol, also bob and carol have a payment channel between them. You can route your payment to carol through bob. 

To do this you share the transaction which can be unlocked with a pre-image that only carol knows Bob gets your money if he knows the pre-image secret and bob creates another transaction where carol gets bob's money if she knows preimage's secret


![HTLC.png](/assets/blog/micro-payments/HTLC.png)


# Reference 
I took reference from the lightning network paper https://lightning.network/lightning-network-paper.pdf and lecture by one of the authors https://youtu.be/Hzv9WuqIzA0?si=OvCB0Uoml8GhDcFX 

For Uni Directional payment channel https://solidity-by-example.org/app/uni-directional-payment-channel/ 

