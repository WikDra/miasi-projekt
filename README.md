# System zarządzania szkołą

Aplikacja do logowania, przeglądania danych szkoły i wystawiania ocen. Backend używa H2 w trybie plikowym, więc dane zostają po restarcie.

## Zawartość

- backend w Spring Boot,
- frontend w React + TypeScript + Material UI,
- logowanie, pulpit, użytkownicy, klasy, wiadomości i oceny,
- formularz dodawania oceny z odświeżaniem danych po zapisie.

## Wymagania

- Java 21,
- Maven 3.9+,
- Node.js 18+,
- npm.

## Uruchomienie backendu

```powershell
cd backend
mvn test
mvn spring-boot:run
```

## Uruchomienie frontendu

```powershell
cd frontend
npm install
npm run dev
```

Frontend działa na `http://localhost:5173` i korzysta z proxy `/api` do backendu na `http://localhost:8080`.

## Baza danych

- H2 zapisuje dane w katalogu `backend/data/`,
- usunięcie plików z tego katalogu czyści stan aplikacji.

## Konta testowe

- `admin@school.local` / `Admin123!`
- `director@school.local` / `Director123!`
- `secretary@school.local` / `Secretary123!`
- `teacher@school.local` / `Teacher123!`
- `student@school.local` / `Student123!`
- `parent@school.local` / `Parent123!`