exports.home = (req, res, next) => {
    res.status(200).json({
         message: "Welcome to the pokeworld API. In order to find out about the correct request formats, please navigate to /help"
    })
}