/**
 * PM2 Ecosystem Configuration for Budget Reduction Tracking
 *
 * This configuration file defines how PM2 should manage the Node.js backend process.
 * It includes environment variables, restart policies, and logging configuration.
 *
 * Usage:
 *   pm2 start pm2-ecosystem.config.js
 *   pm2 restart budget-tracking-api
 *   pm2 stop budget-tracking-api
 *   pm2 logs budget-tracking-api
 *   pm2 monit
 *
 * Documentation: https://pm2.keymetrics.io/docs/usage/application-declaration/
 */

module.exports = {
  apps: [
    {
      // Application name
      name: 'budget-tracking-api',

      // Script path (compiled JavaScript entry point)
      script: './dist/index.js',

      // Current working directory
      cwd: '/opt/budget-tracking/backend',

      // Instances (cluster mode)
      // Set to 'max' to use all CPU cores, or a specific number
      instances: 1,

      // Execution mode: 'fork' or 'cluster'
      exec_mode: 'fork',

      // Auto-restart configuration
      autorestart: true,

      // Watch for file changes and auto-restart (disable in production)
      watch: false,

      // Maximum memory threshold (restart if exceeded)
      max_memory_restart: '500M',

      // Environment variables for all environments
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Production environment variables
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
      },

      // Development environment variables (for testing)
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
      },

      // Error log file path
      error_file: '/opt/budget-tracking/logs/backend-error.log',

      // Output log file path
      out_file: '/opt/budget-tracking/logs/backend-out.log',

      // Log date format
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',

      // Combine logs from all instances into single file
      merge_logs: true,

      // Time in ms before sending final SIGKILL signal
      kill_timeout: 5000,

      // Wait time before restarting crashed app
      restart_delay: 4000,

      // Restart attempts before giving up (0 = unlimited)
      max_restarts: 10,

      // Time window for max_restarts (in milliseconds)
      min_uptime: 10000,

      // Listen for ready event
      wait_ready: false,

      // Listen timeout (ms)
      listen_timeout: 10000,

      // Shutdown timeout (ms)
      shutdown_with_message: true,

      // Cron restart (optional - restart at specific times)
      // Example: restart every day at 4 AM
      // cron_restart: '0 4 * * *',

      // Source map support
      source_map_support: true,

      // Interpreter
      interpreter: 'node',

      // Interpreter arguments
      interpreter_args: '',

      // Node.js arguments
      node_args: '--max-old-space-size=512',

      // Additional configuration options

      // Exponential backoff restart delay (ms)
      exp_backoff_restart_delay: 100,

      // Increment factor for exp backoff
      restart_delay_factor: 2,

      // Maximum delay between restarts (ms)
      max_restart_delay: 60000,

      // Graceful shutdown
      graceful_shutdown: true,

      // Time to wait for graceful shutdown
      graceful_shutdown_timeout: 10000,

      // Post-deployment hook (optional)
      // post_update: ['npm install', 'npx prisma migrate deploy'],

      // Advanced PM2+ monitoring (requires PM2 Plus account)
      // pmx: true,

      // Instance variables (available in process)
      instance_var: 'INSTANCE_ID',

      // Minimum uptime before considered stable (ms)
      min_uptime: '10s',

      // Number of stable restarts before resetting restart count
      max_restarts: 10,

      // Disable auto-restart if script exits cleanly
      autorestart: true,

      // Execute command on startup/shutdown
      // exec_interpreter: 'node',
      // exec_mode: 'fork_mode',
    },
  ],

  /**
   * Deployment configuration (optional)
   * Used for PM2 deploy commands
   */
  deploy: {
    production: {
      user: 'root',
      host: 'localhost',
      ref: 'origin/main',
      repo: 'https://github.com/dmcguire80/Budget-Reduction-Tracking.git',
      path: '/opt/budget-tracking',
      'post-deploy': 'cd backend && npm install && npm run build && pm2 reload pm2-ecosystem.config.js --env production',
      'pre-deploy-local': '',
      'post-setup': '',
      env: {
        NODE_ENV: 'production',
      },
    },
  },
};

/**
 * PM2 Useful Commands:
 *
 * Startup:
 *   pm2 start pm2-ecosystem.config.js [--env production]
 *   pm2 startup systemd  # Enable PM2 on system boot
 *   pm2 save            # Save current process list
 *
 * Management:
 *   pm2 restart budget-tracking-api
 *   pm2 reload budget-tracking-api   # Zero-downtime reload
 *   pm2 stop budget-tracking-api
 *   pm2 delete budget-tracking-api
 *   pm2 list                         # List all processes
 *
 * Monitoring:
 *   pm2 logs budget-tracking-api     # Show logs
 *   pm2 logs --lines 100            # Show last 100 lines
 *   pm2 flush                        # Clear all logs
 *   pm2 monit                        # Real-time monitoring
 *   pm2 status                       # Process status
 *   pm2 describe budget-tracking-api # Detailed process info
 *
 * Updates:
 *   pm2 update                       # Update PM2
 *   pm2 resurrect                    # Restore saved processes
 *
 * Environment:
 *   pm2 restart budget-tracking-api --update-env
 *   pm2 restart budget-tracking-api --env production
 *
 * Logs:
 *   pm2 logs --raw                   # Raw logs without formatting
 *   pm2 logs --json                  # JSON formatted logs
 *   pm2 logs --err                   # Only error logs
 *   pm2 logs --out                   # Only output logs
 */
