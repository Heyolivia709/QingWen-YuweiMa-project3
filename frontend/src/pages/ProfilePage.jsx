import { useUser } from '../context/UserContext.jsx';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

// Get base URL for images (same as SiteLayout)
const baseUrl = import.meta.env.BASE_URL || '/QingWen-YuweiMa-project2/';
const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
const defaultAvatarUrl = `${normalizedBaseUrl}kitten.png`;

export default function ProfilePage() {
  const { user, logout, updateAvatar } = useUser();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const result = await updateAvatar(file);
    setUploading(false);

    if (!result.success) {
      alert(result.message);
    }
  };

  if (!user) {
    return (
      <div className="panel" style={{ textAlign: 'center', padding: '3rem' }}>
        <h2>Please log in to view your profile.</h2>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="panel">
      <h1 className="page-title">User Profile</h1>
      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div style={{ textAlign: 'center' }}>
           <div style={{ 
             width: '120px', 
             height: '120px', 
             borderRadius: '50%', 
             overflow: 'hidden', 
             border: '4px solid var(--accent)',
             margin: '0 auto 1rem',
             backgroundColor: '#f0f0f0',
             position: 'relative'
           }}>
              <img 
                key={user.avatar || 'default'} 
                src={user.avatar || defaultAvatarUrl} 
                alt="Profile" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                onError={(e) => {
                  const img = e.target;
                  // If already showing default or root path, stop to prevent infinite loop
                  if (img.src.includes('kitten.png')) {
                    // Already trying default, don't change src again
                    return;
                  }
                  // Try root path as fallback
                  img.src = '/kitten.png';
                }}
              />
           </div>
           
           <input 
             type="file" 
             ref={fileInputRef} 
             style={{ display: 'none' }} 
             accept="image/*"
             onChange={handleFileChange}
           />
           
           <button 
             onClick={() => fileInputRef.current.click()} 
             disabled={uploading}
             style={{ marginBottom: '1rem', fontSize: '0.9rem' }}
           >
             {uploading ? 'Uploading...' : 'Change Avatar'}
           </button>

           <h3>{user.username}</h3>
           <p className="muted">Member since {new Date().getFullYear()}</p>
        </div>
        
        <div style={{ flex: 1 }}>
          <h3>Account Details</h3>
          <div className="table" style={{ padding: '1rem' }}>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Status:</strong> Active</p>
          </div>
          
          <h3 style={{ marginTop: '2rem' }}>Settings</h3>
          <div className="button-group">
            <button onClick={logout} className="danger">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
