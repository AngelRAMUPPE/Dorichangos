import express from 'express'
import { requireAuth} from '../middleware/auth.js'
import path from 'path'
import { fileURLToPath } from 'url'

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ruta del panel de control
router.get('/', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/panelControl.html'))
})

export default router 