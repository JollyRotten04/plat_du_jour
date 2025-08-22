# Stage 1: Build vendor dependencies
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-progress --prefer-dist

# Stage 2: Runtime
FROM php:8.3-fpm

# Install system dependencies for Laravel
RUN apt-get update && apt-get install -y \
    unzip \
    git \
    libpq-dev \
    libzip-dev \
    nginx \
    supervisor \
    && docker-php-ext-install pdo_mysql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

# Copy app code
COPY . ./

# Copy vendor from builder stage
COPY --from=vendor /app/vendor ./vendor

# Set Laravel permissions
RUN chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

# Configure Nginx
COPY ./nginx.conf /etc/nginx/sites-available/default

# Configure Supervisor to run both php-fpm and nginx
COPY ./supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 10000

CMD ["/usr/bin/supervisord", "-n"]
