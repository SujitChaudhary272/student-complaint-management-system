# Deploy CampusCare to AWS EC2

This guide deploys CampusCare using this flow:

```text
Terraform -> AWS EC2 + security group -> Ansible -> Docker Compose -> CampusCare + MongoDB
```

The deployment uses Ubuntu 22.04 on EC2, runs the application in Docker, and makes it available on port 80.

## Before you start

You need:

- An AWS account with permission to create EC2 instances and security groups.
- AWS CLI configured on Windows.
- Terraform 1.5 or later.
- WSL with Ubuntu (recommended for Ansible).
- An EC2 key pair downloaded as a `.pem` file.

Install the required tools, then verify AWS access from PowerShell:

```powershell
aws --version
terraform version
aws configure
aws sts get-caller-identity
```

When `aws configure` asks for a default region, use `ap-south-1` unless you plan to change the Terraform region.

## Step 1: Create an EC2 key pair

In the AWS Console:

1. Open **EC2**.
2. Open **Key Pairs**.
3. Select **Create key pair**.
4. Use a name such as `campuscare-key`.
5. Choose **RSA** and `.pem` format.
6. Download and safely store the key, for example at `D:\Keys\campuscare-key.pem`.

Never commit the private key. This repository already ignores `*.pem` files.

## Step 2: Files you need to edit

| File | What to edit | Required? |
| --- | --- | --- |
| `.env` | Create it from `.env.example`; use production values and a secure JWT secret. | Yes |
| `ansible/inventory.ini` | Set the EC2 public IP and absolute path to your `.pem` key. | Yes |
| `terraform/variables.tf` | Change the AWS region, key-pair name, or EC2 size only if the defaults do not suit you. | Optional |

Do not edit `terraform/main.tf`, `terraform/outputs.tf`, `terraform/versions.tf`, `ansible/deploy.yml`, `Dockerfile`, or `compose.yml` for the standard deployment.

## Step 3: Review Terraform configuration (optional)

Open `terraform/variables.tf`. The project defaults are:

```hcl
aws_region    = "ap-south-1"
key_pair_name = "campuscare-key"
instance_type = "t2.micro"
```

Edit these values only when needed:

- Set `aws_region` to the AWS region you want to use.
- Set `key_pair_name` to the exact key-pair name created in AWS.
- Set `instance_type` to `t3.small` or larger if you need more capacity. `t2.micro` is suitable only for light/demo use.

Terraform creates a security group that allows:

- SSH on port 22 only from your current public IP.
- HTTP on port 80 from the internet.

## Step 4: Provision the EC2 instance

Run the following in PowerShell from the project folder:

```powershell
Set-Location "D:\Downloads\Student Complaint Management System\terraform"

terraform init
terraform fmt -check -recursive
terraform validate

$myIp = (Invoke-RestMethod https://checkip.amazonaws.com).Trim()

terraform plan -out tfplan `
  -var "allowed_ssh_cidr=$myIp/32" `
  -var "key_pair_name=campuscare-key"

terraform apply tfplan
```

Replace `campuscare-key` with your actual AWS key-pair name if it is different.

Get the instance address after the apply finishes:

```powershell
terraform output -raw ec2_public_ip
terraform output -raw application_url
```

Copy the public IP. It is required in the next two steps.

## Step 5: Create the production `.env` file

Run these commands in PowerShell from the repository root:

```powershell
Set-Location "D:\Downloads\Student Complaint Management System"

Copy-Item .env.example .env

$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Fill($bytes)
$secret = [Convert]::ToBase64String($bytes)

(Get-Content .env) `
  -replace '^NODE_ENV=.*', 'NODE_ENV=production' `
  -replace '^SEED_DEMO_DATA=.*', 'SEED_DEMO_DATA=false' `
  -replace '^CLIENT_URL=.*', 'CLIENT_URL=http://YOUR_EC2_PUBLIC_IP' `
  -replace '^JWT_SECRET=.*', "JWT_SECRET=$secret" |
  Set-Content .env
```

