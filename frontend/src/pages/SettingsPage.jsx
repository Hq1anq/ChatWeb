import React from 'react'
import { Bell, UserCheck, ShieldOff, Trash2 } from 'lucide-react'

const SettingsPage = () => {
  // Hàm mở modal (DaisyUI)
  const openDeleteModal = () => {
    document.getElementById('delete_account_modal').showModal()
  }

  return (
    <div className="h-full bg-base-200 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Cài đặt</h1>

        {/* Phần cài đặt chung */}
        <div className="card w-full bg-base-100 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4">Chung</h2>

            {/* Toggle thông báo */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text flex items-center gap-2">
                  <Bell size={18} />
                  Bật thông báo đẩy
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  defaultChecked
                />
              </label>
            </div>

            {/* Toggle trạng thái online */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text flex items-center gap-2">
                  <UserCheck size={18} />
                  Hiển thị trạng thái "Online"
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary"
                  defaultChecked
                />
              </label>
            </div>

            {/* Toggle tắt thông báo từ người lạ */}
            <div className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text flex items-center gap-2">
                  <ShieldOff size={18} />
                  Chặn tin nhắn từ người lạ
                </span>
                <input type="checkbox" className="toggle toggle-primary" />
              </label>
            </div>
          </div>
        </div>

        {/* Phần Khu vực nguy hiểm */}
        <div className="card w-full bg-error/10 border border-error shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-4 text-error">
              Khu vực nguy hiểm
            </h2>
            <p>Các hành động sau đây không thể hoàn tác. Xin hãy cẩn thận.</p>
            <div className="card-actions justify-between items-center mt-4">
              <span className="font-medium">
                Xoá tài khoản của bạn vĩnh viễn.
              </span>
              <button
                className="btn btn-error btn-outline"
                onClick={openDeleteModal}
              >
                <Trash2 size={18} /> Xoá tài khoản
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal xác nhận xoá tài khoản */}
      <dialog id="delete_account_modal" className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error">Bạn có chắc chắn?</h3>
          <p className="py-4">
            Hành động này không thể hoàn tác. Toàn bộ dữ liệu của bạn, bao gồm
            các cuộc trò chuyện và thông tin cá nhân, sẽ bị xoá vĩnh viễn.
          </p>
          <p>
            Vui lòng nhập <strong className="text-error">xoá tài khoản</strong>{' '}
            để xác nhận.
          </p>
          <input
            type="text"
            placeholder="xoá tài khoản"
            className="input input-bordered input-error w-full mt-2"
          />
          <div className="modal-action">
            <form method="dialog">
              {/* Nút đóng modal */}
              <button className="btn btn-ghost mr-2">Huỷ</button>
            </form>
            {/* TODO: Thêm logic disable nút này nếu input không khớp */}
            <button className="btn btn-error">Tôi hiểu, Xoá tài khoản</button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>Đóng</button>
        </form>
      </dialog>
    </div>
  )
}

export default SettingsPage
