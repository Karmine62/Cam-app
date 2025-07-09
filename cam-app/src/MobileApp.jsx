import { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import io from 'socket.io-client';

function MobileApp() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const webcamRef = useRef(null);

  useEffect(() => {
    // Connect to server using Render backend
    const newSocket = io('https://cam-app-backend.onrender.com');
    setSocket(newSocket);

    // Generate unique device ID
    const deviceId = 'mobile-' + Math.random().toString(36).substr(2, 9);

    newSocket.on('connect', () => {
      console.log('Connected to server');
      newSocket.emit('mobile-connect', deviceId);
    });

    newSocket.on('connection-confirmed', () => {
      setIsConnected(true);
      console.log('Mobile connection confirmed');
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setShowPreview(true);
    }
  };

  const sendSelfie = () => {
    if (capturedImage && socket) {
      socket.emit('selfie-captured', {
        image: capturedImage,
        timestamp: new Date().toISOString(),
        deviceId: 'mobile'
      });
      setShowPreview(false);
      setCapturedImage(null);
      alert('Selfie sent successfully!');
    }
  };

  const retakePhoto = () => {
    setShowPreview(false);
    setCapturedImage(null);
  };

  if (!isConnected) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f0f0',
        fontFamily: 'Arial, sans-serif'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2>Connecting to server...</h2>
          <div style={{ marginTop: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ 
        marginBottom: '20px', 
        color: '#333',
        textAlign: 'center'
      }}>
        📸 Selfie Camera
      </h1>

      {!showPreview ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <Webcam
            ref={webcamRef}
            audio={false}
            width={320}
            height={240}
            style={{
              border: '3px solid #ddd',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />
          <button
            onClick={capturePhoto}
            style={{
              padding: '15px 30px',
              fontSize: '18px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            📷 Take Selfie
          </button>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <img
            src={capturedImage}
            alt="Captured selfie"
            style={{
              width: '320px',
              height: '240px',
              objectFit: 'cover',
              border: '3px solid #ddd',
              borderRadius: '12px',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
            }}
          />
          <div style={{
            display: 'flex',
            gap: '15px'
          }}>
            <button
              onClick={sendSelfie}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              ✅ Send Selfie
            </button>
            <button
              onClick={retakePhoto}
              style={{
                padding: '12px 24px',
                fontSize: '16px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 Retake
            </button>
          </div>
        </div>
      )}

      <div style={{
        marginTop: '30px',
        padding: '15px',
        backgroundColor: '#e9ecef',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '14px',
        color: '#6c757d'
      }}>
        <p>📱 Mobile Camera Interface</p>
        <p>Take a selfie and send it to the desktop!</p>
      </div>
    </div>
  );
}

export default MobileApp; 