Replace `YOUR_EC2_PUBLIC_IP` in the command with the actual Terraform output. Then open `.env` and confirm it resembles this:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/devops
DOCKER_MONGODB_URI=mongodb://mongo:27017/campuscare
JWT_SECRET=your-generated-long-random-secret
CLIENT_URL=http://YOUR_EC2_PUBLIC_IP
SEED_DEMO_DATA=false
APP_PORT=80
```

For this deployment, leave `DOCKER_MONGODB_URI=mongodb://mongo:27017/campuscare`. It uses the MongoDB container in `compose.yml` and stores data in the Docker volume named `mongo_data`.

For a more durable production setup, create MongoDB Atlas and replace `DOCKER_MONGODB_URI` with its connection string. Do not enable `SEED_DEMO_DATA` in production.

## Step 6: Configure Ansible inventory

Open `ansible/inventory.ini` and replace its placeholder host line.

If the `.pem` file is stored in `D:\Keys\campuscare-key.pem`, use this WSL path:

```ini
[campuscare]
YOUR_EC2_PUBLIC_IP ansible_user=ubuntu ansible_ssh_private_key_file=/mnt/d/Keys/campuscare-key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no'
```

Replace `YOUR_EC2_PUBLIC_IP` with the Terraform output.

For example:

```ini
[campuscare]
13.234.56.78 ansible_user=ubuntu ansible_ssh_private_key_file=/mnt/d/Keys/campuscare-key.pem ansible_ssh_common_args='-o StrictHostKeyChecking=no'
```

Use the real absolute key path. Do not place the `.pem` key in this repository.

## Step 7: Install Ansible and deploy

Open Ubuntu WSL and run:

```bash
cd "/mnt/d/Downloads/Student Complaint Management System"

sudo apt update
sudo apt install -y ansible

ansible --version
ansible-inventory -i ansible/inventory.ini --graph
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml --syntax-check
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
```

The playbook performs the following on EC2:

1. Installs Docker Engine and the Docker Compose plugin.
2. Enables and starts Docker.
3. Copies this project to `/opt/campuscare`.
4. Copies the local `.env` file to the server with the project source.
5. Builds the Docker image using `Dockerfile`.
6. Starts the application and MongoDB using `compose.yml`.
7. Waits for the health check at `http://localhost/api/health` to return HTTP 200.

## Step 8: Verify the deployment

From WSL, test the public health endpoint:

```bash
curl http://YOUR_EC2_PUBLIC_IP/api/health
```

Open the website in a browser:

```text
http://YOUR_EC2_PUBLIC_IP
```

## Updating the deployed application

After changing application code, Docker configuration, or `.env`, deploy the changes again:

```bash
cd "/mnt/d/Downloads/Student Complaint Management System"
ansible-playbook -i ansible/inventory.ini ansible/deploy.yml
```

## Troubleshooting commands

Connect to the EC2 instance from WSL:

```bash
ssh -i /mnt/d/Keys/campuscare-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Then inspect Docker on the server:

```bash
sudo docker compose -f /opt/campuscare/compose.yml ps
sudo docker compose -f /opt/campuscare/compose.yml logs -f app
sudo docker compose -f /opt/campuscare/compose.yml logs -f mongo
curl http://localhost/api/health
```

Use `Ctrl+C` to stop following logs and `exit` to leave the server.

If your internet IP changes, Terraform's SSH rule may no longer permit SSH. Update it by running the Terraform plan/apply commands again with your new `$myIp` value.

## Remove the AWS deployment

Only use this when you intend to delete the EC2 instance and security group:

```powershell
Set-Location "D:\Downloads\Student Complaint Management System\terraform"

$myIp = (Invoke-RestMethod https://checkip.amazonaws.com).Trim()

terraform destroy `
  -var "allowed_ssh_cidr=$myIp/32" `
  -var "key_pair_name=campuscare-key"
```

Replace `campuscare-key` if your key pair uses a different name. This operation deletes the server and its Docker-hosted MongoDB data.
