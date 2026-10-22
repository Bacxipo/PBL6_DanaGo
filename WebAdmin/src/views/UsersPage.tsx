'use client';

import React, { useMemo, useState } from 'react';
import Header from '@/components/Header';
import { Modal, Field, ModalActions, inputClass, PageHeading, searchInputClass, selectClass, AsyncContent } from '@/components/ui';
import { useApi, upsertById, avatarFallback, formatDate } from '@/lib/utils';
import { useAction, useAuth } from '@/lib/context';
import type { CreateUserInput, User, UserRole, UserStatus } from '@/lib/types';
import { UserPlus, Search, Shield, Mail, Users, UserCheck, Clock, Lock } from 'lucide-react';
import { userApi } from '@/lib/api';

const ROLE_BADGE: Record<UserRole, string> = {
  ADMIN: 'bg-purple-50 text-purple-700 border-purple-200',
  STAFF: 'bg-[#006971]/10 text-[#006971] border-[#006971]/20',
  USER: 'bg-gray-100 text-gray-700 border-gray-200'
};

const STATUS_BADGE: Record<UserStatus, { label: string; className: string; dot: string }> = {
  ACTIVE: { label: 'Hoạt động', className: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  PENDING: { label: 'Chờ kích hoạt', className: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  LOCKED: { label: 'Đã khóa', className: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' }
};

const emptyForm: CreateUserInput = { fullName: '', username: '', email: '', password: '', role: 'STAFF' };

export default function UsersPage() {
  const { user: me } = useAuth();
  const { data: users, loading, error, reload, setData } = useApi(userApi.list);
  const { run, busy } = useAction();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<CreateUserInput>(emptyForm);

  const filteredUsers = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return (users ?? []).filter(
      (u) =>
        (u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)) &&
        (selectedRole === 'ALL' || u.role === selectedRole) &&
        (selectedStatus === 'ALL' || u.status === selectedStatus)
    );
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const count = (status?: UserStatus) => (users ?? []).filter((u) => !status || u.status === status).length;
  const stats = [
    { label: 'Tổng tài khoản', value: count(), icon: Users, className: 'bg-[#e6f4f2] text-[#006971]' },
    { label: 'Đang hoạt động', value: count('ACTIVE'), icon: UserCheck, className: 'bg-emerald-50 text-emerald-600' },
    { label: 'Chờ kích hoạt', value: count('PENDING'), icon: Clock, className: 'bg-amber-50 text-amber-600' },
    { label: 'Đã khóa', value: count('LOCKED'), icon: Lock, className: 'bg-rose-50 text-rose-600' }
  ];

  // Cập nhật 1 dòng trong danh sách bằng kết quả API trả về (không cần tải lại cả bảng)
  const replaceUser = (updated: User) => setData((xs) => upsertById(xs, updated));

  const changeStatus = (u: User, status: UserStatus) =>
    run(async () => replaceUser(await userApi.setStatus(u.id, status)), `Đã cập nhật trạng thái của ${u.fullName}.`);

  const changeRole = (u: User, role: UserRole) =>
    run(async () => replaceUser(await userApi.setRole(u.id, role)), `${u.fullName} giờ là ${role}.`);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await run(async () => {
      const created = await userApi.create(formData);
      setData((xs) => upsertById(xs, created));
    }, 'Đã tạo tài khoản nhân viên.');
    if (ok) setIsModalOpen(false);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Quản Lý Tài Khoản" breadcrumb="Phân quyền & Người dùng" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <PageHeading
          title="Người Dùng & Phân Quyền"
          description="Quản trị viên (ADMIN), nhân viên kiểm duyệt (STAFF) và du khách (USER)"
          actionLabel="Thêm Tài Khoản Nhân Viên"
          onAction={() => {
            setFormData(emptyForm);
            setIsModalOpen(true);
          }}
        />

        <AsyncContent loading={loading} error={error} data={users} onRetry={reload}>
          {() => (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => (
                  <div key={s.label} className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.className}`}>
                      <s.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xl font-black text-gray-900">{s.value}</p>
                      <p className="text-[11px] font-semibold text-gray-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-4 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input type="search" placeholder="Tìm theo tên, username, email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className={searchInputClass} />
                </div>
                <div className="flex items-center gap-2 w-full md:w-auto">
                  <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value as UserRole | 'ALL')} className={selectClass} aria-label="Lọc vai trò">
                    <option value="ALL">Tất cả vai trò</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                    <option value="USER">USER</option>
                  </select>
                  <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value as UserStatus | 'ALL')} className={selectClass} aria-label="Lọc trạng thái">
                    <option value="ALL">Tất cả trạng thái</option>
                    <option value="ACTIVE">Hoạt động</option>
                    <option value="PENDING">Chờ kích hoạt</option>
                    <option value="LOCKED">Đã khóa</option>
                  </select>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] bg-[#e6f4f2] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Người dùng</th>
                        <th className="py-3 px-4">Username</th>
                        <th className="py-3 px-4">Vai trò</th>
                        <th className="py-3 px-4">Ngày tham gia</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e2e8f0] text-xs">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-gray-400">Không tìm thấy người dùng phù hợp.</td>
                        </tr>
                      ) : (
                        filteredUsers.map((user) => {
                          const st = STATUS_BADGE[user.status];
                          const isSelf = user.id === me?.id;
                          return (
                            <tr key={user.id} className="hover:bg-[#e6f4f2]/60 transition-colors">
                              <td className="py-3.5 px-4">
                                <div className="flex items-center gap-3">
                                  <img src={user.avatarUrl || avatarFallback(user.username)} alt="" className="w-10 h-10 rounded-xl bg-[#e6f4f2] border border-gray-200 object-cover" />
                                  <div>
                                    <p className="font-bold text-gray-900">
                                      {user.fullName} {isSelf && <span className="text-[10px] text-[#006971]">(bạn)</span>}
                                    </p>
                                    <p className="text-[11px] text-gray-400 flex items-center gap-1">
                                      <Mail className="w-3 h-3" /> {user.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-gray-600">@{user.username}</td>
                              <td className="py-3.5 px-4">
                                {isSelf ? (
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] border ${ROLE_BADGE[user.role]}`}>
                                    <Shield className="w-3 h-3" /> {user.role}
                                  </span>
                                ) : (
                                  <select
                                    value={user.role}
                                    disabled={busy}
                                    onChange={(e) => changeRole(user, e.target.value as UserRole)}
                                    aria-label={`Vai trò của ${user.fullName}`}
                                    className={`px-2 py-1 rounded-full font-bold text-[11px] border outline-none cursor-pointer ${ROLE_BADGE[user.role]}`}
                                  >
                                    <option value="ADMIN">ADMIN</option>
                                    <option value="STAFF">STAFF</option>
                                    <option value="USER">USER</option>
                                  </select>
                                )}
                              </td>
                              <td className="py-3.5 px-4 text-gray-600 font-medium">{formatDate(user.createdAt)}</td>
                              <td className="py-3.5 px-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${st.className}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`}></span>
                                  {st.label}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                {!isSelf && (
                                  <div className="flex items-center justify-end gap-2">
                                    {user.status === 'PENDING' && (
                                      <button disabled={busy} onClick={() => changeStatus(user, 'ACTIVE')} className="px-3 py-1 rounded-lg text-xs font-bold bg-[#006971] text-white hover:bg-[#005258] transition-colors cursor-pointer disabled:opacity-60">
                                        Kích hoạt
                                      </button>
                                    )}
                                    {user.status === 'LOCKED' ? (
                                      <button disabled={busy} onClick={() => changeStatus(user, 'ACTIVE')} className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer disabled:opacity-60">
                                        Mở khóa
                                      </button>
                                    ) : (
                                      <button disabled={busy} onClick={() => changeStatus(user, 'LOCKED')} className="px-3 py-1 rounded-lg text-xs font-bold border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-60">
                                        Khóa
                                      </button>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </AsyncContent>
      </div>

      {isModalOpen && (
        <Modal title="Thêm Tài Khoản Nhân Viên" icon={UserPlus} maxWidth="max-w-md" onClose={() => setIsModalOpen(false)}>
          <form onSubmit={handleAddUser} className="space-y-3">
            <Field label="Họ và tên" required>
              <input type="text" required maxLength={100} value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} placeholder="Nguyễn Văn A" className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Username" required>
                <input type="text" required maxLength={50} pattern="[a-zA-Z0-9_.]+" title="Chỉ chữ, số, dấu _ và ." value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="nguyenvana" className={inputClass} />
              </Field>
              <Field label="Phân quyền" required>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className={inputClass}>
                  <option value="STAFF">STAFF</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </Field>
            </div>
            <Field label="Email" required>
              <input type="email" required maxLength={150} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="nhanvien@danago.vn" className={inputClass} />
            </Field>
            <Field label="Mật khẩu tạm" required>
              <input type="password" required minLength={6} autoComplete="new-password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Tối thiểu 6 ký tự" className={inputClass} />
            </Field>
            <ModalActions onCancel={() => setIsModalOpen(false)} submitLabel="Tạo Tài Khoản" busy={busy} />
          </form>
        </Modal>
      )}
    </div>
  );
}
