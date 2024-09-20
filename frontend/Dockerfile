# Use a lightweight Nginx image
FROM nginx:alpine

# Copy the static files into the Nginx container
COPY . /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Command to run Nginx
CMD ["nginx", "-g", "daemon off;"]
