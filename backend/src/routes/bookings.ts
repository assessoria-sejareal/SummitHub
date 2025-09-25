import { Router } from 'express'
import { BookingController } from '../controllers/bookings/BookingController'
import { authMiddleware, adminMiddleware } from '../middlewares/auth'
import { csrfProtection } from '../middlewares/csrf'

const router = Router()
const bookingController = new BookingController()

router.post('/', authMiddleware, bookingController.create)
router.get('/', authMiddleware, bookingController.list)
router.get('/all', authMiddleware, adminMiddleware, bookingController.listAll)
router.delete('/:id', authMiddleware, bookingController.cancel)
router.get('/stations', authMiddleware, bookingController.getStations)

export default router