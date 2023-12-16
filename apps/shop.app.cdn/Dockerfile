FROM nginx:latest
COPY . /usr/share/nginx/html
EXPOSE 80
WORKDIR /usr/share/nginx/html
COPY ./config/nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Add bash
RUN apt-get install bash
# Make our shell script executable
CMD ["/bin/bash", "-c", "nginx -g \"daemon off;\""]
