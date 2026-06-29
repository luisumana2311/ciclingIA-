const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Usuario = require("../models/Usuario");
const PerfilAtleta = require("../models/PerfilAtleta");

const generarToken = (usuario) => {
  return jwt.sign(
    {
      usuarioId: usuario._id,
      atletaId: usuario.atletaId,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );
};

const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({
        mensaje: "Nombre, email y contraseña son obligatorios",
      });
    }

    const usuarioExiste = await Usuario.findOne({ email });

    if (usuarioExiste) {
      return res.status(400).json({
        mensaje: "Ya existe un usuario con ese email",
      });
    }

    const perfil = await PerfilAtleta.create({
      nombre,
      disponibilidad: {
        lunes: 0,
        martes: 0,
        miercoles: 0,
        jueves: 0,
        viernes: 0,
        sabado: 0,
        domingo: 0,
      },
      estadoActual: "Nuevo",
    });

    const passwordHash = await bcrypt.hash(password, 10);

    const usuario = await Usuario.create({
      nombre,
      email,
      password: passwordHash,
      atletaId: perfil._id,
    });

    const token = generarToken(usuario);

    res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        atletaId: usuario.atletaId,
      },
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error registrando usuario",
      error: error.message,
    });
  }
};

const loginUsuario = async (req, res) => {
  try {
    const { email, password } = req.body;

    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({
        mensaje: "Credenciales inválidas",
      });
    }

    const token = generarToken(usuario);

    res.json({
      mensaje: "Login correcto",
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        atletaId: usuario.atletaId,
      },
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error en login",
      error: error.message,
    });
  }
};

module.exports = {
  registrarUsuario,
  loginUsuario,
};
