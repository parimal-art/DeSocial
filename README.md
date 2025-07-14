# DeSocial 🧑‍💻

`DeSocial` is a decentralized social media platform powered by the **Internet Computer Protocol (ICP)**. This repo sets up a full-stack Dapp using **Rust** (for backend canisters) and **React** (for the frontend).

This README is written from a developer’s perspective to help you understand, run, and extend the codebase as efficiently as possible.

---

## 🧱 Tech Stack

- **Frontend**: React.js
- **Backend (Canister)**: Rust + `ic-cdk`
- **IDL/Interface**: Candid
- **Dev Tooling**: `dfx`, `npm`, `cargo`
- **Network**: Runs locally on replica or can be deployed to mainnet

---

## 🎥 Project Demo

Check out the demo to see DeSocial in action:

[DeSocial Project Demo](https://youtu.be/briaX8L_Uz0?si=XkmSySfYJddWEdZa)

---
## 🚀 Getting Started (Local Dev)

### Step 1: Install DFX SDK

If not installed:

```bash
sh -ci "$(curl -fsSL https://smartcontracts.org/install.sh)"
```

Verify:

```bash
dfx --version
```

---

### Step 2: Start Local Replica

```bash
dfx start --background
```

This boots the Internet Computer locally.

---

### Step 3: Deploy Canisters Locally

```bash
dfx deploy
```

- Compiles backend canister (`Rust`)
- Generates candid interface files
- Deploys frontend to the local replica

App will be available at:

```
http://localhost:4943?canisterId=<asset_canister_id>
```

---

### Step 4: Regenerate Candid (Optional)

If you’ve made changes in your backend Rust canister:

```bash
npm run generate
```

> This regenerates frontend actor bindings using the latest Candid files.

---

### Step 5: Start Frontend (React Dev Server)

```bash
npm start
```

Runs at:

```
http://localhost:8080
```

It proxies API requests to port `4943` where the replica is running.

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

## 🌐 Frontend Env (Production Notes)

In production (mainnet deploy), don’t allow root key fetching. Choose any of:

1. Set `DFX_NETWORK=ic`
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

3. Or write your own `createActor()` method with hardcoded host/network.

---

## 🧪 Useful Commands

```bash
dfx start --background     # Start local replica
dfx deploy                 # Deploy to local replica
npm start                  # Start frontend dev server
npm run generate           # Generate frontend bindings from backend
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

If you're contributing:

1. Fork the repo
2. Create a new branch
3. Make and test changes locally
4. Open a pull request

---

## 💡 Status

- ✅ Login + profile management
- ✅ Edit Profile
- ✅ Create, Edit and Delete post
- ✅ Like Comment and Repost
- ✅ Feed
- ✅ Follow Unfollow system
- ✅ View another's profile
- ✅ Notifications

---

## 🙌 Author's Note

This project is in active development. If you're exploring decentralized apps or ICP canisters, feel free to fork, extend, or open issues.

Happy hacking! 🚀
