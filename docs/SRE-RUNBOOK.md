In my CampusCare project, I implemented the foundation of Site Reliability Engineering using Prometheus, Grafana, and Node Exporter.

Prometheus collects application and server metrics, while Grafana displays those metrics through dashboards. I configured alert rules to detect unavailable application metrics, unavailable server metrics, and high CPU usage.

I also documented Service-Level Indicators, proposed Service-Level Objectives, an error budget, and an incident runbook. The runbook explains how to detect a problem, investigate its cause, recover the service, and verify that it is working again.

Finally, GitHub Actions and Ansible support automated testing and deployment. Together, these practices help make CampusCare easier to monitor, troubleshoot, and maintain reliably.



\# CampusCare SRE Incident Runbook



\## 1. Purpose

This runbook explains how to investigate CampusCare application failures, monitoring failures, and high CPU usage.



\## 2. Incident: Application is unavailable



1\. Open Prometheus Target Health and check the `campuscare-app` target.

2\. Connect to the production EC2 instance.

3\. Check running containers:

&#x20;  `sudo docker ps`

4\. Check application logs:

&#x20;  `sudo docker logs --tail=100 campuscare-app-1`

5\. Check the health endpoint:

&#x20;  `curl -fsS http://localhost/api/health`

6\. Check the metrics endpoint:

&#x20;  `curl -fsS http://localhost:9464/metrics`

7\. If the application is unhealthy, investigate the logs, database connection, container state, and deployment history.

8\. Use the existing GitHub Actions and Ansible deployment process for application changes.

9\. Verify the health endpoint and Prometheus target after recovery.



\## 3. Incident: Node Exporter is unavailable



1\. Check the `node-exporter` target in Prometheus.

2\. Check the Node Exporter container on production:

&#x20;  `sudo docker ps`

3\. Test from the monitoring EC2:

&#x20;  `curl -fsS http://172.31.2.213:9100/metrics`

4\. Check the container logs and the security-group rule.

5\. Confirm that TCP 9100 is accessible from the monitoring security group only.

6\. Verify that the target returns to UP.



\## 4. Incident: High CPU usage



1\. Review the CPU dashboard in Grafana.

2\. On production, run `top`.

3\. Check container usage:

&#x20;  `sudo docker stats --no-stream`

4\. Inspect application logs and recent deployments.

5\. Investigate the cause before restarting services.

6\. Confirm CPU usage returns to normal and the alert clears.



\## 5. Recovery verification



After recovery:

\- The application health endpoint returns HTTP 200.

\- The application metrics endpoint responds.

\- Prometheus targets return to UP.

\- Grafana shows fresh data.

\- The alert returns to inactive.

\- Record the incident, cause, recovery time, and preventive action.



\## 6. Safety rules



\- Never delete the production MongoDB volume.

\- Never run `docker compose down -v` on production.

\- Do not expose MongoDB or monitoring ports to the public internet.

\- Use the existing CI/CD pipeline for application deployments.



\## 7. Incident record



Date/time:

Incident:

Impact:

Cause:

Action taken:

Recovery verified:

Prevention / follow-up:



