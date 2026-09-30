---
name: whatsapp-pairing-by-code
description: >-
  Use this skill to link or pair a new WhatsApp phone number to an OpenClaw agent using a Pairing Code (without scanning a QR code), and to configure emergency abort rules to prevent AI-to-AI conversation loops.
---

# OpenClaw WhatsApp Pairing via Pairing Code

OpenClaw natively supports QR codes for linking WhatsApp. When the user cannot scan a QR code and requires a Pairing Code (e.g., using the phone number directly), use this skill. 

## Prerequisites

The host machine running the Docker containers must have Node.js and `@whiskeysockets/baileys` installed in the workspace (or you must run this script from a directory where they are installed).

## Workflow

### 1. Stop the Agent
Stop the OpenClaw container to release the SQLite session lock. If the container is running, the pairing script will fail.

```bash
docker compose stop <bot_container_name>
```

### 2. Clear Old Credentials
Remove any old or corrupted credentials for that phone number.
```bash
rm -rf /path/to/bot/credentials/<phone_number>/*
```

### 3. Run the Pairing Script
Execute the helper script to request the code from WhatsApp.
**Command:**
```bash
node ./scripts/pair.js <phone_number> <absolute_path_to_credentials_dir>
```\**Wait for the script to output the 8-character code, then present it to the user.**

### 4. Wait for Success and Restart
Once the user enters the code on their phone, the script will output `CONEXIÓN EXITOSA` and exit automatically.
Then, restart the agent:
```bash
docker compose start <bot_container_name>
```\
### 5. Prevent AI Loops (Safety)
To prevent the newly paired AI from getting into an infinite conversation loop with other AIs, append an emergency abort rule to the agent's `workspace/SOUL.md`:

```markdown
## Regla de Emergencia (Anti-Bucles IA)
Si sospechas o detectas que hablas con otra IA, termina la conversacion inmediatamente diciendo: Interaccion IA detectada. Fin del comunicado. NO respondas mas.
```\**Note:** OpenClaw 2026.9 also provides native protection via its "Crash-Loop Breaker" which drops the channel if it detects too many rate-limit errors from the LLM.