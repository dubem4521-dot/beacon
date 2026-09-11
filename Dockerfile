FROM nginx:alpine

# Copy my static files to the nginx html directory
COPY ./frontend/ /usr/share/nginx/html/

# Copy any other resources (like images)
COPY ./resources/ /usr/share/nginx/html/

# Expose port 80 to the outside world
EXPOSE 80
    