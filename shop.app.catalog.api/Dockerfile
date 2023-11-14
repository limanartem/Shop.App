# Use the official .NET 7 SDK as the build image
FROM mcr.microsoft.com/dotnet/sdk:7.0 AS build

# Below is required in order to properly restore nuget packages

COPY *.cer .
ADD *.cer /usr/local/share/ca-certificates/.
ADD *.cer /etc/ssl/certs/.

RUN apt-get install -y wget
RUN apt-get install curl -y
RUN apt-get install ca-certificates
RUN curl https://api.nuget.org/v3/index.json --insecure


# Set the working directory
WORKDIR /app

# Copy the application code into the container
COPY  . ./


RUN dotnet restore --interactive

# Build the application
RUN dotnet publish -c Release -o /app/publish

# Use the official .NET 7 runtime as the base image
FROM mcr.microsoft.com/dotnet/aspnet:7.0

# Set the working directory
WORKDIR /app

# Copy the published application to the container
COPY --from=build /app/publish .

# Expose the port your application listens on
EXPOSE 5002

# Run the application
ENTRYPOINT ["dotnet", "shop.app.catalog.api.dll"]
