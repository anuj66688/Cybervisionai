import sys
import os
import httpx

# Add backend root to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.scrapers.nvd_scraper import NvdScraper

def main():
    print("====================================================")
    print("CyberVision AI - NVD API Connection Diagnostics")
    print("====================================================")
    
    # Strip any accidental whitespace from the loaded API Key
    api_key = settings.NVD_API_KEY
    if api_key:
        api_key = api_key.strip()
        settings.NVD_API_KEY = api_key
        print(f"Loaded NVD API Key: ...{api_key[-8:]}")
    else:
        print("Warning: NVD_API_KEY environment variable is empty!")

    print("\nInitiating HTTP check to NVD API...")
    scraper = NvdScraper()
    
    try:
        # Fetch a single vulnerability record
        results = scraper.fetch_vulnerabilities(limit=1)
        
        if results and len(results) > 0:
            print("\n[SUCCESS] Connection established! Sample ingested CVE record:")
            for item in results:
                print(f"  - CVE ID: {item.get('cve')}")
                print(f"  - Vendor/Product: {item.get('vendor')} / {item.get('product')}")
                print(f"  - CVSS Score: {item.get('cvssScore')}")
                print(f"  - Severity: {item.get('severity')}")
                print(f"  - Summary: {item.get('summary')[:100]}...")
        else:
            print("\n[WARNING] Scraper completed but returned no results. Check if API is rate-limiting.")
            
    except Exception as e:
        print(f"\n[FAILURE] Connection failed with error: {e}")

if __name__ == "__main__":
    main()
