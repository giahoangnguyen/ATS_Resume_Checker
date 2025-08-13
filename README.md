ATS Resume Checker
Welcome to the ATS Resume Checker! This service helps you analyze resumes against job descriptions using AI-powered matching. Built with FastAPI for the backend and a React-based frontend, it's designed for easy setup and use.
Getting Started
Follow these steps to set up and run the project locally.
Prerequisites
Before you begin, ensure you have the following:

Python 3.10+ installed
Git installed
(Optional for Windows users): Git Bash or WSL recommended for smoother command-line experience
A valid OpenAI API key (sign up at OpenAI if needed)

Clone the Repository
bashgit clone https://github.com/<YOUR_ORG>/<YOUR_REPO>.git
cd <YOUR_REPO>
Create and Activate a Virtual Environment (Backend)
Isolate your dependencies in a virtual environment.
macOS / Linux
bashpython3 -m venv .venv
source .venv/bin/activate
Windows (PowerShell)
powershellpython -m venv .venv
.\.venv\Scripts\Activate.ps1
Install Python Dependencies
Upgrade pip and install the required packages.
If the repo includes a requirements.txt:
bashpip install --upgrade pip
pip install -r requirements.txt
Otherwise, install directly:
bashpip install fastapi uvicorn openai python-multipart pydantic
Set Your OpenAI API Key
Export your API key as an environment variable.
macOS / Linux
bashexport OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
Windows (PowerShell)
powershell$env:OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
Run the Service
Start the backend and frontend separately.
Backend
bashcd src/backend
uvicorn match:app --reload --host 0.0.0.0 --port 8000
Frontend
bashcd src/frontend/resume-matching-ui
npm start
Once running, access the frontend at http://localhost:3000 (default React port) and interact with the backend API at http://localhost:8000.
Troubleshooting

If you encounter issues with dependencies, ensure your Python version is compatible.
For API key errors, double-check the environment variable setup.
Questions? Open an issue on the GitHub repo!

Enjoy using the ATS Resume Checker! 🚀
