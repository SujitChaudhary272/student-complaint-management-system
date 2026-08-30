output "ec2_public_ip" {
  description = "Stable Elastic IP address of the CampusCare EC2 instance."
  value       = aws_eip.campuscare.public_ip
}

output "elastic_ip" {
  description = "Elastic IP associated with the CampusCare EC2 instance."
  value       = aws_eip.campuscare.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS name of the CampusCare EC2 instance."
  value       = aws_instance.campuscare_server.public_dns
}

output "application_url" {
  description = "URL to access the deployed CampusCare application once Ansible has run."
  value       = "http://${aws_eip.campuscare.public_ip}"
}

output "instance_id" {
  description = "EC2 instance ID for management and reboot checks."
  value       = aws_instance.campuscare_server.id
}
