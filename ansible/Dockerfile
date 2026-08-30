FROM cytopia/ansible:latest

USER root

RUN if command -v apk >/dev/null 2>&1; then \
      apk add --no-cache openssh-client; \
    elif command -v apt-get >/dev/null 2>&1; then \
      apt-get update && \
      apt-get install -y openssh-client && \
      rm -rf /var/lib/apt/lists/*; \
    else \
      echo "Unsupported base image"; \
      exit 1; \
    fi

RUN ansible-galaxy collection install community.docker
