# Crypto Prototype (Toy Blockchain)

The **Crypto Prototype** is a lightweight Python implementation of a blockchain system built to understand decentralized consensus and transaction validation fundamentals.  
It serves as a hands-on learning experiment in **blockchain architecture**, **proof-of-work mining**, and **node synchronization**.

---

## Overview
This project implements a functional toy blockchain that can:
- Create new blocks containing simulated transactions.  
- Validate blocks using a proof-of-work algorithm.  
- Link each block cryptographically via SHA-256 hashing.  
- Distribute updates across nodes via a simple networking layer.

The prototype emphasizes **clarity over complexity**, providing an educational foundation for understanding consensus mechanisms and distributed systems.

---

## Features
| Category | Description |
|-----------|-------------|
| `Proof-of-Work Algorithm` | Adjustable difficulty for mining simulation. |
| `Transaction Queue` | Handles unconfirmed transactions before block creation. |
| `Block Validation` | Ensures hash linkage and integrity. |
| `Networking (Flask)` | Enables basic node communication and synchronization. |
| `JSON Storage` | Persists blockchain state across sessions. |

---

## Tech Stack
- **Languages:** Python  
- **Libraries:** Flask, Hashlib, JSON, Time, Requests  
- **Concepts:** Proof-of-work, block validation, node sync, REST API  

---

## Highlights
- Built full blockchain loop: transaction → block → proof-of-work → validation → chain update.  
- Debugged early transaction-pool and hash-computation issues to achieve stable mining.  
- Added optional Flask API endpoints for peer-to-peer simulation.  
- Serves as an educational proof of concept for decentralized ledger systems.

---

## Media
Early example code

**Blockchain Prototype code**
![Blockchain Prototype code](../media/crypto_prototype/BlockchainPrototype.png)

**Node Server Prototype code**
![Node Prototype code](../media/crypto_prototype/NodeServerPrototype.png)

---

## Skills Demonstrated
- Blockchain fundamentals  
- Network communication with Flask  
- Data integrity and hashing  
- Python object-oriented design  
- Debugging and algorithm validation  

---

## Repository
This prototype is private.  
A summarized technical overview is available here:  
[github.com/JeremyB-py-Portfolio](https://github.com/JeremyB-py-Portfolio)
