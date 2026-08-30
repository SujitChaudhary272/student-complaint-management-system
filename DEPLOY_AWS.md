# CampusCare AWS deployment from Windows PowerShell

This deployment uses Terraform for EC2, security rules, and a stable Elastic IP. Ansible runs inside Docker Desktop, installs Docker on Ubuntu 22.04, and deploys the production Compose stack. No WSL or Linux installation is required on Windows.

## 1. Prerequisites

Run these commands from PowerShell:

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
docker --version
docker compose version
terraform --version
aws --version
aws sts get-caller-identity
```

Install/start Docker Desktop and install the Windows AWS CLI and Terraform if a command is unavailable. Run `aws configure` to set credentials; never save them in this repository.

Create an RSA `.pem` EC2 key pair in the AWS Console and save it outside the project, for example `D:\Keys\campuscare-key.pem`. Select the AWS region and key-pair name in [terraform/variables.tf](terraform/variables.tf). The default is `ap-south-1` and `t3.micro`; Free Tier eligibility depends on your current AWS account and region, so verify it in the AWS Console before applying.

Terraform permits SSH only from `117.198.136.17/32`, exposes HTTP port 80 to the internet, and does not create a MongoDB rule.

## 2. Create the production `.env`

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
```

Keep `DOCKER_MONGODB_URI=mongodb://mongo:27017/campuscare`. Leave `CLIENT_URL` blank: the deployed browser uses same-origin `/api` requests and no EC2 address is built into the frontend. `.env` is ignored by Git and copied to EC2 with restricted permissions.

## 3. Provision EC2 and Elastic IP

```powershell
Set-Location "D:\Downloads\Student Complaint Management System\terraform"
$keyPairName = "campuscare-key"
terraform init
terraform fmt -check -recursive
terraform validate
terraform plan -out tfplan `
  -var "key_pair_name=$keyPairName" `
  -var "allowed_ssh_cidr=117.198.136.17/32"
terraform apply tfplan
$elasticIp = terraform output -raw elastic_ip
$appUrl = terraform output -raw application_url
$instanceId = terraform output -raw instance_id
$elasticIp
$appUrl
$instanceId
```

## 4. Configure and verify Ansible in Docker

Replace the inventory placeholder with the Terraform Elastic IP, then build the supplied Ansible image and confirm it contains OpenSSH.

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
$elasticIp = terraform -chdir=terraform output -raw elastic_ip
(Get-Content .\ansible\inventory.ini) `
  -replace 'REPLACE_WITH_TERRAFORM_ELASTIC_IP', $elasticIp |
  Set-Content .\ansible\inventory.ini
docker build -t campuscare-ansible .\ansible
docker run --rm campuscare-ansible sh -c "ssh -V"
```

Set your downloaded PEM path. The command copies it inside the Linux container and applies mode `600`, avoiding unsafe Windows mount permissions:

```powershell
$projectPath = (Get-Location).Path
$keyPath = "D:\Keys\campuscare-key.pem"
docker run --rm `
  -v "${projectPath}:/project" `
  -v "${keyPath}:/keys/campuscare-key.pem:ro" `
  -w /project/ansible `
  --entrypoint sh `
  campuscare-ansible `
  -c 'cp /keys/campuscare-key.pem /tmp/campuscare-key.pem && chmod 600 /tmp/campuscare-key.pem && ansible all -i inventory.ini -m ping'
```

## 5. Deploy the application

This idempotent playbook installs Docker Engine, Compose, Buildx, and Containerd if needed; enables Docker at boot; safely copies only source/build inputs plus `.env`; builds; starts the stack; and waits for `/api/health`.

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"
$projectPath = (Get-Location).Path
$keyPath = "D:\Keys\campuscare-key.pem"
docker run --rm `
  -v "${projectPath}:/project" `
  -v "${keyPath}:/keys/campuscare-key.pem:ro" `
  -w /project/ansible `
  --entrypoint sh `
  campuscare-ansible `
  -c 'cp /keys/campuscare-key.pem /tmp/campuscare-key.pem && chmod 600 /tmp/campuscare-key.pem && ansible-playbook -i inventory.ini deploy.yml'
```

## 6. Verify the application

```powershell
Set-Location "D:\Downloads\Student Complaint Management System\terraform"
$appUrl = terraform output -raw application_url
Invoke-RestMethod "$appUrl/api/health"
Start-Process $appUrl
```

The health response must show `status: ok` and `database: connected`. Register a student, create a complaint, sign in as the administrator, and update its status. MongoDB is private, uses the named `mongo_data` volume, and persists through container restarts and `docker compose down`/`up` (without `-v`).

To verify EC2 restart recovery:

```powershell
Set-Location "D:\Downloads\Student Complaint Management System\terraform"
$instanceId = terraform output -raw instance_id
aws ec2 reboot-instances --instance-ids $instanceId
Start-Sleep -Seconds 60
$appUrl = terraform output -raw application_url
Invoke-RestMethod "$appUrl/api/health"
```

Docker is enabled at boot and both Compose services use `restart: unless-stopped`, so the application should return after reboot.

## Updating, checks, and destruction

After source or `.env` changes, rerun the deployment command in section 5. If the permitted SSH IP changes, run Terraform plan/apply with its new `/32` CIDR before deploying. To inspect remote services, use the Ansible container command from section 4 with this final command instead of `ansible all ... -m ping`:

```text
ansible campuscare -b -i inventory.ini -m command -a "docker compose -f /opt/campuscare/compose.yml ps"
```

Destroy only when you intend to delete the server, Elastic IP, security group, and access to the Docker-hosted database:

```powershell
Set-Location "D:\Downloads\Student Complaint Management System\terraform"
terraform destroy `
  -var "key_pair_name=campuscare-key" `
  -var "allowed_ssh_cidr=117.198.136.17/32"
```

Local Docker/Ansible validation requires Docker Desktop; AWS validation requires valid AWS credentials, the created EC2 instance, and the matching PEM key.
