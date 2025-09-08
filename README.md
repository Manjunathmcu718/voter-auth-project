# 🗳️ Voter Authentication & Fraud Detection Project

A system to ensure fair and secure voter authentication by detecting **fraud patterns** and **data inconsistencies** in electoral rolls.

---

## 🚨 Problems in Voter Lists & Our Solutions

### 1. Duplicate Voters  
Same person entered multiple times with small spelling/address/photo variations.  
**Example:**  
- V101: *Ankit Sharma, Delhi*  
- V102: *Ankit Sharm, Delhi*  

🛠 **Solution:** Fuzzy name matching detects ~95% similarity to flag duplicates.

---

### 2. Fake / Invalid Addresses  
Voter IDs linked to non-existent or unverifiable places.  
**Example:** *20 voters registered at “123, Empty Plot Road”*  

🛠 **Solution:** Cross-checks address database and flags if too many voters share the same fake location.

---

### 3. Bulk Registrations at One Address  
Abnormally high number of voters linked to one flat/house/shop.  
**Example:** *150 voters from “Flat No. 2B, Delhi”*  

🛠 **Solution:** Sets a threshold (e.g., >10 voters at one address = suspicious).

---

### 4. Invalid / Wrong Photographs  
- Photos don’t match the person  
- Repeated photos  
- Blurred or unusable images  

🛠 **Solution:** AI-based face-matching (or basic duplicate check) flags suspicious/missing photos.

---

### 5. Misuse of Form 6 (New Registration)  
Fake identities added as “first-time voters.”  
**Example:** *33,000 suspicious voters in short time*  

🛠 **Solution:** Detects bulk additions and unrealistic spikes in registrations.

---

### 6. Dead Voters Still Active ⚰️  
Names of deceased persons remain active → votes can be cast fraudulently.  

🛠 **Solution:** Cross-checks electoral roll with government death records.

---

### 7. Migrated / Shifted Voters (Not Removed)  
Voter appears in multiple city/state lists.  
**Example:**  
- Delhi voter list: *Ramesh Kumar*  
- Mumbai voter list: *Ramesh Kumar* (not deleted in Delhi)  

🛠 **Solution:** Duplicate detection across regions ensures only one active record.

---

## 🛠 Tech Stack
- **Backend:** Node.js, Express  
- **Database:** MongoDB  
- **Frontend:** React (planned)  
- **AI/ML:** Fuzzy matching, face-matching (future integration)  

---

## 🚀 Setup Instructions
```bash
git clone https://github.com/Manjunathmcu718/voter-auth-project.git
cd voter-auth-project
npm install
npm start
