import React, { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Briefcase, Calendar } from 'lucide-react';
import { useFormValidation } from '../../hooks/useFormValidation';
import { FormField } from './FormField';
import { LoadingButton } from './LoadingButton';
import { SuccessNotification } from './SuccessNotification';
import { useAppStore } from '@/stores/app';

interface ProfileSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile?: UserProfile;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  occupation: string;
  birthDate: string;
  avatar?: string;
}

export function ProfileSetupModal({ isOpen, onClose, currentProfile }: ProfileSetupModalProps) {
  const [showSuccess, setShowSuccess] = useState(false);

  const initialValues = {
    fullName: currentProfile?.fullName || '',
    email: currentProfile?.email || '',
    phone: currentProfile?.phone || '',
    location: currentProfile?.location || '',
    occupation: currentProfile?.occupation || '',
    birthDate: currentProfile?.birthDate || '',
  };

  const validationRules = {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      custom: (value: string) => {
        if (value && !/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
          return 'Tên chỉ được chứa chữ cái và khoảng trắng';
        }
        return null;
      }
    },
    email: {
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      custom: (value: string) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Email không hợp lệ';
        }
        return null;
      }
    },
    phone: {
      required: true,
      pattern: /^(0|\+84)[0-9]{9,10}$/,
      custom: (value: string) => {
        if (value && !/^(0|\+84)[0-9]{9,10}$/.test(value)) {
          return 'Số điện thoại không hợp lệ (ví dụ: 0901234567)';
        }
        return null;
      }
    },
    location: {
      required: false,
      maxLength: 100,
    },
    occupation: {
      required: false,
      maxLength: 50,
    },
    birthDate: {
      required: false,
      custom: (value: string) => {
        if (value) {
          const birthDate = new Date(value);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();

          if (birthDate > today) {
            return 'Ngày sinh không thể là tương lai';
          }
          if (age > 120) {
            return 'Ngày sinh không hợp lệ';
          }
          if (age < 13) {
            return 'Bạn phải từ 13 tuổi trở lên';
          }
        }
        return null;
      }
    },
  };

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setTouched,
    handleSubmit,
    reset,
  } = useFormValidation(initialValues, validationRules);

  const onSubmit = async (formValues: typeof initialValues) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Save to zustand store
    useAppStore.getState().setProfile({
      fullName: formValues.fullName,
      email: formValues.email,
      phone: formValues.phone,
      location: formValues.location,
      occupation: formValues.occupation,
      birthDate: formValues.birthDate,
    });

    setShowSuccess(true);
    setTimeout(() => {
      onClose();
      setShowSuccess(false);
    }, 2000);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const getCompletionPercentage = () => {
    const requiredFields = ['fullName', 'email', 'phone'];
    const optionalFields = ['location', 'occupation', 'birthDate'];

    const requiredCompleted = requiredFields.filter(field =>
      values[field as keyof typeof values] && !errors[field]
    ).length;

    const optionalCompleted = optionalFields.filter(field =>
      values[field as keyof typeof values] && !errors[field]
    ).length;

    const totalWeight = requiredFields.length * 2 + optionalFields.length;
    const completedWeight = requiredCompleted * 2 + optionalCompleted;

    return Math.round((completedWeight / totalWeight) * 100);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-end z-50">
        <div className="bg-white w-full rounded-t-3xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Thiết lập hồ sơ</h2>
              <p className="text-sm text-gray-600">Hoàn thiện thông tin cá nhân của bạn</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Completion Progress */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Tiến độ hoàn thành</span>
              <span className="text-sm font-bold text-blue-800">{getCompletionPercentage()}%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${getCompletionPercentage()}%` }}
              />
            </div>
            <p className="text-xs text-blue-700 mt-2">
              Hoàn thành hồ sơ để có trải nghiệm tốt nhất
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <User className="w-5 h-5 mr-2 text-gray-600" />
                Thông tin cơ bản
              </h3>

              <FormField
                label="Họ và tên"
                name="fullName"
                type="text"
                value={values.fullName}
                onChange={(value) => setValue('fullName', value)}
                onBlur={() => setTouched('fullName')}
                error={errors.fullName}
                touched={touched.fullName}
                placeholder="Ví dụ: Nguyễn Văn An"
                required
                helpText="Tên đầy đủ của bạn (chỉ chữ cái và khoảng trắng)"
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={(value) => setValue('email', value)}
                onBlur={() => setTouched('email')}
                error={errors.email}
                touched={touched.email}
                placeholder="example@gmail.com"
                required
                helpText="Email để nhận thông báo và khôi phục tài khoản"
              />

              <FormField
                label="Số điện thoại"
                name="phone"
                type="tel"
                value={values.phone}
                onChange={(value) => setValue('phone', value)}
                onBlur={() => setTouched('phone')}
                error={errors.phone}
                touched={touched.phone}
                placeholder="0901234567"
                required
                helpText="Số điện thoại Việt Nam (bắt đầu bằng 0 hoặc +84)"
              />
            </div>

            {/* Additional Information */}
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                Thông tin bổ sung
              </h3>

              <FormField
                label="Địa chỉ"
                name="location"
                type="text"
                value={values.location}
                onChange={(value) => setValue('location', value)}
                onBlur={() => setTouched('location')}
                error={errors.location}
                touched={touched.location}
                placeholder="Ví dụ: Quận 1, TP.HCM"
                helpText="Thành phố hoặc khu vực bạn đang sống"
              />

              <FormField
                label="Nghề nghiệp"
                name="occupation"
                type="text"
                value={values.occupation}
                onChange={(value) => setValue('occupation', value)}
                onBlur={() => setTouched('occupation')}
                error={errors.occupation}
                touched={touched.occupation}
                placeholder="Ví dụ: Kỹ sư phần mềm, Giáo viên..."
                helpText="Nghề nghiệp hiện tại của bạn"
              />

              <FormField
                label="Ngày sinh"
                name="birthDate"
                type="date"
                value={values.birthDate}
                onChange={(value) => setValue('birthDate', value)}
                onBlur={() => setTouched('birthDate')}
                error={errors.birthDate}
                touched={touched.birthDate}
                helpText="Giúp cá nhân hóa lời khuyên tài chính"
              />
            </div>

            {/* Profile Preview */}
            {values.fullName && values.email && !errors.fullName && !errors.email && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 animate-in slide-in-from-top-1 duration-300">
                <h4 className="font-semibold text-green-800 mb-3">Xem trước hồ sơ</h4>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-red-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-bold">
                      {/*{values.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}*/}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">{values.fullName}</div>
                    <div className="text-sm text-green-700">{values.email}</div>
                    {values.occupation && (
                      <div className="text-sm text-green-600">{values.occupation}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Hủy
              </button>
              <LoadingButton
                type="submit"
                isLoading={isSubmitting}
                disabled={!isValid}
                variant="primary"
                className="flex-1"
              >
                {isSubmitting ? 'Đang lưu...' : currentProfile ? 'Cập nhật hồ sơ' : 'Tạo hồ sơ'}
              </LoadingButton>
            </div>
          </form>

          {/* Form Progress */}
          <div className="flex items-center justify-center space-x-2">
            <div className="flex space-x-1">
              {['fullName', 'email', 'phone'].map((field) => (
                <div
                  key={field}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    touched[field] && !errors[field] && values[field]
                      ? 'bg-green-500 scale-110'
                      : touched[field] && errors[field]
                      ? 'bg-red-500'
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">
              {Object.keys(touched).filter(key => touched[key] && !errors[key] && values[key]).length}/3 bắt buộc
            </span>
          </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccess}
        message="Hồ sơ đã được cập nhật thành công! 👤"
        onClose={() => setShowSuccess(false)}
        duration={2000}
      />
    </>
  );
}
