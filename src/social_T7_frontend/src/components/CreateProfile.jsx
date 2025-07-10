import React, { useState } from 'react';
import { Camera, Pencil } from 'lucide-react';

const CreateProfile = ({ actor, principal, onProfileCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profileImage: '',
    coverImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await actor.register_user(
        formData.name,
        formData.bio,
        formData.profileImage,
        formData.coverImage
      );
      if (result.Ok) {
        onProfileCreated(result.Ok);
      } else {
        setError(result.Err || 'Failed to create profile');
      }
    } catch (error) {
      console.error('Error creating profile:', error);
      setError('Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-6 rounded-t-3xl">
            <h1 className="text-3xl font-bold text-white leading-tight mb-1">Create Your Profile</h1>
            <p className="text-blue-100 text-sm">Set up your social media presence</p>
          </div>

          {/* Cover and Profile Picture */}
          <div className="relative">
            {/* Cover */}
            <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
              {formData.coverImage ? (
                <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <Camera className="w-10 h-10 text-gray-400" />
              )}
              <label className="absolute top-3 right-3 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, 'coverImage')}
                  className="hidden"
                />
                <Camera className="w-6 h-6 text-white bg-black/50 p-1 rounded-full" />
              </label>
            </div>

            {/* Profile */}
            <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-12">
              <div className="relative w-24 h-24 rounded-full  border-4 border-white bg-gray-100 shadow-md">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-gray-400 m-auto mt-8" />
                )}
                <label className="absolute bottom-1 right-1 cursor-pointer z-10">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'profileImage')}
                    className="hidden"
                  />
                  <Pencil className="w-5 h-5 text-white bg-black/50 p-1 rounded-full" />
                </label>
              </div>
            </div>
          </div>

          <div className="pt-20 px-8 pb-8">
            {error && (
              <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-xl border border-red-300">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Enter your name..."
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">About</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating Profile...' : 'Create Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProfile;
