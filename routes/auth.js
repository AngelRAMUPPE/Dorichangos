import express from 'express'
import bcrypt from 'bcrypt'
import User from '../models/User.js'
import { redirectIfAuthenticated, validateLogin } from '../middleware/auth.js'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ruta de la página de inicio de sesión
router.get('/login', redirectIfAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'))
})

// Ruta POST para iniciar sesión
router.post('/login', [redirectIfAuthenticated, validateLogin], async (req, res) => {
  try {
    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {
      return res.redirect('/auth/login?error=invalid_credentials')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.redirect('/auth/login?error=invalid_credentials')
    }

    // Setear sesión de usuario
    req.session.user = {
      id: user._id,
      username: user.username,
      role: user.role
    }

    if (user.role === 'admin') {
      // Redirigir al panel de control en éxito
      return res.redirect('/admin')
    } else {
      // Redirigir al panel de control en éxito
      return res.redirect('/panelControl')
    }

  } catch (error) {
    console.error('Login error:', error)
    return res.redirect('/auth/login?error=server_error')
  }
})

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/')
})

export default router 