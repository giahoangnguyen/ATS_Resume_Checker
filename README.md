# ATS_Resume_Checker
## Getting Started

### Prerequisites 
Before you begin, make sure you have the following installed:

Python 3.10+ installed
Git installed
(Optional) Windows users: Git Bash or WSL recommended
A valid OpenAI API key

### Clone the repo
```bash
git clone https://github.com/<YOUR_ORG>/<YOUR_REPO>.git
cd <YOUR_REP0>
```

### Create & activate a virtual environment to work with (back end)

### macOS / Linux
```bash
python3 -m venv .venv
source .venv/bin/activate
```
### Windows (PowerShell)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

### Install Python dependencies

If the repo includes a requirements.txt:
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

Otherwise install directly:
```bash
pip install fastapi uvicorn openai python-multipart pydantic
```

### Set your OpenAI API key

### macOS / Linux
```bash
export OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
```
### Windows (PowerShell)
```bash
$env:OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
```
### Run the service

### For backend
```bash
cd src/backend
uvicorn match:app --reload --host 0.0.0.0 --port 8000
```

### For frontend
```bash
cd src/frontend/resume-matching-ui
npm start
```
