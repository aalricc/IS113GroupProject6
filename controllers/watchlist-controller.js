
app.get("/watchlist", (req, res) => {
    res.render("watchlist", {movies})
})