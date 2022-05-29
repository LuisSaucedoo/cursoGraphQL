const Usuario = require('../models/Usuario');
const Producto = require('../models/Producto');
const Cliente = require('../models/Cliente');

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
      },

      obtenerProducto: async(_, { id }) => {
        // Revisar si el producto existe o no
        const producto = await Producto.findById(id);
        if ( !producto ) {
          throw new Error('Producto no encontrado');
        }
        return producto;
      },

      obtenerClientes: async() => {
        try {
          const clientes = await Cliente.find({});
          return clientes;
        } catch (error) {
          console.log(error);
        }
      },

      obtenerClientesVendedor: async(_, {}, ctx) => {
        try {
          const clientes = await Cliente.find({ vendedor: ctx.usuario.id.toString() });
          return clientes;
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
      },

      actualizarProducto: async(_, { id, input }) => {
        // Revisar si el producto existe o no
        let producto = await Producto.findById(id);
        if ( !producto ) {
          throw new Error('Producto no encontrado');
        }

        // Si existe, guardarlo en la base de datos
        producto = await Producto.findOneAndUpdate({ _id : id }, input, { new: true });
        return producto;
      },

      eliminarProducto: async(_, { id }) => {
        // Revisar si el producto existe o no
        let producto = await Producto.findById(id);
        if ( !producto ) {
          throw new Error('Producto no encontrado');
        }

        // Si existe, eliminarlo
        await Producto.findOneAndDelete({ _id : id });
        return "Producto Eliminado";
      },

      nuevoCliente: async(_, { input }, ctx) => {
        console.log(ctx);

        const { email } = input;
        // Verificar si el cliente ya está registrado
        
        const cliente = await Cliente.findOne({email});
        if (cliente) {
          throw new Error('Ese cliente ya está registrado');
        }

        const nuevoCliente = new Cliente(input);

        // Asignar el vendedor
        nuevoCliente.vendedor = ctx.usuario.id;
        
        // Guardar en la base de datos
        try {
          const resultado = await nuevoCliente.save();
          return resultado;
        } catch (error) {
          console.log(error);
        }
      }

    }
}

module.exports = resolvers;