const express = require('express');
const session = require('express-session');
const loginRoutes = require("./routes/login-routes");
const registerRoutes = require("./routes/register-routes");
const accountRoutes = require("./routes/account-routes");

const app = express();
const path = require('path');
const { getPopularMovies } = require("./data/movies");
const { connectDB } = require("./data/mongo");
app.set("view engine", "ejs");
app.use(express.urlencoded({extended: true}));

// secret: signs the session cookie
// resave: false: avoids saving unchanged sessions
// saveUninitialized: false: don’t create empty sessions for everyone
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized: false
}));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.currentUser = req.session.currentUser || null;
    next(); 
});

// use routes
app.use("/", loginRoutes);  
app.use("/", registerRoutes);
app.use("/", accountRoutes);

connectDB()
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
  });

  
function startServer() {
  const hostname = "localhost"; // Define server hostname
  const port = 8000;// Define port number
 
  // Start the server and listen on the specified hostname and port
  app.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
  });
}

connectDB().then(startServer);


//Routes
let movies = [
    {title: "The Shawshank Redemption", review: "9.3", date:"3/9/2026", isWatched:"Yes"},
    {title: "Pulp Fiction", review: "8.3", date: "3/9/2026", isWatched:"Yes"},
    {title: "The Dark Knight", review: "8.3", date: "3/9/2026", isWatched:"No"}
]

app.use('/watchlist', watchListRoutes);

app.get("/", async (req, res) => {
  const movies = await getPopularMovies();
  res.render("home", { movies });
});

const hostname = "localhost";
const port = 3000;
app.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
