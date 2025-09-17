import React, { useState, useEffect } from 'react';
import { User, Bell, Shield, HelpCircle, LogOut, Download, Upload, Smartphone, Edit3, Camera, Moon, Sun } from 'lucide-react';
import { ProfileSetupModal, UserProfile } from './ProfileSetupModal';

export function SettingsView() {
  const [notifications, setNotifications] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    // Load user profile from localStorage
    const savedProfile = localStorage.getItem('vietnamese-money-tracker-profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }

    // Load other settings
    const savedSettings = localStorage.getItem('vietnamese-money-tracker-settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setNotifications(settings.notifications ?? true);
      setBiometric(settings.biometric ?? false);
      setDarkMode(settings.darkMode ?? false);
    }
  }, []);

  useEffect(() => {
    // Save settings to localStorage
    const settings = {
      notifications,
      biometric,
      darkMode,
    };
    localStorage.setItem('vietnamese-money-tracker-settings', JSON.stringify(settings));
  }, [notifications, biometric, darkMode]);

  const handleProfileUpdate = () => {
    // Reload profile after update
    const savedProfile = localStorage.getItem('vietnamese-money-tracker-profile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  };

  const exportData = () => {
    const transactions = localStorage.getItem('vietnamese-money-tracker-transactions');
    const goals = localStorage.getItem('vietnamese-money-tracker-goals');
    const profile = localStorage.getItem('vietnamese-money-tracker-profile');
    const settings = localStorage.getItem('vietnamese-money-tracker-settings');

    const exportData = {
      transactions: transactions ? JSON.parse(transactions) : [],
      goals: goals ? JSON.parse(goals) : [],
      profile: profile ? JSON.parse(profile) : null,
      settings: settings ? JSON.parse(settings) : {},
      exportDate: new Date().toISOString(),
      version: '1.0.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vietmoney-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = JSON.parse(e.target?.result as string);
            
            if (data.transactions) {
              localStorage.setItem('vietnamese-money-tracker-transactions', JSON.stringify(data.transactions));
            }
            if (data.goals) {
              localStorage.setItem('vietnamese-money-tracker-goals', JSON.stringify(data.goals));
            }
            if (data.profile) {
              localStorage.setItem('vietnamese-money-tracker-profile', JSON.stringify(data.profile));
              setUserProfile(data.profile);
            }
            if (data.settings) {
              localStorage.setItem('vietnamese-money-tracker-settings', JSON.stringify(data.settings));
            }
            
            alert('Dữ liệu đã được nhập thành công! Vui lòng tải lại trang.');
          } catch (error) {
            alert('Lỗi: File không hợp lệ');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Cài đặt</h1>
          <p className="text-gray-600">Tùy chỉnh ứng dụng theo ý muốn</p>
        </div>

        {/* Profile Section */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Hồ sơ cá nhân</h3>
            <button
              onClick={() => setShowProfileModal(true)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          {userProfile ? (
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center relative">
                <span className="text-white text-xl font-bold">
                  {userProfile.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </span>
                <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                  <Camera className="w-3 h-3 text-white" />
                </button>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{userProfile.fullName}</h4>
                <p className="text-gray-600 text-sm">{userProfile.email}</p>
                {userProfile.occupation && (
                  <p className="text-gray-500 text-sm">{userProfile.occupation}</p>
                )}
                {userProfile.location && (
                  <p className="text-gray-500 text-sm">📍 {userProfile.location}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 mb-3">Chưa thiết lập hồ sơ</p>
              <button
                onClick={() => setShowProfileModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Thiết lập hồ sơ
              </button>
            </div>
          )}
        </div>

        {/* App Preferences */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Tùy chọn ứng dụng</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-gray-800 font-medium">Thông báo</span>
                  <p className="text-xs text-gray-500">Nhận thông báo về giao dịch và mục tiêu</p>
                </div>
              </div>
              <button
                onClick={() => setNotifications(!notifications)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  notifications ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  notifications ? 'transform translate-x-6' : ''
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Smartphone className="w-5 h-5 text-gray-600" />
                <div>
                  <span className="text-gray-800 font-medium">Bảo mật sinh trắc học</span>
                  <p className="text-xs text-gray-500">Sử dụng vân tay hoặc Face ID</p>
                </div>
              </div>
              <button
                onClick={() => setBiometric(!biometric)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  biometric ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  biometric ? 'transform translate-x-6' : ''
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
                <div>
                  <span className="text-gray-800 font-medium">Chế độ tối</span>
                  <p className="text-xs text-gray-500">Giao diện tối cho ban đêm</p>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  darkMode ? 'bg-red-600' : 'bg-gray-300'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  darkMode ? 'transform translate-x-6' : ''
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Language & Currency */}

        {/* Data Management */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Quản lý dữ liệu</h3>
          <div className="space-y-3">
            <button 
              onClick={exportData}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Download className="w-5 h-5 text-gray-600" />
              <div>
                <span className="text-gray-800 font-medium">Xuất dữ liệu</span>
                <p className="text-xs text-gray-500">Tải về file backup toàn bộ dữ liệu</p>
              </div>
            </button>
            
            <button 
              onClick={importData}
              className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Upload className="w-5 h-5 text-gray-600" />
              <div>
                <span className="text-gray-800 font-medium">Nhập dữ liệu</span>
                <p className="text-xs text-gray-500">Khôi phục từ file backup</p>
              </div>
            </button>
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Tài khoản</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <span className="text-gray-800 font-medium">Đổi mật khẩu</span>
                <p className="text-xs text-gray-500">Cập nhật mật khẩu bảo mật</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-red-50 rounded-lg transition-colors text-red-600">
              <LogOut className="w-5 h-5" />
              <div>
                <span className="font-medium">Đăng xuất</span>
                <p className="text-xs text-red-500">Thoát khỏi ứng dụng</p>
              </div>
            </button>
          </div>
        </div>

        {/* Support */}
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Hỗ trợ</h3>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <HelpCircle className="w-5 h-5 text-gray-600" />
              <div>
                <span className="text-gray-800 font-medium">Trung tâm trợ giúp</span>
                <p className="text-xs text-gray-500">Hướng dẫn sử dụng và FAQ</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
              <Shield className="w-5 h-5 text-gray-600" />
              <div>
                <span className="text-gray-800 font-medium">Chính sách bảo mật</span>
                <p className="text-xs text-gray-500">Cách chúng tôi bảo vệ dữ liệu của bạn</p>
              </div>
            </button>
          </div>
        </div>

        {/* Vietnamese Cultural Features */}
        <div className="bg-gradient-to-r from-red-50 to-yellow-50 rounded-xl p-4 border border-red-200">
          <h3 className="font-semibold text-red-800 mb-3">Tính năng Việt Nam 🇻🇳</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-red-600">🧧</span>
              <span className="text-gray-700">Theo dõi tiền lì xì Tết</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-600">👨‍👩‍👧‍👦</span>
              <span className="text-gray-700">Quản lý tiền gửi gia đình</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-600">🛵</span>
              <span className="text-gray-700">Tính năng cho người đi xe máy</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-red-600">🏪</span>
              <span className="text-gray-700">Hỗ trợ thanh toán QR phổ biến VN</span>
            </div>
          </div>
        </div>

        {/* Statistics */}
        {userProfile && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-3">Thống kê sử dụng</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">
                  {JSON.parse(localStorage.getItem('vietnamese-money-tracker-transactions') || '[]').length}
                </div>
                <div className="text-blue-600">Giao dịch</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-blue-700">
                  {JSON.parse(localStorage.getItem('vietnamese-money-tracker-goals') || '[]').length}
                </div>
                <div className="text-blue-600">Mục tiêu</div>
              </div>
            </div>
          </div>
        )}

        {/* App Info */}
        <div className="text-center text-gray-500 text-sm space-y-1">
          <p>VietMoney - Ứng dụng quản lý tài chính Việt Nam</p>
          <p>Phiên bản 1.0.0</p>
          <p>Được thiết kế cho người Việt</p>
          <p className="text-xs">© 2025 VietMoney. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>

      <ProfileSetupModal
        isOpen={showProfileModal}
        onClose={() => {
          setShowProfileModal(false);
          handleProfileUpdate();
        }}
        currentProfile={userProfile || undefined}
      />
    </>
  );
}