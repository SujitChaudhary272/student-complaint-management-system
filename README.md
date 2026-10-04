# CampusCare — Student Complaint Management System

## 1. Project overview

CampusCare is a full-stack web application designed to digitize the complaint reporting and resolution process in a college environment. It allows students to submit issues such as infrastructure problems, academic concerns, hostel complaints, or safety-related problems, while administrators can review, prioritize, and update the status of these complaints.

This project is useful as a practical demonstration of modern web application development using the MERN stack (MongoDB, Express, React, Node.js). It combines frontend design, backend APIs, database persistence, authentication, role-based access, and deployment support in a single academic project.

For a teacher or evaluator, this project shows:

- End-to-end application design from frontend to backend
- Role-based access control (student vs. admin)
- Data validation and secure authentication with JWT
- CRUD operations on complaint records
- Database-driven reporting and status tracking
- Deployment readiness using Docker and Terraform

## 2. Problem addressed

In many academic institutions, complaint handling is still manual and scattered across paper forms, email messages, or informal communication. This creates delays, lack of accountability, and limited visibility into the status of issues.

CampusCare solves this by providing:

- a centralized complaint portal
- automatic complaint tracking with unique IDs
- transparent status updates
- easier monitoring for college administration
- a clean digital workflow for both students and admin staff

## 3. User roles and responsibilities

### Student user
A student can:

- register a new account
- log in securely
- submit a complaint with PRN number, title, category, priority, and description
- view their personal complaint history
- delete their complaint before it is resolved

### Admin user
The administrator can:

- log in using the reserved admin credentials
- view all complaints submitted by students
- filter and search complaints by category or keyword
- update complaint status such as Pending, In Progress, and Resolved
- delete only resolved complaints

## 4. Basic system flow

The core workflow of the project is simple and follows a real-world complaint management process:

1. Student opens the application and creates an account or logs in.
2. Student submits a complaint with required details such as PRN number, complaint title, category, and description.
3. The frontend sends the data to the Express backend API.
4. The backend validates the request and stores the complaint in MongoDB.
5. A unique complaint record is created with status set to Pending.
6. The admin logs in and views the complaint dashboard.
7. The admin filters, inspects, and updates the issue status.
8. Once resolved, the complaint can be closed and managed accordingly.

A simplified flow is shown below:

```text
Student -> Login/Register -> Submit Complaint -> API Validation -> MongoDB Storage
                                          |
                                          v
                                    Admin Dashboard
                                          |
                                          v
                               Update Status / Resolve Complaint
```

## 5. Technology stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB with Mongoose
- Authentication: JWT and password hashing with bcryptjs
- Styling: custom CSS in the React app
- Deployment support: Docker Compose and Terraform

## 6. Project structure

```text
Student Complaint Management System/
├── ansible/
│   ├── Dockerfile
│   ├── deploy.yml
│   └── inventory.ini
├── client/
│   ├── public/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── src/
│   ├── package.json
│   └── server.js
├── terraform/
│   ├── main.tf
│   ├── outputs.tf
│   ├── variables.tf
│   └── versions.tf
├── .env.example
├── .gitignore
├── compose.yml
├── DEPLOY_AWS.md
├── Dockerfile
├── package.json
├── README.md
└── package-lock.json
```

## 7. Key application behavior

- Student complaints are stored with metadata such as title, category, priority, status, PRN, and timestamps.
- Admin actions are restricted using middleware and authorization checks.
- Complaint status transitions are controlled to prevent invalid updates.
- Search and filtering allow efficient complaint management.
- The app is structured to work both in local development and in production-style Docker deployments.

## 8. Local execution steps

### Prerequisites

- Node.js 22 or above
- MongoDB running locally
- PowerShell on Windows
- Docker Desktop (for containerized run)

### Step 1: Set up environment

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
Copy-Item .env.example .env
(Get-Content .env) -replace '^NODE_ENV=.*', 'NODE_ENV=development' | Set-Content .env
(Get-Content .env) -replace '^SEED_DEMO_DATA=.*', 'SEED_DEMO_DATA=true' | Set-Content .env
```

### Step 2: Install dependencies

```powershell
npm install
npm run install:all
```

### Step 3: Start the application

```powershell
npm run dev
```

This starts both the backend and frontend together.

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default admin login

```text
Username: pccoe
Password: 123456789
```

## 9. Docker execution

For a production-style setup using Docker Compose:

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
```

Then open the app in the browser at:

- http://localhost

To stop the containers:

```powershell
docker compose down
```

## 10. Useful project commands

```powershell
# Install all dependencies
npm install
npm run install:all

# Start frontend + backend together
npm run dev

# Build the frontend only
npm run build

# Start the backend only
npm start

# Start Docker environment
docker compose up --build -d

# Stop Docker environment
docker compose down
```

## 11. Environment variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development` for local run and `production` for deployment |
| `PORT` | Backend port, usually `5000` |
| `MONGODB_URI` | Local MongoDB database URL |
| `DOCKER_MONGODB_URI` | MongoDB URL used by Docker Compose |
| `JWT_SECRET` | Secret key for secure token generation |
| `CLIENT_URL` | Optional CORS URL for separate frontend deployment |
| `SEED_DEMO_DATA` | Enables demo data only for development |
| `APP_PORT` | Public application port in container deployment |

Important: Never store real credentials or secret values in the repository. Keep `.env` and deployment secrets private.

