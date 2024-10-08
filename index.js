// Importar las librerías necesarias
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const db = require('./database'); // Importar la base de datos

// Crear una instancia de Express
const app = express();

// Configurar el puerto
const port = process.env.PORT || 3000;

// Configurar el motor de plantillas (EJS)
app.set('view engine', 'ejs');

// Configurar la carpeta de vistas
app.set('views', path.join(__dirname, 'views'));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para manejar datos de formularios
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware para manejar sesiones
app.use(session({
  secret: 'tu_secreto', // Cambia esto por una cadena segura
  resave: false,
  saveUninitialized: true
}));

// Rutas básicas
app.get('/', (req, res) => {
  res.render('index', { title: 'Página de Inicio' });
});

app.get('/login', (req, res) => {
  res.render('login', { title: 'Iniciar Sesión' });
});

app.get('/register', (req, res) => {
  res.render('register', { title: 'Registro de Usuario' });
});

// Ruta POST para el registro de usuarios
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  console.log('Datos recibidos para registro:', name, email, password); // Depuración

  // Encriptar la contraseña antes de guardarla
  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Error al encriptar la contraseña:', err); // Depuración
      return res.render('mensaje', { mensaje: 'Error al encriptar la contraseña.' });
    }

    // Guardar el nuevo usuario en la base de datos
    const query = `INSERT INTO usuarios (nombre, email, contraseña) VALUES (?, ?, ?)`;
    db.run(query, [name, email, hash], (err) => {
      if (err) {
        console.error('Error al guardar en la base de datos:', err); // Depuración
        if (err.code === 'SQLITE_CONSTRAINT') {
          return res.render('mensaje', { mensaje: 'El correo electrónico ya está en uso.' });
        }
        return res.render('mensaje', { mensaje: 'Error al registrar el usuario.' });
      }

      console.log('Registro exitoso para:', email); // Depuración
      res.render('mensaje', { mensaje: 'Registro exitoso. ¡Ahora puedes iniciar sesión!' });
    });
  });
});

// Ruta POST para el inicio de sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  console.log('Datos recibidos para iniciar sesión:', email); // Depuración

  // Buscar al usuario en la base de datos
  const query = `SELECT * FROM usuarios WHERE email = ?`;
  db.get(query, [email], (err, user) => {
    if (err) {
      console.error('Error al buscar en la base de datos:', err); // Depuración
      return res.render('mensaje', { mensaje: 'Error al iniciar sesión.' });
    }

    if (!user) {
      console.log('Usuario no encontrado:', email); // Depuración
      return res.render('mensaje', { mensaje: 'Correo electrónico o contraseña incorrectos.' });
    }

    // Comparar las contraseñas
    bcrypt.compare(password, user.contraseña, (err, result) => {
      if (err) {
        console.error('Error al comparar contraseñas:', err); // Depuración
        return res.render('mensaje', { mensaje: 'Error al iniciar sesión.' });
      }

      if (result) {
        console.log('Inicio de sesión exitoso para:', email); // Depuración
        res.render('mensaje', { mensaje: '¡Inicio de sesión exitoso!' });
      } else {
        console.log('Contraseña incorrecta para:', email); // Depuración
        res.render('mensaje', { mensaje: 'Correo electrónico o contraseña incorrectos.' });
      }
    });
  });
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});