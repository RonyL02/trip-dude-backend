module.exports = {
    apps: [{
      name: "trip-dude-backend",
      script: "./build/main.js",
      env_production: {
        NODE_ENV: "production"
      }
    }]
  }
  