## 12. Validation and testing

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
npm run build
node --check server/src/config.js
node --check server/src/server.js
terraform -chdir=terraform fmt -check -recursive
terraform -chdir=terraform validate
docker compose config
```

## 13. Summary for teachers

This project is a strong example of a real-world college management application built with modern web technologies. It demonstrates:

- user authentication and authorization
- database modeling and CRUD operations
- REST API development
- responsive frontend interface
- deployment using Docker and infrastructure automation with Terraform

It is suitable as a student project because it is practical, scalable, and easy to explain from both technical and business perspectives.

For more deployment details, please refer to [DEPLOY_AWS.md](DEPLOY_AWS.md).




roject run in local using docker

1.   Start-Process "C:\Users\ASUS\AppData\Local\Programs\DockerDesktop\Docker Desktop.exe"

Wait until Docker Desktop finishes starting and shows Engine running.

2.   docker info

Then go to your project:

3.   cd "D:\Downloads\Student Complaint Management System"

Start the application:

4.   docker compose up --build -d

Check the containers:

5.   docker compose ps

Open the application:

6.   Start-Process "http://localhost"





terraform output -raw elastic_ip

terraform state list

## DevOps architecture and automated delivery

The existing AWS EC2 deployment remains the primary production path. Terraform provisions the EC2 host and network rules; Ansible configures Docker and deploys Compose. Compose exposes only the application port and keeps MongoDB on `campuscare_internal`, with its `mongo_data` named volume retained across app updates.

```text
GitHub push -> Actions (install, build, test) -> Docker Hub image
                                             -> Ansible on EC2 -> Compose app update
Browser -> EC2/Ingress -> React frontend or Express API -> private MongoDB storage
Kubernetes option: Ingress -> frontend + backend Services -> MongoDB PVC
                                        Prometheus -> /metrics -> Grafana dashboard
```

Pipeline stages are **Source → Build → Test → Containerization → Deployment → Monitoring**. A deployment job depends on the successful build/test job, so a failed test cannot deploy. Pull requests run installation, build, and tests only; pushes to `main` additionally publish images and update EC2.

Tools: GitHub Actions, Docker/Docker Hub, Docker Compose, Terraform, Ansible, Kubernetes, Prometheus, and Grafana. The backend exposes `/api/health` (database-aware) and Prometheus-compatible `/metrics`.

### GitHub Actions and Docker Hub setup

In the GitHub repository, add these Actions secrets. `DEPLOY_ENV_FILE` is the complete production `.env` content (including `NODE_ENV=production`, `MONGODB_URI`, `JWT_SECRET`, and `SEED_DEMO_DATA=false`), not a filename.

| Secret | Purpose |
| --- | --- |
| `DOCKERHUB_USERNAME` | Docker Hub account name |
| `DOCKERHUB_TOKEN` | Docker Hub access token with push/pull permission |
| `EC2_HOST` | EC2 public IP or DNS name |
| `EC2_SSH_PRIVATE_KEY` | PEM contents used for the Ubuntu SSH login |
| `DEPLOY_ENV_FILE` | Production environment file contents |

Push to `main` after adding those secrets:

```powershell
git add .
git commit -m "Add CI/CD, Kubernetes, and monitoring"
git push origin main
```

Actions pushes `DOCKERHUB_USERNAME/campuscare:<commit-sha>` and `:latest`. It then runs the existing `ansible/deploy.yml`; on EC2, only Compose service `app` is pulled/recreated. MongoDB is neither published nor removed.

### Tests and local verification

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
npm ci
npm ci --prefix server
npm ci --prefix client
npm run build
npm test
docker compose config
docker compose up --build -d
Invoke-RestMethod http://localhost/api/health
Invoke-WebRequest http://localhost/metrics | Select-Object -Expand Content
docker compose down  # preserves mongo_data
```

`tests/api.test.js` checks the health contract when MongoDB is unavailable and validates Prometheus output without requiring a database. The Compose health check verifies the connected `/api/health` endpoint after startup.

### Kubernetes deployment (additional option)

Kubernetes does not replace EC2/Compose. Install an NGINX Ingress controller in your cluster first. Replace both Docker Hub username placeholders and create a real JWT Secret before applying; never commit the real secret.

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
$dockerHubUser = "YOUR_DOCKERHUB_USERNAME"
(Get-Content k8s/backend.yml, k8s/frontend.yml) -replace 'REPLACE_WITH_DOCKERHUB_USERNAME', $dockerHubUser | Set-Content k8s-images.yml
$jwt = [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
(Get-Content k8s/config-and-secrets.yml) -replace 'REPLACE_WITH_A_LONG_RANDOM_SECRET', $jwt | Set-Content k8s-config-local.yml
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s-config-local.yml
kubectl apply -f k8s/mongodb.yml
kubectl apply -f k8s-images.yml
kubectl apply -f k8s/ingress.yml
kubectl -n campuscare get pods,svc,ingress
kubectl -n campuscare rollout status deployment/campuscare-backend
```

For private Docker Hub repositories, create an `imagePullSecret` in `campuscare` and add `imagePullSecrets` to both application Deployments. MongoDB has only a `ClusterIP` Service and therefore is not publicly exposed; its data is stored in the `mongodb-data` PVC.

### Prometheus and Grafana

```powershell
kubectl apply -f monitoring/prometheus-k8s.yml
kubectl apply -f monitoring/grafana-k8s.yml
kubectl -n campuscare rollout status deployment/prometheus
kubectl -n campuscare rollout status deployment/grafana
kubectl -n campuscare port-forward service/prometheus 9090:9090
# In another PowerShell window:
kubectl -n campuscare port-forward service/grafana 3000:3000
```

Open `http://localhost:9090/targets` to verify the backend scrape. Open `http://localhost:3000` (Grafana’s initial default login is `admin` / `admin`, then change it immediately) to view the provisioned CampusCare dashboard. The dashboard covers request volume/rate and database connectivity; Kubernetes platform metrics can be added later with node-exporter and kube-state-metrics.
