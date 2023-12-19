# Stage 1: Build the React app

FROM shop.app.packages as builder

WORKDIR /app/apps/shop.app.web
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build


# Stage 2: Create the production image
FROM nginx:latest
COPY --from=builder /app/apps/shop.app.web/build /usr/share/nginx/html
EXPOSE 80

# Copy .env file and shell script to container
WORKDIR /usr/share/nginx/html
COPY ./scripts/update-env.sh .
COPY .env .
COPY ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Add bash
RUN apt-get install bash
# Make our shell script executable
RUN chmod +x update-env.sh
CMD ["/bin/bash", "-c", "/usr/share/nginx/html/update-env.sh && nginx -g \"daemon off;\""]
