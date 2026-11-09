function verificarToken(req, res, next){
    const auth = req.headers.authorization

    if (auth !== `Bearer ${process.env.TOKEN}`) {
        return res.status(401).json({ erro: "Não autorizado" });
    }
    next();
    
}

module.exports = verificarToken;