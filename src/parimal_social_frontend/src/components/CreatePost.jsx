import React, { useState } from 'react';
import { ImageIcon, Video, Type, Upload, X } from 'lucide-react';

const CreatePost = ({ actor, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [video, setVideo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('text');

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'image') {
        setImage(reader.result);
        setActiveTab('image');
      } else if (type === 'video') {
        setVideo(reader.result);
        setActiveTab('video');
      }
    };

    if (type === 'image') {
      reader.readAsDataURL(file);
    } else if (type === 'video') {
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image && !video) {
      setError('Please add some content, an image, or a video');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await actor.create_post(
        content,
        image ? [image] : [],
        video ? [video] : []
      );

      if (result.Ok) {
        setContent('');
        setImage('');
        setVideo('');
        if (onPostCreated) onPostCreated();
      } else {
        setError(result.Err || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-100">
            <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            <p className="text-gray-600 mt-1">Share your thoughts with the world</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-100">
            <div className="flex">
              {['text', 'image', 'video'].map((tab) => {
                const Icon = tab === 'text' ? Type : tab === 'image' ? ImageIcon : Video;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="h-4 w-4 inline mr-2" />
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
                {error}
              </div>
            )}

            {/* Text Content */}
            <div className="mb-6">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-lg"
              />
            </div>

            {/* Image Upload */}
            {activeTab === 'image' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add Image
                </label>
                {image ? (
                  <div className="relative">
                    <img
                      src={image}
                      alt="Post preview"
                      className="w-full h-64 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setImage('')}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-gray-600 font-medium">Click to upload image</span>
                    <span className="text-gray-500 text-sm mt-1">(Supported: JPG, PNG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'image')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Video Upload */}
            {activeTab === 'video' && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Add Video
                </label>
                {video ? (
                  <div className="relative">
                    <video
                      src={video}
                      controls
                      className="w-full h-64 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setVideo('')}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-64 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors cursor-pointer">
                    <Upload className="h-12 w-12 text-gray-400 mb-4" />
                    <span className="text-gray-600 font-medium">Click to upload video</span>
                    <span className="text-gray-500 text-sm mt-1">(MP4 preferred)</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileUpload(e, 'video')}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setContent('');
                  setImage('');
                  setVideo('');
                  setError('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                type="submit"
                disabled={loading || (!content.trim() && !image && !video)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
