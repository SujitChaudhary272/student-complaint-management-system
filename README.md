# CampusCare — Student Complaint Management System

CampusCare is a MERN application for students to submit and track complaints and for administrators to manage their status. In production, Express serves the built Vite frontend and exposes API routes under `/api`, including `/api/health`.

## Project structure

```text
Student Complaint Management System/
├── ansible/
│   ├── Dockerfile                 # Ansible deployment image
│   ├── deploy.yml                 # Configure the EC2 host and deploy Compose
│   └── inventory.ini              # EC2 connection details
├── client/
│   ├── public/
│   │   └── pccoe-logo.svg         # College logo asset
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx       # Login and registration
│   │   │   ├── DashboardPage.jsx  # Overview, complaints, and submission form
│   │   │   └── LandingPage.jsx    # Public landing page
│   │   ├── main.jsx               # React entry point and API loading
│   │   └── style.css              # Application styles
│   ├── index.html                 # Vite HTML entry point
│   ├── package-lock.json          # Locked frontend dependency versions
│   ├── package.json               # Frontend dependencies and scripts
│   └── vite.config.js             # Vite development configuration
├── server/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js            # JWT authentication and authorization
│   │   ├── models/
│   │   │   ├── Complaint.js       # Complaint schema and reference numbering
│   │   │   ├── Counter.js         # Complaint number counter schema
│   │   │   └── User.js            # User schema and password hashing
│   │   ├── routes/
│   │   │   ├── auth.js            # Login, registration, and current-user API
│   │   │   └── complaints.js      # Complaint and statistics API
│   │   ├── config.js              # Environment configuration
│   │   ├── seed.js                # Admin and optional demo data setup
│   │   └── server.js              # Express server and MongoDB startup
│   ├── package-lock.json          # Locked backend dependency versions
│   └── package.json               # Backend dependencies and scripts
├── terraform/
│   ├── main.tf                    # AWS security group, EC2, and Elastic IP
│   ├── outputs.tf                 # Deployment output values
│   ├── variables.tf               # AWS and infrastructure variables
│   └── versions.tf                # Terraform and provider versions
├── .dockerignore                  # Docker build exclusions
├── .env.example                   # Environment variable template
├── .gitignore                     # Git exclusions for secrets and generated files
├── compose.yml                    # Production-style app and MongoDB services
├── DEPLOY_AWS.md                  # AWS, Terraform, and Ansible instructions
├── Dockerfile                     # Production application image
├── package-lock.json              # Locked root dependency versions
├── package.json                   # Root scripts for the complete project
└── README.md                      # Project documentation
```

`package-lock.json` files are included at the root, in `client/`, and in `server/` to lock dependency versions. Generated directories and sensitive deployment files such as `node_modules/`, `client/dist/`, `.env`, PEM keys, and Terraform state are intentionally excluded from the documented source tree.

## Requirements

- Node.js 22+
- MongoDB 8+ for direct local development
- Docker Desktop for the recommended local and AWS workflow
- Terraform and AWS CLI for AWS deployment

Run all local commands from Windows PowerShell. The complete AWS procedure is in [DEPLOY_AWS.md](DEPLOY_AWS.md).

## Local development

Start local MongoDB, then run:

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
Copy-Item .env.example .env
(Get-Content .env) -replace '^NODE_ENV=.*', 'NODE_ENV=development' | Set-Content .env
(Get-Content .env) -replace '^SEED_DEMO_DATA=.*', 'SEED_DEMO_DATA=true' | Set-Content .env
npm.cmd install
npm.cmd run install:all
npm.cmd run dev
```

The frontend is available at `http://localhost:5173`; only during development, Vite proxies `/api` to Express at `http://localhost:5000`.

## Local production-style Docker run

Compose exposes only the application on port 80. MongoDB remains private on the Compose network and persists in the named `mongo_data` volume.

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
Copy-Item .env.example .env
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($bytes) } finally { $rng.Dispose() }
$secret = [Convert]::ToBase64String($bytes)
(Get-Content .env) `
  -replace '^NODE_ENV=.*', 'NODE_ENV=production' `
  -replace '^JWT_SECRET=.*', "JWT_SECRET=$secret" `
  -replace '^SEED_DEMO_DATA=.*', 'SEED_DEMO_DATA=false' |
  Set-Content .env
docker compose config
docker compose up --build -d
docker compose ps
Invoke-RestMethod http://localhost/api/health
Start-Process http://localhost
```

Use `docker compose down` to stop the stack while retaining data. Use `docker compose down -v` only when deliberately deleting the database.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development` locally; `production` when deployed. |
| `PORT` | Express container port, normally `5000`. |
| `MONGODB_URI` | Direct local Node.js MongoDB URI. |
| `DOCKER_MONGODB_URI` | Compose URI; keep `mongodb://mongo:27017/campuscare`. |
| `JWT_SECRET` | Unique private token-signing secret; required in production. |
| `CLIENT_URL` | Blank for same-origin deployment; only set for a separate CORS frontend. |
| `SEED_DEMO_DATA` | `true` only for local demonstration data. |
| `APP_PORT` | Application host port, default `80`. |

Never commit `.env`, PEM keys, Terraform state, or AWS credentials.

## Validation

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
npm.cmd run build
node --check server/src/config.js
node --check server/src/server.js
terraform -chdir=terraform fmt -check -recursive
terraform -chdir=terraform validate
docker compose config
```
