# Snapshot Skill

Vote on Snapshot proposals using `@snapshot-labs/sx`.

## Setup

```bash
bun install
cp .env.example .env
# Add your private key to .env
```

## Usage

```bash
echo '{"space":"space.eth","proposal":"0x...","choice":"for"}' | bun run src/index.ts
```

## Requirements

- Bun runtime
- @snapshot-labs/sx
