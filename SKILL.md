# Snapshot Skill

Vote on Snapshot X proposals using `@snapshot-labs/sx`.

## Requirements

- [Bun](https://bun.sh) runtime

## Setup

```bash
# Install dependencies
bun install

# Copy .env.example to .env and add your private key
cp .env.example .env
# Edit .env with your private key
```

## Usage

```bash
# Run vote
bun run src/index.ts < vote-input.json
```

## Input Format

```json
{
  "space": "snapshot.eth",
  "proposal": "0x123...",
  "choice": "for"
}
```

### Choices

- `for` / `yes` → 1
- `against` / `no` → 0
- `abstain` → 2
- Or use numbers directly: `1`, `0`, `2`

## Output

```json
{
  "ok": true,
  "message": "Vote prepared: for (1) on proposal 0x123 in space test.eth",
  "wallet": "0x..."
}
```
