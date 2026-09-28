from typing import List, Dict, Any
from app.repositories.threat_repository import threat_repo

# Standard MITRE ATT&CK Enterprise Matrix Tactics and Techniques Definition
MITRE_TACTICS = [
    {
        "id": "TA0001",
        "name": "Initial Access",
        "shortName": "initial-access",
        "description": "Tactics used to gain an initial foothold within a network.",
        "techniques": [
            {
                "id": "T1190",
                "name": "Exploitation of Remote Services",
                "description": "Adversaries exploit software vulnerabilities in internet-facing services to gain access.",
                "keywords": ["remote code execution", "rce", "unauthenticated", "buffer overflow", "http", "api", "web app", "exposure"]
            },
            {
                "id": "T1566",
                "name": "Phishing",
                "description": "Adversaries send malicious emails or messages to trick users into revealing credentials or executing code.",
                "keywords": ["phishing", "email", "attachment", "social engineering", "credential harvesting"]
            },
            {
                "id": "T1189",
                "name": "Drive-by Compromise",
                "description": "Gaining access when a target user visits a compromised website.",
                "keywords": ["browser", "cross-site scripting", "xss", "drive-by", "web page"]
            }
        ]
    },
    {
        "id": "TA0002",
        "name": "Execution",
        "shortName": "execution",
        "description": "Tactics that result in adversary-controlled code running on a local or remote system.",
        "techniques": [
            {
                "id": "T1059",
                "name": "Command & Scripting Interpreter",
                "description": "Adversaries abuse command and script interpreters to execute arbitrary commands.",
                "keywords": ["bash", "powershell", "cmd", "script", "command injection", "shell"]
            },
            {
                "id": "T1204",
                "name": "User Execution",
                "description": "Relying on specific user actions to execute malicious code.",
                "keywords": ["click", "executable", "user action", "macro", "payload execution"]
            },
            {
                "id": "T1106",
                "name": "Native API",
                "description": "Adversaries interact directly with native OS APIs to execute code.",
                "keywords": ["api", "system call", "kernel", "dll injection", "hooking"]
            }
        ]
    },
    {
        "id": "TA0003",
        "name": "Persistence",
        "shortName": "persistence",
        "description": "Tactics adversaries use to keep access to systems across restarts.",
        "techniques": [
            {
                "id": "T1053",
                "name": "Scheduled Task/Job",
                "description": "Abusing task scheduling functionality to execute code at specified intervals.",
                "keywords": ["cron", "scheduled task", "systemd", "timer", "job"]
            },
            {
                "id": "T1547",
                "name": "Boot or Logon Autostart Execution",
                "description": "Configuring settings to run code automatically during boot or user login.",
                "keywords": ["registry", "autostart", "startup", "daemon", "service"]
            },
            {
                "id": "T1136",
                "name": "Create Account",
                "description": "Creating persistent user accounts to maintain system access.",
                "keywords": ["user creation", "backdoor account", "admin user", "account creation"]
            }
        ]
    },
    {
        "id": "TA0004",
        "name": "Privilege Escalation",
        "shortName": "privilege-escalation",
        "description": "Tactics adversaries use to gain higher-level permissions.",
        "techniques": [
            {
                "id": "T1068",
                "name": "Exploitation for Privilege Escalation",
                "description": "Exploiting OS or application vulnerabilities to elevate privileges to root/system.",
                "keywords": ["privilege escalation", "local privilege escalation", "root", "system user", "sudo", "kernel exploit"]
            },
            {
                "id": "T1055",
                "name": "Process Injection",
                "description": "Injecting code into processes to evade defenses and elevate permissions.",
                "keywords": ["injection", "process injection", "ptrace", "dll sideloading", "memory modification"]
            }
        ]
    },
    {
        "id": "TA0005",
        "name": "Defense Evasion",
        "shortName": "defense-evasion",
        "description": "Tactics adversaries use to avoid detection throughout their compromise.",
        "techniques": [
            {
                "id": "T1027",
                "name": "Obfuscated Files or Information",
                "description": "Making executable content difficult to analyze by obfuscation or encoding.",
                "keywords": ["obfuscated", "encoding", "base64", "packed", "crypto", "evasion"]
            },
            {
                "id": "T1562",
                "name": "Impair Defenses",
                "description": "Disabling or modifying security tools, logging, or firewalls.",
                "keywords": ["disable firewall", "stop logging", "antivirus bypass", "bypassing edr", "security control failure"]
            }
        ]
    },
    {
        "id": "TA0006",
        "name": "Credential Access",
        "shortName": "credential-access",
        "description": "Tactics for stealing credentials like passwords and tokens.",
        "techniques": [
            {
                "id": "T1003",
                "name": "OS Credential Dumping",
                "description": "Dumping credentials from LSASS, SAM, or shadow files.",
                "keywords": ["dumping", "credentials", "passwords", "mimikatz", "shadow copy", "hash"]
            },
            {
                "id": "T1110",
                "name": "Brute Force",
                "description": "Systematic password guessing or spraying against authentication interfaces.",
                "keywords": ["brute force", "credential spraying", "password guess", "auth failure"]
            }
        ]
    },
    {
        "id": "TA0007",
        "name": "Discovery",
        "shortName": "discovery",
        "description": "Tactics used to gain knowledge about the system and internal network.",
        "techniques": [
            {
                "id": "T1082",
                "name": "System Information Discovery",
                "description": "Gathering detailed OS version, patch level, and hardware details.",
                "keywords": ["reconnaissance", "information disclosure", "fingerprinting", "system info", "version leak"]
            },
            {
                "id": "T1046",
                "name": "Network Service Discovery",
                "description": "Scanning network ports and services to find vulnerable targets.",
                "keywords": ["port scan", "nmap", "network discovery", "service enumeration"]
            }
        ]
    },
    {
        "id": "TA0011",
        "name": "Command & Control",
        "shortName": "command-and-control",
        "description": "Tactics used to communicate with compromised systems.",
        "techniques": [
            {
                "id": "T1071",
                "name": "Application Layer Protocol",
                "description": "Communicating using standard protocols (HTTP, HTTPS, DNS) to blend in.",
                "keywords": ["c2", "command and control", "beaconing", "dns tunneling", "http c2"]
            },
            {
                "id": "T1102",
                "name": "Web Service",
                "description": "Using legitimate web services (GitHub, Pastebin) for C2 communications.",
                "keywords": ["web service", "cloud c2", "api exfiltration", "pastebin"]
            }
        ]
    },
    {
        "id": "TA0040",
        "name": "Impact",
        "shortName": "impact",
        "description": "Tactics used to disrupt availability or compromise integrity.",
        "techniques": [
            {
                "id": "T1485",
                "name": "Data Destruction",
                "description": "Destroying stored data or wiping systems.",
                "keywords": ["wiper", "data destruction", "disk wipe", "ransomware", "encryption"]
            },
            {
                "id": "T1496",
                "name": "Resource Hijacking",
                "description": "Leveraging system resources for unauthorized tasks like cryptomining.",
                "keywords": ["cryptomining", "miner", "resource hijacking", "cpu overload"]
            }
        ]
    }
]


