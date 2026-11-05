# SmartBrain

Local face-detection app. Register an account, paste a direct image URL, and the page draws a box around each face. Accounts and the detection count are stored in Postgres.

Face detection runs in the browser with [face-api](https://github.com/vladmandic/face-api) (SSD MobileNet). Clarifai is no longer free, so this project does not call it.

## Run

Start the database from this folder:

```
docker compose up -d
```

API, in `smartbrain-backend` (http://localhost:3030):

```
npm install
npm start
```

Site, in `smartbrain-frontend` (http://localhost:3000):

```
npm install
npm start
```

Database settings and `JWT_SECRET` live in `smartbrain-backend/.env`. The Docker database is published on port 5433 so it does not collide with another Postgres already using 5432.

Sign-in sets an httpOnly cookie. Profile, the entry counter, and the image proxy all require that cookie. The proxy refuses localhost and private-network URLs.
