variable "aws_region" {
  description = "AWS region where the CampusCare infrastructure will be created."
  type        = string
  default     = "ap-south-1"
}

variable "key_pair_name" {
  description = "Name of an existing EC2 key pair (created manually in the AWS console) used for SSH access."
  type        = string
  default     = "student-complaint-key"
}

variable "instance_type" {
  description = "EC2 instance type used to run the CampusCare application."
  type        = string
  default     = "t3.micro"
}

variable "project_name" {
  description = "Project name used for tagging AWS resources."
  type        = string
  default     = "campuscare"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into the EC2 instance. Restrict this to your own IP for better security (e.g. 1.2.3.4/32)."
  type        = string
  default     = "117.198.136.17/32"
}