def map_threat_to_techniques(threat: Dict[str, Any]) -> List[str]:
    """
    Analyzes threat fields (summary, threatType, attackVector) to identify matching MITRE technique IDs.
    """
    matched = set()
    text = f"{threat.get('summary', '')} {threat.get('threatType', '')} {threat.get('attackVector', '')}".lower()
    
    for tactic in MITRE_TACTICS:
        for tech in tactic["techniques"]:
            for kw in tech["keywords"]:
                if kw in text:
                    matched.add(tech["id"])
                    break
                    
    # Default fallback mapping if no specific keyword matched
    if not matched:
        if threat.get("cvssScore", 0) >= 7.5:
            matched.add("T1190") # Remote exploitation default
        else:
            matched.add("T1082") # Discovery default

    return list(matched)


class MITREService:
    def get_matrix_data(self) -> Dict[str, Any]:
        """
        Builds complete MITRE ATT&CK matrix populated with real-time ingested threats.
        """
        all_threats = threat_repo.get_all(limit=200)
        
        # Build lookup table of technique_id -> list of mapped threats
        technique_threats: Dict[str, List[Dict[str, Any]]] = {}
        for threat in all_threats:
            tech_ids = map_threat_to_techniques(threat)
            for tid in tech_ids:
                if tid not in technique_threats:
                    technique_threats[tid] = []
                technique_threats[tid].append(threat)
                
        matrix_tactics = []
        total_mapped_threats = 0
        active_techniques_count = 0
        
        for tactic in MITRE_TACTICS:
            tactic_item = {
                "id": tactic["id"],
                "name": tactic["name"],
                "shortName": tactic["shortName"],
                "description": tactic["description"],
                "techniques": []
            }
            
            for tech in tactic["techniques"]:
                threats_for_tech = technique_threats.get(tech["id"], [])
                threat_count = len(threats_for_tech)
                if threat_count > 0:
                    active_techniques_count += 1
                    total_mapped_threats += threat_count
                    
                # Heat intensity score: 0 (none), 1 (low), 2 (med), 3 (high)
                intensity = 0
                if threat_count > 0:
                    max_cvss = max([t.get("cvssScore", 5.0) for t in threats_for_tech])
                    if max_cvss >= 9.0:
                        intensity = 3 # Critical / High
                    elif max_cvss >= 7.0:
                        intensity = 2 # Medium / Warning
                    else:
                        intensity = 1 # Low
                        
                tactic_item["techniques"].append({
                    "id": tech["id"],
                    "name": tech["name"],
                    "description": tech["description"],
                    "threatCount": threat_count,
                    "intensity": intensity,
                    "matchedThreats": threats_for_tech[:10] # Top 10 mapped threats
                })
                
            matrix_tactics.append(tactic_item)
            
        coverage_score = round((active_techniques_count / sum(len(t["techniques"]) for t in MITRE_TACTICS)) * 100, 1)
        
        return {
            "matrix": matrix_tactics,
            "stats": {
                "totalTactics": len(MITRE_TACTICS),
                "activeTechniques": active_techniques_count,
                "totalMappedThreats": len(all_threats),
                "coverageScore": coverage_score
            }
        }

mitre_service = MITREService()
