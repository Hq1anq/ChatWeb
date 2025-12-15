import express from 'express';
import  protectedRoute  from '../middleware/auth.middleware.js'; // Đảm bảo đường dẫn đúng
import { 
    createGroup, 
    getMyGroups, 
    getGroupDetails,
    updateGroupNickname
} from '../controller/group.controller.js';

const router = express.Router();

// Tất cả các routes đều cần đăng nhập
router.use(protectedRoute);

// API: Lấy danh sách nhóm của tôi
router.get('/', getMyGroups);

// API: Tạo nhóm mới
router.post('/create', createGroup);

// API: Lấy chi tiết thành viên trong nhóm (dùng id nhóm)
router.get('/:groupId/members', getGroupDetails);

router.put('/:groupId/nickname', updateGroupNickname);

export default router;