# System zarządzania szkołą

Aplikacja do obsługi szkoły z logowaniem, pulpitem, rolami użytkowników i pełnym zestawem podstawowych funkcji administracyjnych oraz dydaktycznych. Backend działa na Spring Boot, frontend na React + TypeScript + Material UI, a dane produkcyjne są przechowywane w PostgreSQL.

## Funkcje

- logowanie i autoryzacja na poziomie ról,
- pulpit z przeglądem danych,
- zarządzanie użytkownikami, klasami, uczniami i przedmiotami,
- plan lekcji i lekcje,
- oceny z możliwością dodawania, edycji i usuwania,
- frekwencja i usprawiedliwianie nieobecności,
- wiadomości, powiadomienia i materiały dydaktyczne,
- widoki responsywne na desktop i mobile.

## Stack

- Backend: Java 21, Spring Boot 3.4.4, JDBC, Validation,
- Frontend: React 18, TypeScript, Vite, Material UI 6,
- Baza: PostgreSQL 16 w Dockerze,
- Testy backendu: H2 w pamięci.

## Wymagania

- Java 21,
- Maven 3.9+,
- Node.js 18+,
- npm,
- Docker i Docker Compose do uruchomienia PostgreSQL.

## Szybki start

1. Uruchom bazę danych:

```powershell
docker compose up -d postgres
```

2. Uruchom backend:

```powershell
cd backend
mvn test
mvn spring-boot:run
```

3. Uruchom frontend:

```powershell
cd frontend
npm install
npm run dev
```

Frontend działa pod adresem `http://localhost:5173` i wysyła zapytania API przez proxy `/api` do backendu na `http://localhost:8080`.

## Konfiguracja bazy

Backend domyślnie łączy się z PostgreSQL na `localhost:5432`.

Domyślne dane logowania do bazy:

- baza: `school`
- użytkownik: `school`
- hasło: `school`

Możesz nadpisać ustawienia środowiskowe przez:

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`

Jeśli chcesz wyczyścić lokalne dane, usuń wolumen Dockera:

```powershell
docker compose down -v
```

## Jak to działa

Stan aplikacji jest przechowywany w jednej tabeli `school_state` jako JSON. To upraszcza lokalne uruchomienie bez Flyway i bez ręcznego tworzenia wielu tabel, a testy nadal korzystają z H2 w pamięci.

## Skrypty

### Backend

```powershell
cd backend
mvn test
mvn spring-boot:run
mvn package
```

### Frontend

```powershell
cd frontend
npm install
npm run dev
npm run build
npm run preview
```

## Struktura projektu

- `backend/` - aplikacja Spring Boot i logika domenowa,
- `frontend/` - aplikacja React/Vite,
- `docker-compose.yml` - lokalny PostgreSQL,
- `README.md` - dokumentacja uruchomienia i konfiguracji.

## Konta testowe

- `admin@school.local` / `Admin123!`
- `director@school.local` / `Director123!`
- `secretary@school.local` / `Secretary123!`
- `teacher@school.local` / `Teacher123!`
- `student@school.local` / `Student123!`
- `parent@school.local` / `Parent123!`

## Uwagi

- Backend testujesz lokalnie na H2, więc nie musisz mieć uruchomionego Dockera do samego `mvn test`.
- Produkcyjny/devowy tryb aplikacji zakłada dostępny PostgreSQL.
- Jeśli backend nie startuje, najpierw sprawdź czy działa kontener `postgres` i czy port `5432` nie jest zajęty.
