# Redemption 🎮

Redemption is a production-ready, real-time multiplayer quiz platform built to address low-latency state orchestration challenges. The project isolates decoupling domains across an asynchronous full-stack infrastructure using a modular architecture powered by React, Node.js, Socket.io, and Redis.

## Project Vision & Context

### Motives
The project originated from a personal challenge to re-architect a real-time system from an earlier software engineering project where WebSocket state coordination was a primary technical blocker. "Redemption" serves as an end-to-end realization of real-time multi-client orchestration, exploring the underlying limits of persistent bidirectional channels, state caching, and decoupled system architectures.

### Objectives
* **Educational Deep-Dive:** Act as a comprehensive baseline sandbox to implement, benchmark, and document complex interactions across modern architectural layers (React, Express, Redis, Socket.io).
* **Reference Blueprint:** Provide a highly maintainable, documented technical ecosystem optimized for modular service transitions (e.g., extracting monolithic segments into standalone microservices or background queues).
* **Zero Production Overhead:** Designed strictly for non-commercial evaluation, profiling performance bottlenecks under highly simulated, concurrent connection conditions.

---

## Architecture Overview

Redemption uses a decoupled, event-driven architecture designed to minimize main-thread execution blocks while enforcing strong operational isolation.


+-------------------------------------------------------+
   |                  React Client (SPA)                   |
   +-------------------+-------------------------------+---+
                       |                               |
          REST APIs (JSON)                      WebSocket Tunnels
      [State-Gated / JWT Flows]               [Sub-100ms Sync Loops]
                       |                               |
                       v                               v
   +-------------------+-------------------------------+---+
   |               Express.js Application Server           |
   +-------------------+-------------------------------+---+
                       |                               |
            Persistent Storage                      In-Memory Cache
           [Relational Schema]                   [Volatile App State]
                       |                               |
                       v                               v
                 +-----------+                   +-----------+
                 |   MySQL   |                   |   Redis   |
                 +-----------+                   +-----------+


### 1. Dual-Channel Infrastructure
The application maintains two specialized layers to handle data propagation based on performance criteria:
* **Stateless REST Layer (Express.js / Node.js):** Manages non-real-time domain activities such as standard user authentication flows, profile settings tracking, and administrative Problem Set CRUD definitions over HTTP.
* **Persistent Event Layer (Socket.io / WebSockets):** Upgrades standard incoming HTTP connections to bi-directional TCP socket tunnels, executing state-synchronized gameplay loops, host infrastructure signals, and delta-score propagation.

### 2. Volatile State Caching (Redis)
To bypass relational database I/O overhead during rapid multiplayer gameplay interactions, the active memory footprint is split:
* **PostgreSQL** serves as the system's single source of truth for persistent entity definitions (User Profiles, Historical Records, structured Problem Sets).
* **Redis** functions as an in-memory database to store volatile transaction components. Active lobby state arrays, player socket assignments, and transient match score vectors are updated in-memory with target response speeds hitting **sub-100ms synchronization bounds**, protecting downstream storage instances from write-amplification failures.

---

## Minimum Viable Product (MVP) Feature Matrix

The platform implements a streamlined core suite divided into distinct business logical modules:

### 1. User Account & Security Management
* **Token-Based Authentication:** Employs session-gated JWT pipelines paired with industry-standard hashing algorithms to secure client sessions.
* **Asynchronous Sign-Up Verification:** Employs an out-of-band email workflow utilizing registration code verification to handle profile activation and prevent fake registrations.
* **Encrypted Recovery Workflows:** Implements secure password recovery workflows, using time-bound verification codes transmitted via email to validate user identities before granting modification access.
* **User Profile & Activity Tracking:**
  * **Historical Activity Logs:** Tracks all previously joined multiplayer match parameters.
  * **Login Attendance Matrix:** Maps historical login occurrences to an active visual calendar component.
  * **Performance Metrics Engine:** Aggregates user metrics to display highest achieved scores and participation frequencies.

### 2. Problem Set Content Lifecycle (CRUD)
* **Parent Group Definition:** Employs full CRUD control allowing users to construct, read, update, and delete parent problem set definitions (Titles, Categorizations, Descriptions).
* **Granular Problem Controls:** Delivers structural node editors within each subset, allowing real-time adjustments to question typologies, text values, explicit constraints (allocated processing times), multiple-choice options arrays, and sequential display hierarchy handled via interactive drag-and-drop elements.

### 3. Match Orchestration & Real-Time Lobbies

#### Room Initialization & Host Controls
Upon finalizing problem set configurations, room hosts can instantiate live match codes, unlocking the following event structures:
* **Lobby Locking:** Disables public socket discovery to prevent additional participants from connecting mid-match.
* **Participant Eviction:** Allows hosts to evict targeted socket IDs cleanly from the runtime room matrix.
* **Match Lifecycle Driving:** Initiates real-time gameplay routines across all linked participants or terminates rooms instantly at any point during active operations.

#### Participation & In-Game Execution
The framework allows authenticated users and temporary guest connections to engage simultaneously:
* **Guest Support Policy:** Allows unauthenticated players to join active rooms via room code handles; system ignores long-term score and history calculations for these temporary instances.
* **Host Interactivity Separation:** Hosts execute game lifecycle signals and observe downstream leaderboards while optionally participating in the prompt pipeline without injecting their metrics into active competitive score rankings.
* **Volatile Room Disconnection:** Supports client-initiated exit signals, ensuring connected channels are purged instantly from active memory slots upon leaving.

### 4. Post-Match History & Analysis Review
* **Historical Auditing:** Dedicated profile historical screens track completed match events.
* **Granular Response Replay:** Allows users to inspect and audit past answer choices, tracking target outcomes against the baseline keys for fully closed match states.
* **Bidirectional Navigation Controller:** Provides structural pagination modules allowing users to cycle forward and backward through past gameplay interactions.

---

## Installation & Environment Initialization

### Prerequisites
* Node.js (v18.x or above)
* PostgreSQL Instance
* Redis Server

### 1. Repository Setup
```bash
git clone [https://github.com/your-username/redemption.git](https://github.com/your-username/redemption.git)
cd redemption