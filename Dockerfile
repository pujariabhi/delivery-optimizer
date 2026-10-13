# Multi-stage Dockerfile for Spring Boot from Repo Root
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source from backend/
COPY backend/pom.xml ./pom.xml
COPY backend/src ./src

# Build JAR package
RUN mvn clean package -DskipTests

# Runtime container
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR file
COPY --from=build /app/target/delivery-optimizer-backend-1.0.0.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT:-8080} -jar app.jar"]
