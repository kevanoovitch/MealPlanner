
# Build the react frontend

FROM node:26-bookworm-slim AS frontend
WORKDIR /web

COPY src/MealPlanner-web/package*.json ./
RUN npm ci 

COPY src/MealPlanner-web/ ./ 
RUN npm run build 

#Build and publish the API 
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS backend 
WORKDIR /src 

COPY src/MealPlanner.Api/MealPlanner.Api.csproj ./ 
RUN dotnet restore 

COPY src/MealPlanner.Api/ ./ 
RUN dotnet publish -c Release -o /publish --no-restore /p:UseAppHost=false 

#Run the compiled application 
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final 
WORKDIR /app 

COPY --from=backend /publish/ ./ 
COPY --from=frontend /web/dist/ ./wwwroot/ 

RUN mkdir -p /data && chown "$APP_UID" /data 

ENV ASPNETCORE_HTTP_PORTS=8080 
ENV Database__Path=/data/mealplanner.db 

USER $APP_UID 
EXPOSE 8080 

ENTRYPOINT [ "dotnet", "MealPlanner.Api.dll" ]



