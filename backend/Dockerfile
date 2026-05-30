# Paso 1: Compilar la aplicación usando Maven con Java 17
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN sh mvnw clean package -DskipTests

# Paso 2: Ejecutar la aplicación con la imagen oficial de Eclipse Temurin (Java 17)
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]