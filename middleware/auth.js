export const requireAuth = (req, res, next) => {
  if (!req.session.user ) {
    return res.redirect('/auth/login?error=unauthorized')
  }
  next()
}

export const requireAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== 'admin') {
    req.session.destroy()
    return res.redirect('/auth/login?error=unauthorized')
  }
  next()
}

export const redirectIfAuthenticated = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'admin') {
    return res.redirect('/admin')
  } else if (req.session.user) {
    return res.redirect('/panelControl')
  }
  next()
}

export const validateLogin = (req, res, next) => {
  const { username, password } = req.body
  
  if (!username || !password) {
    return res.redirect('/auth/login?error=invalid_credentials')
  }
  
  next()
} 

