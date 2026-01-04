#!/bin/bash

# Local MongoDB Management Script

echo "=== Local MongoDB Management ==="
echo ""

case "$1" in
  "start")
    echo "Starting local MongoDB..."
    docker-compose -f docker-compose.local.yml up -d mongodb
    echo "✅ MongoDB is running on localhost:27017"
    echo "📊 Database: inventory_management"
    echo "👤 Username: admin"
    echo "🔑 Password: password123"
    echo ""
    echo "Connection string: mongodb://admin:password123@localhost:27017/inventory_management?authSource=admin"
    ;;
  "stop")
    echo "Stopping local MongoDB..."
    docker-compose -f docker-compose.local.yml down
    echo "✅ MongoDB stopped"
    ;;
  "restart")
    echo "Restarting local MongoDB..."
    docker-compose -f docker-compose.local.yml down
    docker-compose -f docker-compose.local.yml up -d mongodb
    echo "✅ MongoDB restarted"
    ;;
  "status")
    echo "Checking MongoDB status..."
    if docker ps | grep -q inventory_mongodb_local; then
      echo "✅ MongoDB is running"
      echo "Container: inventory_mongodb_local"
      echo "Port: 27017"
    else
      echo "❌ MongoDB is not running"
    fi
    ;;
  "logs")
    echo "Showing MongoDB logs..."
    docker-compose -f docker-compose.local.yml logs -f mongodb
    ;;
  "reset")
    echo "⚠️  This will delete all local MongoDB data!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
      echo "Stopping and removing MongoDB container and data..."
      docker-compose -f docker-compose.local.yml down -v
      echo "✅ MongoDB data reset"
    else
      echo "Reset cancelled"
    fi
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|reset}"
    echo ""
    echo "Commands:"
    echo "  start   - Start local MongoDB"
    echo "  stop    - Stop local MongoDB"
    echo "  restart - Restart local MongoDB"
    echo "  status  - Check MongoDB status"
    echo "  logs    - Show MongoDB logs"
    echo "  reset   - Reset MongoDB data (⚠️  destructive)"
    echo ""
    echo "Environment:"
    echo "  Use .env.local for local MongoDB configuration"
    ;;
esac 