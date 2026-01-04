# Local MongoDB Setup Guide

This guide will help you set up MongoDB locally for testing your inventory management system.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed

## Quick Start

### 1. Start Local MongoDB

```bash
# Start MongoDB container
npm run mongodb:start

# Or use the script directly
./scripts/local-mongodb.sh start
```

### 2. Switch to Local Environment

```bash
# Use local MongoDB configuration
npm run dev:local

# Or manually copy the local environment file
cp .env.local .env
npm run dev
```

### 3. Verify Connection

The application should now connect to your local MongoDB instance at:
- **Host**: localhost:27017
- **Database**: inventory_management
- **Username**: admin
- **Password**: password123

## MongoDB Management Commands

```bash
# Check MongoDB status
npm run mongodb:status

# View MongoDB logs
npm run mongodb:logs

# Restart MongoDB
npm run mongodb:restart

# Stop MongoDB
npm run mongodb:stop

# Reset MongoDB data (⚠️ destructive)
npm run mongodb:reset
```

## Environment Configuration

### Local Environment (.env.local)
```
MONGODB_URI=mongodb://admin:password123@localhost:27017/inventory_management?authSource=admin
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### Production Environment (.env)
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

## Docker Compose Configuration

The local MongoDB setup uses `docker-compose.local.yml`:

```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:7.0
    container_name: inventory_mongodb_local
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password123
      MONGO_INITDB_DATABASE: inventory_management
    ports:
      - "27017:27017"
    volumes:
      - mongodb_local_data:/data/db
```

## Switching Between Environments

### To Local MongoDB
```bash
cp .env.local .env
npm run dev
```

### To Production MongoDB
```bash
# Restore original .env file
git checkout .env
npm run dev
```

## Troubleshooting

### MongoDB Connection Issues

1. **Check if MongoDB is running:**
   ```bash
   npm run mongodb:status
   ```

2. **Check MongoDB logs:**
   ```bash
   npm run mongodb:logs
   ```

3. **Restart MongoDB:**
   ```bash
   npm run mongodb:restart
   ```

### Port Conflicts

If port 27017 is already in use:
1. Stop any existing MongoDB instances
2. Check for other Docker containers using the port
3. Modify the port in `docker-compose.local.yml` if needed

### Data Persistence

- MongoDB data is persisted in a Docker volume
- To reset all data: `npm run mongodb:reset`
- Data is stored in: `mongodb_local_data` volume

## Development Workflow

1. **Start local MongoDB:**
   ```bash
   npm run mongodb:start
   ```

2. **Use local environment:**
   ```bash
   npm run dev:local
   ```

3. **Test your application** - it will now use local MongoDB

4. **Stop when done:**
   ```bash
   npm run mongodb:stop
   ```

## Benefits of Local MongoDB

- ✅ **Faster development** - no network latency
- ✅ **Offline development** - works without internet
- ✅ **Safe testing** - no risk to production data
- ✅ **Cost effective** - no cloud database charges
- ✅ **Full control** - complete database access

## Next Steps

After setting up local MongoDB:

1. Run the demo data setup: `npm run setup-demo`
2. Test all features of your inventory management system
3. Switch back to production when ready to deploy 