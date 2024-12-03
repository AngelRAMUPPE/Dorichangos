import express from 'express'
import Comment from '../models/Comment.js'
import nodemailer from 'nodemailer'
import env from '../config/env.js'
import crypto from 'crypto';
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
    const { content, email } = req.body

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

    // generar token de verificación
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // guardar comentario
    const comment = new Comment({
      content,
      email,
      verificationToken,
      status: 'pending'
    });
    await comment.save();

    // Send verification email
    const verificationUrl = `https://dorichangos.onrender.com/comments/verify/${verificationToken}`;
    const mailOptions = {
      from: env.email.user,
      to: email,
      subject: 'Verifica tu comentario - Dorichangos',
      html: `
        <h1>Verifica tu comentario</h1>
        <p>Gracias por comentar. Por favor, haz clic en el siguiente enlace para verificar tu comentario:</p>
        <a href="${verificationUrl}">${verificationUrl}</a>
        <p>El enlace expirará en 24 horas.</p>
      `
    };

    await transporter.sendMail(mailOptions);
    
    res.status(201).json({ 
      message: 'Por favor revisa tu correo electrónico para verificar tu comentario.' 
    });
  } catch (error) {
    console.error('Error saving comment:', error)
    res.status(500).json({ error: 'Error al guardar el comentario' })
  }
})
// Agregar endpoint de verificación
router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;
    
    const comment = await Comment.findOne({ 
      verificationToken: token,
      status: 'pending',
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    let redirectMessage;
        if (!comment) {
            redirectMessage = 'invalid';
        } else {
            comment.status = 'pending';
            comment.verified = true;
            comment.verificationToken = undefined;
            await comment.save();

            // Notify admin about new verified comment
            const adminMailOptions = {
                from: env.email.user,
                to: "angelram1@outlook.com",
                subject: 'Nuevo comentario verificado en Dorichangos',
                text: `Nuevo comentario verificado:\n\n${comment.content}\n\nEmail: ${comment.email}\n\nRevisa el panel de administración para aprobarlo o rechazarlo.`
            };

            await transporter.sendMail(adminMailOptions);
            redirectMessage = 'success';
        }

        // Redirect to index with status
        res.redirect(`/?verificationStatus=${redirectMessage}`);
    } catch (error) {
        console.error('Error verifying comment:', error);
        res.redirect('/?verificationStatus=error');
    }
});


export default router