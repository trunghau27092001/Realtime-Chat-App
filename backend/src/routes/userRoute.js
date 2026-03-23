import express from 'express'
import { getUserInfo } from '../controller/userController.js';

const router = express.Router();

router.get('/info', getUserInfo);

export default router 