# Deployment Guide for Recruiter Application

This guide provides detailed instructions for deploying the Recruiter Application in different environments.

## Local Development Deployment

### Prerequisites
- Python 3.10 or higher
- pip package manager
- Git (optional)

### Steps
1. Clone or download the application:
   ```bash
   git clone <repository-url>
   cd recruiter_app
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Set up environment variables (optional):
   ```bash
   cp .env.example .env
   # Edit .env file with your settings
   ```

4. Run the application:
   ```bash
   python app.py
   ```

5. Access the application at http://localhost:5000

## Production Deployment with Docker

### Prerequisites
- Docker
- Docker Compose
- Git (optional)

### Steps
1. Clone or download the application:
   ```bash
   git clone <repository-url>
   cd recruiter_app
   ```

2. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your production settings
   ```

3. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

4. Access the application at http://localhost

### Scaling the Application
To scale the web service:
```bash
docker-compose up -d --scale web=3
```

## Production Deployment on a Server (without Docker)

### Prerequisites
- Ubuntu 20.04 or higher
- Python 3.10 or higher
- PostgreSQL 14 or higher
- Nginx
- Supervisor (optional)

### Steps

1. Install system dependencies:
   ```bash
   sudo apt update
   sudo apt install -y python3-pip python3-dev postgresql postgresql-contrib nginx supervisor
   ```

2. Clone the application:
   ```bash
   git clone <repository-url>
   cd recruiter_app
   ```

3. Create a virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

5. Set up PostgreSQL:
   ```bash
   sudo -u postgres psql
   ```
   
   In the PostgreSQL prompt:
   ```sql
   CREATE DATABASE recruiter_app;
   CREATE USER recruiter_user WITH PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE recruiter_app TO recruiter_user;
   \q
   ```

6. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env file with your production settings
   ```

7. Set up Nginx:
   ```bash
   sudo nano /etc/nginx/sites-available/recruiter_app
   ```
   
   Add the following configuration:
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           root /path/to/recruiter_app/frontend;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /auth {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }

       location /set-language {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

8. Enable the Nginx configuration:
   ```bash
   sudo ln -s /etc/nginx/sites-available/recruiter_app /etc/nginx/sites-enabled
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. Set up Supervisor to manage the Gunicorn process:
   ```bash
   sudo nano /etc/supervisor/conf.d/recruiter_app.conf
   ```
   
   Add the following configuration:
   ```ini
   [program:recruiter_app]
   directory=/path/to/recruiter_app
   command=/path/to/recruiter_app/venv/bin/gunicorn --workers 4 --bind 0.0.0.0:5000 app:app
   autostart=true
   autorestart=true
   stderr_logfile=/var/log/recruiter_app/gunicorn.err.log
   stdout_logfile=/var/log/recruiter_app/gunicorn.out.log
   ```

10. Create log directory and start the application:
    ```bash
    sudo mkdir -p /var/log/recruiter_app
    sudo supervisorctl reread
    sudo supervisorctl update
    sudo supervisorctl start recruiter_app
    ```

11. Access the application at http://your_domain.com

## Cloud Deployment Options

### AWS Deployment

1. **EC2 Instance**:
   - Launch an EC2 instance with Ubuntu 20.04
   - Follow the "Production Deployment on a Server" instructions above

2. **ECS with Docker**:
   - Create an ECS cluster
   - Create a task definition using the provided Dockerfile
   - Deploy the task to the cluster

3. **Elastic Beanstalk**:
   - Create a new Elastic Beanstalk environment
   - Upload the application as a ZIP file
   - Configure environment variables in the Elastic Beanstalk console

### Google Cloud Platform

1. **Compute Engine**:
   - Create a VM instance with Ubuntu 20.04
   - Follow the "Production Deployment on a Server" instructions above

2. **Cloud Run with Docker**:
   - Build and push the Docker image to Google Container Registry
   - Deploy the image to Cloud Run

### Azure

1. **Virtual Machine**:
   - Create a VM with Ubuntu 20.04
   - Follow the "Production Deployment on a Server" instructions above

2. **App Service with Docker**:
   - Create an App Service plan
   - Deploy the Docker image to App Service

## SSL Configuration

To enable HTTPS with Let's Encrypt:

1. Install Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. Obtain SSL certificate:
   ```bash
   sudo certbot --nginx -d your_domain.com
   ```

3. Certbot will automatically update your Nginx configuration

## Backup and Restore

### Database Backup

For PostgreSQL:
```bash
pg_dump -U postgres recruiter_app > backup.sql
```

With Docker:
```bash
docker exec recruiter_app_db pg_dump -U postgres recruiter_app > backup.sql
```

### Database Restore

For PostgreSQL:
```bash
psql -U postgres recruiter_app < backup.sql
```

With Docker:
```bash
cat backup.sql | docker exec -i recruiter_app_db psql -U postgres recruiter_app
```

## Monitoring and Maintenance

### Log Locations

- Application logs: `logs/`
- Nginx logs: `/var/log/nginx/`
- Supervisor logs: `/var/log/supervisor/`

### Regular Maintenance Tasks

1. Database backups (daily recommended)
2. Log rotation
3. Security updates
4. Performance monitoring

## Troubleshooting

### Common Deployment Issues

1. **Port conflicts**:
   - Check if ports 80, 5000, or 5432 are already in use
   - Change the port mapping in docker-compose.yml if needed

2. **Database connection issues**:
   - Verify database credentials in .env file
   - Check if PostgreSQL service is running

3. **Permission issues**:
   - Ensure proper file permissions for application files
   - Check ownership of log directories

4. **Nginx configuration errors**:
   - Run `sudo nginx -t` to validate configuration
   - Check Nginx error logs

For additional support, please refer to the README.md file or contact the development team.
