import express from 'express'
import Comment from '../models/Comment.js'
import nodemailer from 'nodemailer'
import env from '../config/env.js'
const router = express.Router()

// Configuración de correo electrónico
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.email.user,
    pass: env.email.pass
  }
})

// Función de detección de spam
function isSpam(content) {
  const spamTriggers = ['casino', 'viagra', 'lottery', 'winner', 'free money']
  return spamTriggers.some(trigger => content.toLowerCase().includes(trigger))
}

// Agregar nuevo comentario
router.post('/add', async (req, res) => {
  try {
    const { content } = req.body

    // Validación básica
    if (!content || content.length < 5) {
      return res.status(400).json({ error: 'El comentario debe tener al menos 5 caracteres' })
    }

    if (content.length > 500) {
      return res.status(400).json({ error: 'El comentario no puede exceder 500 caracteres' })
    }

    // Comprobar si es spam
    if (isSpam(content)) {
      return res.status(400).json({ error: 'El comentario ha sido detectado como spam' })
    }

    // Guardar comentario
    const comment = new Comment({ content })
    await comment.save()

    // Enviar notificación por correo electrónico
    const mailOptions = {
      from: 'metcashew154351@gmail.com',
      to: 'metcashew154351@gmail.com',
      subject: 'Nuevo comentario en Dorichangos',
      text: `Nuevo comentario recibido:\n\n${content}\n\nRevisa el panel de administración para aprobarlo o rechazarlo.`
    }

    await transporter.sendMail(mailOptions)

    res.status(201).json({ 
      message: 'Comentario enviado exitosamente. Será revisado antes de ser publicado.' 
    })
  } catch (error) {
    console.error('Error saving comment:', error)
    res.status(500).json({ error: 'Error al guardar el comentario' })
  }
})

export default router