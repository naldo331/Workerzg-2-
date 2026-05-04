import React, { useState } from 'react';
import { X, Upload, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { doc, updateDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';

interface DisputeModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  onDisputeRaised: () => void;
}

export default function DisputeModal({ isOpen, onClose, jobId, onDisputeRaised }: DisputeModalProps) {
  const { currentUser } = useAuth();
  const [message, setMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      if (images.length + e.target.files.length > 3) {
        toast.error("Maximum 3 images allowed.");
        return;
      }
      
      const files = Array.from(e.target.files);
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please provide a reason for the dispute.");
      return;
    }
    
    setLoading(true);
    try {
      // 1. Mark job as disputed
      const jobRef = doc(db, 'jobs', jobId);
      await updateDoc(jobRef, {
        status: 'disputed',
        updatedAt: Date.now()
      });

      // 2. Add dispute record
      await addDoc(collection(db, 'disputes'), {
        jobId,
        raisedBy: currentUser?.uid,
        message,
        images,
        createdAt: Date.now(),
        status: 'open'
      });

      toast.success("Dispute raised. Admin will review the issue.");
      onDisputeRaised();
      onClose();
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to raise dispute: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-zinc-100">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-red-500" />
            </div>
            <h3 className="text-xl font-bold">Report Issue</h3>
          </div>
          <button onClick={onClose} className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-zinc-400">
            Reporting an issue will lock the payment and alert our admin team. Please provide details and photo evidence.
          </p>
          
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Issue Overview</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What went wrong?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-red-500 text-sm h-24 resize-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Proof Photos (Max 3)</label>
            {images.length < 3 && (
               <div className="mt-1 flex justify-center px-6 pt-4 pb-4 border-2 border-zinc-700 border-dashed rounded-xl mb-2 hover:bg-zinc-800/50 transition cursor-pointer relative">
                 <div className="space-y-1 text-center">
                   <Upload className="mx-auto h-8 w-8 text-zinc-500" />
                   <div className="flex text-sm text-zinc-400 justify-center">
                     <span className="text-red-500 font-medium font-semibold hover:text-red-400">Upload a file</span>
                   </div>
                 </div>
                 <input type="file" multiple accept="image/*" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
               </div>
            )}
            
            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-700">
                    <img src={img} alt="Proof" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 bg-black/60 p-1 rounded-full text-white hover:bg-red-500 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl font-medium hover:bg-zinc-700 transition"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-500 transition flex items-center justify-center disabled:opacity-50"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Submit Dispute"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
