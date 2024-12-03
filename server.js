import express from 'express'
import session from 'express-session'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/database.js'
import authRoutes from './routes/auth.js'
import indexRoutes from './routes/index.js'
import adminRoutes from './routes/admin.js'
import menuRoutes from './routes/menu.js'
import cateringRoutes from './routes/catering.js'
import eventsRoutes from './routes/events.js'
import panelControlRoutes from './routes/panelControl.js'
import commentsRoutes from './routes/comments.js'
import ordersRoutes from './routes/orders.js'
import paymentsRoutes from './routes/payments.js'

const app = express()
const port = process.env.PORT || 3000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Conectar a MongoDB
connectDB()

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Configuración de sesión
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  },
  proxy: true
}))


// Routes
app.use('/auth', authRoutes)
app.use('/', indexRoutes)
app.use('/admin', adminRoutes)
app.use('/menu', menuRoutes)
app.use('/catering', cateringRoutes)
app.use('/events', eventsRoutes)
app.use('/panelControl', panelControlRoutes)
app.use('/comments', commentsRoutes)
app.use('/orders', ordersRoutes)
app.use('/payments', paymentsRoutes)


app.use(express.static('public'))

// Middleware para manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).redirect('/auth/login?error=server_error')
})

// Error 404 
app.use((req, res) => {
  res.status(404).redirect('/?error=page_not_found')
})

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`)
}) 