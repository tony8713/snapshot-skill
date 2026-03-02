# Snapshot Skill

Vote on Snapshot proposals using `@snapshot-labs/sx`.

## Install

```bash
bun install
```

## Setup

Copy `.env.example` to `.env`:
```
SNAPSHOT_PRIVATE_KEY=0x...
```

## Usage

### Interactive (no args)
```bash
snapshot-vote
# Prompts for space, proposal, choice
```

### CLI (with args)
```bash
snapshot-vote <space> <proposal> <choice>

# Example
snapshot-vote pistachiodao.eth 0x38c654c0f81b63ea1839ec3b221fad6ecba474aa0c4e8b4e8bc957f70100e753 for
```
