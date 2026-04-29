import React, { useRef, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { UserCircle, Camera, Loader2, Image as ImageIcon, Smartphone } from 'lucide-react';
import ImageCropModal from './ImageCropModal';

interface UserProfileHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export default function UserProfileHeader({ title, subtitle, children }: UserProfileHeaderProps) {
  const { currentUser, userProfile, refreshProfile } = useAuth();
  const fileInputRefGallery = useRef<HTMLInputElement>(null);
  const fileInputRefCamera = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  // Cropping states
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const readFile = (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => resolve(reader.result as string));
      reader.addEventListener('error', reject);
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setShowMenu(false);
    if (!file || !currentUser) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl); // Open cropper
      // Clear inputs
      if (fileInputRefGallery.current) fileInputRefGallery.current.value = '';
      if (fileInputRefCamera.current) fileInputRefCamera.current.value = '';
    } catch (e) {
      toast.error("Failed to read image");
    }
  };

  const handleCropComplete = async (croppedBase64: string) => {
    setImageSrc(null);
    setUploading(true);

    try {
      // Update user document in Firestore
      const userRef = doc(db, 'users', currentUser!.uid);
      await updateDoc(userRef, {
        photoURL: croppedBase64
      });
      
      await refreshProfile();
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to update photo');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl shadow-sm relative overflow-visible">
      {/* Decorative gradient blur */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-yellow-500/10 blur-3xl rounded-full pointer-events-none"></div>

      <div className="relative group flex-shrink-0 z-50 w-max">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center relative z-10">
          {userProfile?.photoURL ? (
            <img 
              src={userProfile.photoURL} 
              alt="Profile" 
              className="w-full h-full object-cover"
            />
          ) : (
            <UserCircle className="w-16 h-16 text-zinc-600" />
          )}
          
          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-yellow-500 animate-spin" />
            </div>
          )}
        </div>
        
        <div className="absolute bottom-0 right-0 z-20">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 p-2.5 bg-yellow-500 text-zinc-900 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-yellow-400 transition-colors border-2 border-zinc-900 z-20"
            title="Change Profile Photo"
          >
            <Camera className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute top-10 left-0 sm:left-auto sm:right-0 mt-2 w-48 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl py-2 z-50 overflow-hidden transform origin-top-left sm:origin-top-right">
                <button 
                  onClick={() => fileInputRefCamera.current?.click()}
                  className="w-full text-left px-4 py-3 sm:py-2 hover:bg-zinc-800 text-sm text-zinc-200 flex items-center gap-3 transition-colors"
                >
                  <Smartphone className="w-4 h-4 text-zinc-400" /> Take Photo
                </button>
                <button 
                  onClick={() => fileInputRefGallery.current?.click()}
                  className="w-full text-left px-4 py-3 sm:py-2 hover:bg-zinc-800 text-sm text-zinc-200 flex items-center gap-3 transition-colors"
                >
                  <ImageIcon className="w-4 h-4 text-zinc-400" /> Upload from Gallery
                </button>
              </div>
            </>
          )}
        </div>

        <input 
          type="file" 
          ref={fileInputRefGallery} 
          onChange={handleImageChange} 
          accept="image/*" 
          className="hidden" 
        />
        <input 
          type="file" 
          ref={fileInputRefCamera} 
          onChange={handleImageChange} 
          accept="image/*" 
          capture="environment"
          className="hidden" 
        />
      </div>

      <div className="flex-1">
        <h1 className="text-3xl font-bold text-zinc-100 mb-1 flex items-center gap-3">
          {title}
          {userProfile?.role && (
            <span className={`text-xs font-semibold px-2 py-1 rounded-full uppercase tracking-wider
              ${userProfile.role === 'admin' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 
                userProfile.role === 'worker' ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30' : 
                'bg-blue-500/20 text-blue-400 border border-blue-500/30'}
            `}>
              {userProfile.role === 'customer' ? 'employer' : userProfile.role}
            </span>
          )}
        </h1>
        <p className="text-zinc-400">
          {subtitle || `Welcome back, ${userProfile?.displayName}`}
        </p>
      </div>

      {children && (
        <div className="flex-shrink-0 mt-4 sm:mt-0">
          {children}
        </div>
      )}

      {imageSrc && (
        <ImageCropModal 
          imageSrc={imageSrc} 
          onClose={() => setImageSrc(null)} 
          onCropComplete={handleCropComplete} 
        />
      )}
    </div>
  );
}
