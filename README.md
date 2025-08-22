# 🌐 DeSocial 🧑‍💻  
*A Decentralized Social Media Platform on ICP*  

DeSocial is a decentralized social media platform built on the **Internet Computer Protocol (ICP)**. Unlike traditional social media platforms, DeSocial gives users **full ownership** of their identity, data, and content. It is censorship-resistant, scalable, and provides a real-time social experience.  

This repository contains the full-stack dApp setup using:  
- **Rust** canisters (backend)  
- **React.js** (frontend)  
- **Candid** (IDL interface)  

Our goal: **To build the future of open networking** 🚀  

---

## ✨ Features (100% Detailed)

✅ **Self-sovereign Identity** – Users fully own and manage their profiles.  
✅ **User-owned Content** – Posts are stored on ICP canisters, ensuring ownership and immutability.  
✅ **Create / Edit / Delete Posts** – Full post lifecycle supported.  
✅ **Social Interactions** – Like, comment, and repost any post.  
✅ **Follow/Unfollow System** – Build decentralized connections with no central authority.  
✅ **Real-time Messaging** – Peer-to-peer chat powered by ICP.  
✅ **Notifications** – Instant updates for likes, comments, reposts, and follows.  
✅ **Profile Management** – Create, edit, and view user profiles.  
✅ **View Other Profiles** – Check posts, followers, and following of any user.  
✅ **Sharded Canisters** – Ensures scalability and reliability under load.  
✅ **On-chain Data Ownership** – All data is stored securely on ICP with no single point of failure.  

---

## 🧱 Tech Stack

- **Frontend**: React.js (for UI + real-time updates)
- **Backend**: Rust canisters using `ic-cdk`
- **IDL/Interface**: Candid
- **Dev Tooling**: `dfx`, `npm`, `cargo`
- **Deployment**: Local replica or ICP mainnet

---

## 🏗️ Project Flow

```mermaid
flowchart TD
    A[Register/Login] --> B[Create Profile]
    B --> C[Create/Edit/Delete Post]
    C --> D[Feed Updates]
    D --> E[Like/Comment/Repost]
    D --> F[Follow/Unfollow]
    D --> G[Real-time Messaging]

    %% On-demand access from anywhere
    M((Global Menu))
    A -.-> M
    B -.-> M
    C -.-> M
    D -.-> M
    E -.-> M
    F -.-> M
    G -.-> M
    M --> H[View Profile]
    M --> I[Notifications]

    %% Notifications are triggered by these events
    E --> I
    F --> I
    G --> I

```

---

## 🎥 Project Demo

🔗 [Watch Demo Video](https://youtu.be/0Qh6rBteXz8?feature=shared)  

---

## 🚀 Getting Started (Local Development)

### 1️⃣ Install DFX SDK

```bash
sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"
dfx --version
```

### 2️⃣ Start Local Replica

```bash
dfx start --background
```
This boots the Internet Computer locally.  

### 3️⃣ Deploy Canisters

```bash
dfx deploy
```
- Compiles Rust backend canisters
- Generates Candid interface files
- Deploys frontend + backend to local replica

App will be available at:  
```
http://localhost:4943?canisterId=<asset_canister_id>
```

### 4️⃣ Regenerate Candid Bindings (Optional)

If backend Rust canister changes:  
```bash
npm run generate
```
This regenerates frontend actor bindings from Candid files.  

### 5️⃣ Start Frontend (React Dev Server)

```bash
npm start
```
Frontend runs at:  
```
http://localhost:8080
```
(API requests are proxied to port `4943`).  

---

## 📁 Directory Structure

```
de_social/
├── src/
│   ├── de_social_backend/      # Rust canister logic
│   └── de_social_frontend/     # React app with agent bindings
├── dfx.json                    # Canister + network config
├── package.json                # Frontend + generate scripts
└── README.md                   # You're here
```

---

## 🌐 Production Notes

When deploying to **ICP mainnet**, disable root key fetching. Options:  

1. Set environment variable:  
   ```bash
   export DFX_NETWORK=ic
   ```  

2. Use `env_override` in `dfx.json`:  
   ```json
   "canisters": {
     "de_social_backend": {
       "declarations": {
         "env_override": "ic"
       }
     }
   }
   ```

3. Write a custom `createActor()` function with hardcoded host/network.  

---

## 🧪 Useful Commands

```bash
dfx start --background     # Start local replica
dfx deploy                 # Deploy canisters
npm start                  # Start frontend dev server
npm run generate           # Generate bindings from Candid
dfx stop                   # Stop local replica
```

---

## 📚 Developer References

- [ICP Quick Start](https://internetcomputer.org/docs/current/developer-docs/setup/deploy-locally)  
- [Rust Canister Guide](https://internetcomputer.org/docs/current/developer-docs/backend/rust/)  
- [Candid Syntax](https://internetcomputer.org/docs/current/developer-docs/backend/candid/)  
- [ic-cdk (Rust SDK)](https://docs.rs/ic-cdk)  
- [ic-cdk-macros](https://docs.rs/ic-cdk-macros)  

---

## 🤝 Contributions

We welcome contributions!  

1. Fork the repo  
2. Create a new feature branch  
3. Make and test changes locally  
4. Open a Pull Request 🚀  

---

## 📌 Current Status

- ✅ Login + Profile Management  
- ✅ Edit Profile  
- ✅ Create / Edit / Delete Posts  
- ✅ Like / Comment / Repost  
- ✅ Feed System  
- ✅ Follow / Unfollow  
- ✅ View Other Profiles  
- ✅ Notifications  
- ✅ Real-time Messaging  
- ✅ Sharded Canisters for scalability  

---

## 🔮 Future Enhancements

- 🌟 Tokenized rewards for creators (Web3 monetization)  
- 🌟 Group chats & communities  
- 🌟 End-to-end encryption for private messaging  
- 🌟 Mobile app integration  
- 🌟 Advanced analytics for content creators  

---

## 🙌 Author’s Note

DeSocial is in **active development**. Our mission is to create a **truly decentralized, censorship-free, and user-first social media platform**.  

If you are exploring decentralized apps, ICP, or blockchain-powered networking, feel free to fork, extend, or raise issues.  

Together, let’s build the **future of social media** 🌍🚀
