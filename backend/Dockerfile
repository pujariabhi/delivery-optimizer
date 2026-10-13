# Multi-stage Dockerfile for Spring Boot
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml ./
COPY src ./src

# Build JAR package (skip unit tests for fast cloud build)
RUN mvn clean package -DskipTests

# Runtime container
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the generated JAR
COPY --from=build /app/target/*.jar app.jar

ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-Dserver.port=${PORT}", "-jar", "app.jar"]
