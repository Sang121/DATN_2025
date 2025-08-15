const express = require('express');
const router = express.Router();
const returnRequestController = require('../controllers/returnRequestController');
const authUserMiddleware = require('../middleware/authUserMiddleware');
const authAdminMiddleware = require('../middleware/authAdminMiddleware');

// Routes cho user
router.post('/orders/:orderId/return-request', authUserMiddleware, returnRequestController.createReturnRequest);
router.get('/user/return-requests', authUserMiddleware, returnRequestController.getUserReturnRequests);
router.get('/return-requests/:id', authUserMiddleware, returnRequestController.getReturnRequestDetail);

// Routes cho admin
router.get('/admin/return-requests', authAdminMiddleware, returnRequestController.getAllReturnRequests);
router.put('/admin/return-requests/:id/process', authAdminMiddleware, returnRequestController.processReturnRequest);
router.put('/admin/return-requests/:id/complete', authAdminMiddleware, returnRequestController.markAsCompleted);
router.get('/admin/return-requests/stats', authAdminMiddleware, returnRequestController.getReturnRequestStats);

module.exports = router;
