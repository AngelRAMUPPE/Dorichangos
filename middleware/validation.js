import validator from 'validator'

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body

  // Check for empty fields
  if (!username || !password) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  // Validate username format
  if (!validator.isAlphanumeric(username)) {
    return res.status(400).json({ error: 'invalid_username' })
  }

  // Validate password length
  if (password.length < 8) {
    return res.status(400).json({ error: 'password_too_short' })
  }

  next()
} 