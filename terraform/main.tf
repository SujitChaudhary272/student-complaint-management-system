provider "aws" {
  region = var.aws_region
}

# --------------------------------------------------------------------------
# Latest Ubuntu 22.04 LTS AMI (official Canonical account)
# --------------------------------------------------------------------------
data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# --------------------------------------------------------------------------
# Security Group
# --------------------------------------------------------------------------
resource "aws_security_group" "campuscare_sg" {
  name        = "${var.project_name}-sg"
  description = "Security group for the CampusCare EC2 instance"

  tags = {
    Name    = "${var.project_name}-sg"
    Project = var.project_name
  }
}

resource "aws_security_group_rule" "allow_ssh" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = [var.allowed_ssh_cidr]
  security_group_id = aws_security_group.campuscare_sg.id
  description       = "Allow SSH access"
}

resource "aws_security_group_rule" "allow_http" {
  type              = "ingress"
  from_port         = 80
  to_port           = 80
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.campuscare_sg.id
  description       = "Allow HTTP access to the CampusCare web application"
}

resource "aws_security_group_rule" "allow_all_outbound" {
  type              = "egress"
  from_port         = 0
  to_port           = 0
  protocol          = "-1"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.campuscare_sg.id
  description       = "Allow all outbound traffic"
}

# --------------------------------------------------------------------------
# EC2 Instance
# --------------------------------------------------------------------------
resource "aws_instance" "campuscare_server" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  vpc_security_group_ids = [aws_security_group.campuscare_sg.id]

  root_block_device {
    volume_size = 15
    volume_type = "gp3"
  }

  tags = {
    Name    = "${var.project_name}-server"
    Project = var.project_name
    Env     = "demo"
  }
}
