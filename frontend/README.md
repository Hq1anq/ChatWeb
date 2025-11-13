# Frontend - Week4

## 1. Kết nối Socket.IO

Sau khi user đăng nhập thành công, frontend cần:

### A. Kết nối socket

```ts
const socket = io('http://localhost:5000', {
  query: {
    token: 'user-access-token',
  },
})
```

### B. Emit `add-user`

```ts
socket.emit('add-user', userId) // userId: string
```

### C. Lắng nghe online users

```ts
socket.on('online-users', (onlineUserIds: string[]) => {
  // Cập nhật Redux/Context
})
```

---

## 2. UI Sidebar - Hiển thị Online Badge

FE sẽ nhận được danh sách `userIds` đang online từ socket.  
So sánh danh sách này với `allUsers` để hiển thị chấm xanh bên cạnh avatar:

```ts
const isOnline = onlineUsers.includes(user.id)
```

Badge: hiển thị nếu online

---

## 3. Gửi Tin Nhắn (POST /messages)

### API Spec:

- **Endpoint**: `POST /messages`
- **Payload**:

```json
{
  "from": "user123",
  "to": "user456",
  "text": "Hello",
  "conversationId": "conv001"
}
```

- **Response**:

```json
{
  "id": "msg001",
  "from": "user123",
  "to": "user456",
  "text": "Hello",
  "timestamp": "2025-11-14T12:00:00Z",
  "conversationId": "conv001"
}
```

### FE flow:

1. Gửi API trước
2. Hiển thị message tạm (optimistic UI)
3. Khi response về: thay message local bằng server message (gồm `id` và `timestamp`)

---

## 4. Nhận Tin Nhắn Realtime (Socket: `receive-message`)

### Khi có message mới:

```ts
socket.on('receive-message', (msg) => {
  // Nếu đang ở đúng conversation → append UI + scroll
  // Nếu đang ở nơi khác → tăng badge unread
})
```

### Message object:

```json
{
  "id": "msg001",
  "from": "user456",
  "to": "user123",
  "text": "Hi",
  "timestamp": "2025-11-14T12:00:00Z",
  "conversationId": "conv001"
}
```

---

## 5. Tips để Dev không cần chờ Backend

### Mock Socket

```ts
const mockSocket = {
  emit: (event, payload) => console.log('Emit:', event, payload),
  on: (event, cb) => {
    if (event === 'online-users') {
      cb(['user123', 'user789'])
    }
    if (event === 'receive-message') {
      cb({
        id: 'msg999',
        from: 'user456',
        to: 'user123',
        text: 'Mock message',
        timestamp: new Date().toISOString(),
        conversationId: 'conv001',
      })
    }
  },
}
```
