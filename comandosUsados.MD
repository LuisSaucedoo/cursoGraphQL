# Para inicializar el proyecto dede 0:
npm init

# Luego se procede a instalar dos dependencias:
1) npm i apollo-server
2) npm i -D nodemon
3) npm i graphql
4) npm i mongoose dotenv
4) npm i bcryptjs
4) npm i jsonwebtoken 

# Explicación de algunas dependencias:
## nodemon lo que hace es ir reiniciando el servidor mientras vamos haciendo cambios -> -D porque es una dependencia de Desarrollo
## bcryptjs es para hashear las contraseñas


## Para correr el programa :
1) en package.json modificamos los scripts
2) creamos en la base un archivo llamado: index.js
3) npm run dev    -> esto es para correr el programa