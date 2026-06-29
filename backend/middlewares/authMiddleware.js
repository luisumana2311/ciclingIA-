const jwt = require("jsonwebtoken");
const Usuario = require("../models/Usuario");

const protegerRuta = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        mensaje: "No autorizado. Token no enviado.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await Usuario.findById(decoded.usuarioId).select(
      "-password",
    );

    if (!usuario || !usuario.activo) {
      return res.status(401).json({
        mensaje: "No autorizado. Usuario inválido.",
      });
    }

    req.usuario = {
      id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
      atletaId: usuario.atletaId,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      mensaje: "Token inválido o expirado",
      error: error.message,
    });
  }
};

module.exports = {
  protegerRuta,
};
