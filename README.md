# Stremio Trakt Addon

This is a specialized addon for Stremio, integrating deeply with Trakt services to enhance your streaming experience by providing personalized content and advanced customization options.

## Features

### Content in your preferred language
- Retrieve content in the language of your choice for a personalized experience.

### Trakt catalog integration
- Access **popular** and **trending** catalogs directly from Trakt.
- View your **watchlist** and receive **personalized recommendations** from Trakt.

### List management
- Add Trakt lists as catalogs by browsing through **popular**, **trending**, or **search** tabs on the addon configuration page.
- Add lists directly by URL for custom catalog management.

### RPDB integration
- Integrate with RPDB, a web service providing posters and ratings for movies and series, enriching the visual and informational content of the catalogs.

### Fanart integration
- Replace titles with logos in the selected language (or English by default) to enhance visual appeal when available.

### Trakt history sync (not ready yet)
- Synchronize your watch history with Stremio, ensuring your watched items are marked in your catalogs with a custom emoji of your choice.

### Automatic token refresh
- Avoid manual re-authentication by using an **automatic token refresh** system, maintaining access without interruptions.

### Mark content as watched (not ready yet)
- Manually **mark content as watched** on Trakt directly from Stremio, with the option to rename or translate the action button text for better localization.

### Progressive scraping (not ready yet)
- Prefetch upcoming content pages as you scroll to improve loading times, ensuring smooth and reliable performance.

### Customizable catalog display
- Customize the order of catalogs through the addon's configuration page.

### Customizable cache management
- Adjust cache duration via environment variables to balance performance with content freshness.
- Set cache duration for RPDB posters, also adjustable via environment variables, to optimize API usage.

### Data sourced from TMDB & Trakt
- Catalog data is sourced from **TMDB** and **Trakt**, adhering to their Terms of Service. This product uses the TMDB & Trakt APIs but is not endorsed or certified by TMDB or Trakt.

## Docker Compose
```yaml
version: '3.8'

services:
  stremio-trakt-addon:
    image: reddravenn/stremio-trakt-addon
    container_name: stremio-trakt-addon
    ports:
      - "8080:7000"  # Mappage du port externe 8080 au port interne 7000
    environment:
      # Exposition port
      PORT: 7000

      # URL to access the addon
      BASE_URL: http://localhost:7000

      # PostgreSQL database connection settings
      DB_USER: your_user               # Username for PostgreSQL authentication
      DB_HOST: your_host               # PostgreSQL server hostname or IP
      DB_NAME: your_database           # Name of the database to connect to
      DB_PASSWORD: your_password       # Password for the PostgreSQL user
      DB_PORT: 5432                    # Port number where PostgreSQL is running (default 5432)
      DB_MAX_CONNECTIONS: 20           # Maximum number of active connections allowed to the database
      DB_IDLE_TIMEOUT: 30000           # Time (in ms) to close idle database connections
      DB_CONNECTION_TIMEOUT: 2000      # Timeout (in ms) to establish a new database connection

      # Redis cache configuration
      REDIS_HOST: your_host            # Redis server hostname or IP
      REDIS_PORT: 6379                 # Port number where Redis is running (default 6379)
      REDIS_PASSWORD:                  # Password for Redis authentication (if required)

      # Trakt API credentials
      TRAKT_CLIENT_ID:                 # Trakt client ID
      TRAKT_CLIENT_SECRET:             # Trakt client secret

      # Content cache duration
      TMDB_CACHE_DURATION: 1d          # Cache duration for TMDB data (e.g., '1d' for 1 day)
      TRAKT_CACHE_DURATION: 1d         # Cache duration for Trakt data (e.g., '1d' for 1 day)

      # Interval for synchronizing Trakt watch history
      TRAKT_HISTORY_FETCH_INTERVAL: 1d # Synchronization interval for Trakt history (e.g., '1d' for 1 day)

      # Log settings
      LOG_LEVEL: info                  # Logging level ('info' or 'debug' for more detailed logs)
      LOG_INTERVAL_DELETION: 3d        # Interval for log file deletion (e.g., '3d' for 3 days)

      # Node environment
      NODE_ENV: production             # Environment in which the Node.js application is running

    restart: unless-stopped
    volumes:
      - ./cache:/usr/src/app/cache
      - ./log:/usr/src/app/log
```

## Contribution
Contributions are welcome! If you'd like to add new features or fix existing issues, feel free to open a pull request or submit an issue.