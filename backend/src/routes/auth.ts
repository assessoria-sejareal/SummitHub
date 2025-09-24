import { Router } from 'express'
import { AuthController } from '../controllers/auth/AuthController'
import { csrfProtection, csrfTokenEndpoint } from '../middlewares/csrf'

const router = Router()
const authController = new AuthController()

router.get('/csrf-token', csrfTokenEndpoint)
router.post('/register', authController.register)
router.post('/login', authController.login)

export default router