import React, { useState } from 'react';
import { Camera, Upload, Save } from 'lucide-react';

const EditProfile = ({ actor, user, onUserUpdate }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio,
    profileImage: user.profile_image,
    coverImage: user.cover_image
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        [field]: reader.result
      }));
    };

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await actor.update_profile(
        formData.name,
        formData.bio,
        formData.profileImage,
        formData.coverImage
      );

      if (result.Ok) {
        onUserUpdate(result.Ok);
        setSuccess('Profile updated successfully!');
      } else {
        setError(result.Err || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-gray-600 mt-1">Update your profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
                {success}
              </div>
            )}

            {/* Cover Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Cover Photo
              </label>
              <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 border-2 border-gray-200 mb-3 relative">
                <img
                  src={formData.coverImage}
                  alt="Cover"
                  className="w-full h-full object-cover"
                />
                <label className="absolute bottom-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-lg hover:bg-opacity-70 transition-all cursor-pointer">
                  <Camera className="h-5 w-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'coverImage')}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Profile Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Picture
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
                    <img
                      src={formData.profileImage}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors shadow-lg cursor-pointer">
                    <Camera className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profileImage')}
                      className="hidden"
                    />
                  </label>
                </div>
                <div>
                  <label className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'profileImage')}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-1">Click to upload a new photo</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your display name"
                required
              />
            </div>

            {/* Bio */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                placeholder="Tell us about yourself..."
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.bio.length}/500 characters
              </p>
            </div>

            {/* Stats */}
            <div className="mb-8 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Your Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.followers.length}</div>
                  <div className="text-sm text-gray-500">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">{user.following.length}</div>
                  <div className="text-sm text-gray-500">Following</div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setFormData({
                    name: user.name,
                    bio: user.bio,
                    profileImage: user.profile_image,
                    coverImage: user.cover_image
                  });
                  setError('');
                  setSuccess('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
