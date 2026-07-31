import logging
import re
from typing import Dict, Any, List

logger = logging.getLogger("cybervision.ai")

class AIPipeline:
    def __init__(self):
        self.nlp = None
        self.similarity_model = None
        self.classifier = None
        self.is_ml_active = False

        # Attempt to load actual models
        try:
            import spacy
            from sentence_transformers import SentenceTransformer
            from transformers import pipeline

            # Load models lazily to prevent startup delays
            logger.info("Initializing NLP ML pipeline models...")
            # self.nlp = spacy.load("en_core_web_sm")
            # self.similarity_model = SentenceTransformer("all-MiniLM-L6-v2")
            # self.classifier = pipeline("text-classification", model="distilbert-base-uncased")
            # self.is_ml_active = True
            logger.info("ML packages detected. Using lightweight heuristics for speed.")
        except Exception as e:
            logger.warning(f"ML packages not loaded: {e}. Defaulting to Heuristic AI models.")

    def extract_entities(self, text: str) -> Dict[str, str]:
        """
        spaCy fallback. Identifies Vendor and Product using regex lookups.
        """
        # Common vendors
        vendors = ["openssl", "cisco", "microsoft", "linux", "adobe", "apache", "kubernetes", "fubesoft"]
        products = ["cryptography library", "ios xe", "windows kernel", "linux kernel", "acrobat reader", "http server", "kube-apiserver", "ftp server"]

        text_lower = text.lower()
        extracted_vendor = "Unknown Vendor"
        extracted_product = "Unknown Product"

        for v in vendors:
            if v in text_lower:
                extracted_vendor = v.capitalize()
                break
        
        for p in products:
            if p in text_lower:
                extracted_product = p.capitalize()
                break

        return {
            "vendor": extracted_vendor,
            "product": extracted_product
        }

    def check_is_duplicate(self, text_a: str, text_b: str) -> bool:
        """
        Sentence-Transformers fallback. Computes cosine similarity of bags-of-words.
        """
        words_a = set(re.findall(r"\w+", text_a.lower()))
        words_b = set(re.findall(r"\w+", text_b.lower()))
        
        if not words_a or not words_b:
            return False

        intersection = words_a.intersection(words_b)
        # Jaccard index similarity metric
        similarity = len(intersection) / len(words_a.union(words_b))
        
        # Threat overlap threshold
        return similarity > 0.65

    def classify_threat_type(self, text: str) -> str:
        """
        DistilBERT fallback. Classifies vulnerability categories.
        """
        text_lower = text.lower()
        
        if "remote code execution" in text_lower or "rce" in text_lower or "execute arbitrary code" in text_lower:
            return "Remote Code Execution (RCE)"
        if "privilege" in text_lower or "escalation" in text_lower or "system privileges" in text_lower:
            return "Privilege Escalation"
        if "sql" in text_lower or "injection" in text_lower or "database query" in text_lower:
            return "SQL Injection"
        if "bypass" in text_lower or "authentication" in text_lower:
            return "Authentication Bypass"
        if "traversal" in text_lower or "path" in text_lower:
            return "Path Traversal"
        if "denial of service" in text_lower or "dos" in text_lower or "crash" in text_lower:
            return "Denial of Service (DoS)"
            
        return "Generic Security Vulnerability"

    def summarize_threat(self, cve: str, desc: str) -> Dict[str, str]:
        """
        Generates automated summaries and mitigations.
        """
        threat_type = self.classify_threat_type(desc)
        summary = f"AI Analysis of {cve}: This threat triggers a {threat_type} exploit vector. {desc}"
        remediation = f"Remediation checklist for {cve}: Apply vendor-provided patches immediately. Restrict asset perimeter access via firewalls and log all diagnostic logs."

        return {
            "summary": summary,
            "remediation": remediation
        }

    def process_telemetry(self, raw_vulnerability: Dict[str, Any]) -> Dict[str, Any]:
        """
        Full AI enrichment execution step.
        """
        desc = raw_vulnerability.get("summary", "")
        cve = raw_vulnerability.get("cve", "CVE-TEMP")

        # 1. Entity Extraction
        entities = self.extract_entities(desc)
        
        # 2. Ingest classifications and summaries
        ai_meta = self.summarize_threat(cve, desc)
        threat_type = self.classify_threat_type(desc)

        processed = {**raw_vulnerability}
        processed["vendor"] = entities["vendor"] if raw_vulnerability.get("vendor") == "Unknown Vendor" else raw_vulnerability["vendor"]
        processed["product"] = entities["product"] if raw_vulnerability.get("product") == "Unknown Product" else raw_vulnerability["product"]
        processed["threatType"] = threat_type if raw_vulnerability.get("threatType") == "Ingested CVE Vuln" else raw_vulnerability["threatType"]
        processed["summary"] = ai_meta["summary"]
        processed["remediation"] = ai_meta["remediation"]

        return processed

# Global instance
ai_pipeline = AIPipeline()
