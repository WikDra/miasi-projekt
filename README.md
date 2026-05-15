# System zarządzania szkołą

Lokalne demo aplikacji do obsługi szkoły. Backend działa na Spring Boot, frontend na React + TypeScript + Material UI, a dane lokalne są trzymane w PostgreSQL uruchamianym z Dockera.

Projekt jest przygotowany jako baza do dalszego rozwoju. Nie traktuj obecnej konfiguracji jako produkcyjnej.

## Funkcje

- logowanie z tokenem JWT,
- autoryzacja na poziomie ról i wybranych relacji domenowych,
- pulpit z podsumowaniem danych,
- zarządzanie użytkownikami, klasami, uczniami i przedmiotami,
- plan lekcji i sesje lekcyjne,
- oceny, frekwencja i usprawiedliwienia,
- wiadomości, powiadomienia i materiały dydaktyczne,
- testy backendu na H2.

## Stack

- Backend: Java 21, Spring Boot 3.4.4, Spring Data JPA, Validation,
- Frontend: React 18, TypeScript, Vite, Material UI 6,
- Baza lokalna: PostgreSQL 16 w Dockerze,
- Testy backendu: H2 w pamięci.

## Szybki Start

1. Uruchom bazę:

```powershell
docker compose up -d postgres
```

2. Uruchom backend:

```powershell
cd backend
mvn test
mvn spring-boot:run
```

Jeśli Maven albo Java nie są dostępne w terminalu, ustaw lokalnie `JAVA_HOME` i dodaj katalog `bin` Mavena do `PATH` zgodnie ze swoją instalacją.

```powershell
java -version
mvn -version
```

Po poprawnym ustawieniu środowiska:

```powershell
mvn test
mvn spring-boot:run
```

3. Uruchom frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend działa pod `http://localhost:5173` i wysyła zapytania `/api` do backendu na `http://localhost:8080`.

## Konfiguracja Lokalna

Backend domyślnie łączy się z PostgreSQL:

- URL: `jdbc:postgresql://localhost:5432/school`
- baza: `school`
- użytkownik: `school`
- hasło: `school`

Możesz nadpisać ustawienia:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_SECONDS`
- `APP_SEED_DEMO_DATA`
- `APP_DEMO_MODE`

Domyślnie `APP_SEED_DEMO_DATA=true`, więc przy pustej bazie tworzone są konta demo. Aby wyłączyć seed:

```powershell
$env:APP_SEED_DEMO_DATA = "false"
```

## Konta Demo

- `admin@school.local` / `Admin123!`
- `director@school.local` / `Director123!`
- `secretary@school.local` / `Secretary123!`
- `teacher@school.local` / `Teacher123!`
- `student@school.local` / `Student123!`
- `parent@school.local` / `Parent123!`

## Testy I Build

Backend:

```powershell
cd backend
mvn test
```

Frontend:

```powershell
cd frontend
npm run build
```

Na Windowsie, jeśli PowerShell blokuje `npm.ps1`, użyj:

```powershell
npm.cmd run build
```

## Reset Lokalnych Danych

```powershell
docker compose down -v
docker compose up -d postgres
```

Po kolejnym starcie backendu seed demo odtworzy konta, o ile `APP_SEED_DEMO_DATA=true`.

## Uwagi

- To lokalne demo, nie konfiguracja produkcyjna.
- JWT ma lokalny sekret domyślny; poza demo ustaw `JWT_SECRET`.
- Hibernate `ddl-auto=update` jest wygodne lokalnie, ale przed produkcją powinno zostać zastąpione migracjami Flyway/Liquibase.
- H2 console jest ograniczona do lokalnego hosta.
