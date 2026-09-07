# EC2 shared Docker platform and Limitra deployment

This layout runs one shared Nginx, PostgreSQL, and Redis stack. Every app runs in
its own Compose project and joins the two external Docker networks it needs:

- `platform_edge`: Nginx and HTTP application containers.
- `platform_data`: application containers, PostgreSQL, and Redis.

No application or database port is published on the EC2 host. Only Nginx port
80 is public. For production HTTPS, put an AWS Application Load Balancer with an
ACM certificate in front of the instance, or add a certificate automation flow
before opening the site to users.

## 1. Prepare the EC2 instance

Use Ubuntu 24.04 LTS on an instance sized for the combined workload. Start with
at least 2 vCPU and 4 GiB RAM, then resize from CloudWatch data. Attach an EBS
volume large enough for PostgreSQL, Redis, images, and logs.

In the EC2 security group allow:

- SSH (`22`) only from your administration IP or use AWS Systems Manager.
- HTTP (`80`) from the internet during initial setup, or only from the ALB.
- HTTPS (`443`) only if TLS terminates on this EC2 instance.
- Do not allow inbound `3000`, `5432`, or `6379`.

Install Docker Engine and the Compose plugin from Docker's official Ubuntu
repository, then enable it:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo \"$VERSION_CODENAME\") stable" | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Log out and back in once so the Docker group change takes effect. Verify with
`docker version` and `docker compose version`.

## 2. Start the shared platform

Clone the app repository first so the versioned platform templates are present:

```bash
sudo mkdir -p /opt/apps /opt/platform
sudo chown -R "$USER":"$USER" /opt/apps /opt/platform
git clone https://github.com/biqxx/limitra-waitlist.git /opt/apps/limitra-waitlist
cp -a /opt/apps/limitra-waitlist/deploy/ec2/platform/. /opt/platform/
cd /opt/platform
cp .env.example .env
```

Generate three independent secrets and place them in `/opt/platform/.env`:

```bash
openssl rand -hex 32
openssl rand -hex 32
openssl rand -hex 32
chmod 600 /opt/platform/.env
```

Create the shared networks and start the platform:

```bash
docker network create platform_edge
docker network create platform_data
docker compose up -d
docker compose ps
```

The PostgreSQL initialization script creates the Limitra database and role only
the first time the `postgres_data` volume is initialized. For a platform that
already contains data, create new app roles/databases with `psql`; do not remove
the volume to rerun initialization scripts.

## 3. Configure and start Limitra

Create the app environment file. The password must exactly match
`LIMITRA_DB_PASSWORD` from `/opt/platform/.env`:

```bash
cd /opt/apps/limitra-waitlist
cp .env.production.example .env.production
chmod 600 .env.production
```

Edit `.env.production`, replace `CHANGE_ME`, and keep `DATABASE_SSL=false` for
the private Docker network.

The production Compose file does not build source code on EC2. It pulls these
multi-architecture images from GitHub Container Registry by default:

- `ghcr.io/biqxx/limitra-waitlist:main`
- `ghcr.io/biqxx/limitra-waitlist:migration-main`

Make the container package public in its GitHub package settings, or log the
server into GHCR with a token that has `read:packages`:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u biqxx --password-stdin
```

Pull the images, apply migrations as a one-shot task, and start the app:

```bash
chmod +x deploy/ec2/deploy-waitlist.sh
./deploy/ec2/deploy-waitlist.sh
docker compose -f compose.production.yml logs --tail=100 app
```

The `migrate` profile runs `prisma migrate deploy` and exits. The application is
the only persistent service in this Compose project, and the Prisma CLI is not
included in its production image.

Enable its Nginx route:

```bash
cd /opt/platform
cp nginx/conf.d/10-limitra.conf.example nginx/conf.d/10-limitra.conf
sed -i 's/waitlist.example.com/waitlist.your-domain.com/' nginx/conf.d/10-limitra.conf
docker compose exec nginx nginx -t
docker compose exec nginx nginx -s reload
```

Point the domain's DNS record at the ALB or EC2 public IP. Verify
`http://waitlist.your-domain.com/api/health`; it should report both the app and
database as healthy.

## 4. Build and publish images

### GitHub Actions (recommended)

Every push to `main` runs `.github/workflows/publish-images.yml`. It builds
`linux/amd64` and `linux/arm64` runtime and migration images, then publishes
branch and immutable commit tags to GHCR. No long-lived registry credential is
needed in GitHub because the workflow uses the repository's `GITHUB_TOKEN`.

After the workflow succeeds, deploy the new `main` images on EC2:

```bash
cd /opt/apps/limitra-waitlist
git pull --ff-only
./deploy/ec2/deploy-waitlist.sh
```

For a rollback or controlled release, pin both images from the same commit in
the shell or in `/opt/apps/limitra-waitlist/.env`:

```bash
LIMITRA_IMAGE=ghcr.io/biqxx/limitra-waitlist:sha-0123456
LIMITRA_MIGRATION_IMAGE=ghcr.io/biqxx/limitra-waitlist:migration-sha-0123456
export LIMITRA_IMAGE LIMITRA_MIGRATION_IMAGE
./deploy/ec2/deploy-waitlist.sh
```

### Build locally and transfer directly

If you do not want to use a registry, build both images on a machine with
Docker. The target platform must match the EC2 instance (`linux/amd64` for most
Intel/AMD instances or `linux/arm64` for Graviton):

```bash
docker compose -f compose.production.yml -f compose.build.yml build --pull
docker save -o waitlist-images.tar \
  limitra-waitlist:local limitra-waitlist-migration:local
scp waitlist-images.tar ubuntu@YOUR_EC2_HOST:/tmp/waitlist-images.tar
ssh ubuntu@YOUR_EC2_HOST \
  'docker load -i /tmp/waitlist-images.tar && rm /tmp/waitlist-images.tar'
```

Then deploy the loaded local images on EC2:

```bash
cd /opt/apps/limitra-waitlist
export LIMITRA_IMAGE=limitra-waitlist:local
export LIMITRA_MIGRATION_IMAGE=limitra-waitlist-migration:local
./deploy/ec2/deploy-waitlist.sh
```

## 5. Pull and redeploy an update

```bash
cd /opt/apps/limitra-waitlist
git pull --ff-only
./deploy/ec2/deploy-waitlist.sh
docker image prune -f
```

Pin immutable release tags or digests rather than deploying `latest`.

## 6. Add another application

Give each app its own directory and Compose project. Do not publish its HTTP or
database ports. Join `platform_edge` for Nginx access and `platform_data` only
when it needs PostgreSQL or Redis. Give every app a separate PostgreSQL database
and role, then add one Nginx server file under `/opt/platform/nginx/conf.d/`.

For Redis consumers, use a distinct ACL user and key prefix per app. Redis
logical database numbers are not a security boundary.

## Operations checklist

- Put HTTPS in place before accepting names, email addresses, or phone numbers.
- Back up PostgreSQL with scheduled `pg_dump` uploads to a private S3 bucket and
  test restores; EBS snapshots alone are not a database backup strategy.
- Monitor disk, memory, container restarts, HTTP 5xx responses, and database
  connections with CloudWatch.
- Keep `/opt/platform/.env` and every app `.env.production` mode `600`, never
  commit them, and rotate credentials periodically.
- Patch the EC2 OS and rebuild images regularly. Use immutable image tags for
  rollback.
