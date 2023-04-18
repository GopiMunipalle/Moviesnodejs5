const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`Db Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

//Get movies
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
    SELECT movie_name as movieName
    FROM movie;`;
  const getMoviesArray = await db.all(getMoviesQuery);
  response.send(getMoviesArray);
});

//Post Movie
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `
    INSERT INTO
        movie (director_id,movie_name,lead_actor)
    VALUES
        (${directorId},'${movieName}','${leadActor}');`;
  const addMovieArray = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

//Get Movie
const convertDbToResponse = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
    SELECT *
    FROM movie
    WHERE 
        movie_id=${movieId};`;
  const getMovieArray = await db.get(getMovieQuery);
  response.send(convertDbToResponse(getMovieArray));
});

//Update Movie
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE
    movie
    SET 
    director_id=${directorId},
    movie_name='${movieName}',
    lead_actor='${leadActor}'
    WHERE
        movie_id=${movieId};`;
  const updateMovieArray = await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//Delete Movie
app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovie = `DELETE FROM movie 
    WHERE movie_id=${movieId};`;
  const deleteMovieArray = await db.run(deleteMovie);
  response.send("Movie Removed");
});

//Get Directors
const convertDbToDirectorResponse = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getDirectors = `SELECT *
    FROM director;`;
  const getDirectorArray = await db.all(getDirectors);
  response.send(
    getDirectorArray.map((each) => convertDbToDirectorResponse(each))
  );
});

//Get MovieNames
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNames = `SELECT movie_name as movieName
    FROM movie
    WHERE director_id=${directorId};`;
  const movieName = await db.all(getMovieNames);
  response.send(movieName);
});

module.exports = app;
