const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'variables.env' });

const crearToken = (usuario, secreta, expiresIn) => {
  console.log(usuario);
  const { id, email, nombre, apellido } = usuario;

  return jwt.sign( { id, email, nombre, apellido }, secreta, { expiresIn } )
}

// Resolvers
const resolvers = {
    Query: {
      obtenerUsuario: async(_, { token }) => {
        const usuarioId = await jwt.verify(token, process.env.SECRETA)
        return usuarioId
      },

      obtenerProductos: async () => {
        try {
          const productos = await Producto.find({});
          return productos;
        } catch (error) {
          console.log(error);
        }
      }
    },
    Mutation: {
      nuevoUsuario: async(_, { input }) => {
        const { email, password } = input;

        // Revisar si el usuario ya está registrado
        const existeUsuario = await Usuario.findOne({email});
        if ( existeUsuario ) {
          throw new Error('El usuario ya está registrado');
        }

        // Hashear su password
        const salt = await bcryptjs.genSalt(10);
        input.password = await bcryptjs.hash(password, salt);

        try {
          // Guardar en la base de datos
          const usuario = new Usuario(input);
          usuario.save(); // guardarlo
          return usuario;
        } catch (error) {
          console.log(error);
        }
        
      },

      autenticarUsuario: async(_, { input }) => {
        const { email, password } = input

        // Revisar si el usuario existe
        const existeUsuario = await Usuario.findOne({email});
        if ( !existeUsuario ) {
          throw new Error('El usuario no existe');
        }

        // Revisar si el password es correcto
        const passwordCorrecto = await bcryptjs.compare(password, existeUsuario.password);
        if ( !passwordCorrecto ) {
          throw new Error('El password es Incorrecto');
        }

        // Crear el token
        return {
          token: crearToken(existeUsuario, process.env.SECRETA, '24h')
        }
      },

      nuevoProducto: async(_, { input }) => {
        try {
          const producto = new Producto(input);

          // Almacenar en la base de datos
          const resultado = await producto.save();

          return resultado;
        } catch (error) {
          console.log(error);
        }
      }

    }
}

module.exports = resolvers;