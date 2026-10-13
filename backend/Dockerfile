# Multi-stage Dockerfile for Railway / Cloud Deployment
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src ./src

# Build production jar without running local tests
RUN mvn clean package -DskipTests

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy artifact from build stage
COPY --from=build /app/target/delivery-optimizer-backend-1.0.0.jar app.jar

# Dynamic port binding
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -jar app.jar"]
