output "ec2_public_ip" {
  description = "Public IP address of the CampusCare EC2 instance."
  value       = aws_instance.campuscare_server.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS name of the CampusCare EC2 instance."
  value       = aws_instance.campuscare_server.public_dns
}

output "application_url" {
  description = "URL to access the deployed CampusCare application once Ansible has run."
  value       = "http://${aws_instance.campuscare_server.public_ip}"
}
