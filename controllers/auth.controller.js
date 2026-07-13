const { Usuario } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    if (!usuario.activo) {
      return res.status(401).json({ message: 'Usuario desactivado' });
    }

    const passwordValido = await usuario.validarPassword(password);
    if (!passwordValido) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        id: usuario.id, 
        email: usuario.email, 
        rol: usuario.rol,
        canton_asignado: usuario.canton_asignado,
        comunidad_asignada: usuario.comunidad_asignada
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol,
        canton_asignado: usuario.canton_asignado,
        comunidad_asignada: usuario.comunidad_asignada
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const register = async (req, res) => {
  try {
    // Solo admin puede crear usuarios (verificación se hará en ruta con middleware de rol)
    const { nombre, email, password, rol, canton_asignado, comunidad_asignada } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: 'Faltan datos obligatorios' });
    }
    const existe = await Usuario.findOne({ where: { email } });
    if (existe) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    const usuario = await Usuario.create({
      nombre, email, password_hash: password, rol, canton_asignado, comunidad_asignada, activo: true
    });
    res.status(201).json({ message: 'Usuario creado', usuario: { id: usuario.id, email: usuario.email, rol: usuario.rol } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear usuario' });
  }
};

const getMe = async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.user.id, { attributes: { exclude: ['password_hash'] } });
    if (!usuario) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(usuario);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { login, register, getMe };