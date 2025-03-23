FROM eclipse-temurin:11-jdk AS build
WORKDIR /app

# Copy Maven configuration
COPY backend/pom.xml .
COPY backend/.mvn/ ./.mvn
COPY backend/mvnw .
COPY backend/mvnw.cmd .

# Copy source code
COPY backend/src ./src

# Package the application
RUN ./mvnw package -DskipTests

# Runtime stage
FROM eclipse-temurin:11-jre
WORKDIR /app

# Copy the JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar


ENV SERVER_PORT=8082

EXPOSE 8082

ENTRYPOINT ["java", "-jar", "/app/app.jar"] 