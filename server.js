const express = require("express");
const server = express();
server.use(express.urlencoded({ extended: true }));
server.set("view engine", "ejs");

movies = [
    {title: "The Shawshank Redemption", review: "9.3", date:"3/9/2026", isWatched:"Yes"},
    {title: "Pulp Fiction", review: "8.3", date: "3/9/2026", isWatched:"Yes"},
    {title: "The Dark Knight", review: "8.3", date: "3/9/2026", isWatched:"No"}
]

server.get("/watchlist", (req, res) => {
    res.render("watchlist", {movies})
})

server.get("/", (req, res) => {
    res.render("home")
})

const hostname = "localhost";
const port = 8000;

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});