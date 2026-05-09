FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

# Copy project files first for layer caching
COPY aethon-e3.slnx ./
COPY aethon-e3.api/aethon-e3.api.csproj aethon-e3.api/
COPY aethon-e3.core/aethon-e3.core.csproj aethon-e3.core/
COPY aethon-e3.persistence/aethon-e3.persistence.csproj aethon-e3.persistence/
RUN dotnet restore aethon-e3.api/aethon-e3.api.csproj

# Copy everything and publish
COPY . .
RUN dotnet publish aethon-e3.api/aethon-e3.api.csproj -c Release -o /app/out

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app/out .

ENV ASPNETCORE_URLS=http://0.0.0.0:${PORT:-3000}
ENTRYPOINT ["dotnet", "aethon-e3.api.dll"]
