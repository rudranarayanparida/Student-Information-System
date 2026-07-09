# SIS Backend (Spring Boot)

This directory contains the Java Spring Boot backend for the Student Information System.

## Getting Started

1. Install JDK 17+ and Maven.
2. Configure environment variables:
   - `SPRING_DATASOURCE_URL` – JDBC connection string for Supabase/Postgres.
   - `SPRING_DATASOURCE_USERNAME` – Postgres username.
   - `SPRING_DATASOURCE_PASSWORD` – Postgres password.
   - `JWT_SECRET` – strong JWT secret (minimum 32 characters).
   - `JWT_EXPIRATION_MS` – optional token lifetime in milliseconds.
   - `CORS_ALLOWED_ORIGINS` – allowed frontend origins, e.g. `http://localhost:4173,http://localhost:3000`.

3. Run the backend:
   ```sh
   mvn -f backend/pom.xml spring-boot:run
   ```

## Default seed account

The backend seeds an initial super admin user if the database is empty:

- email: `admin@college.edu`
- password: `Admin@123`

## Notes

- The backend exposes `/api` endpoints.
- CORS is enabled for allowed origins configured in `application.yml`.
- JWT is returned from `/api/auth/login`.
- Student export is available at `/api/students/export?format=CSV`.
