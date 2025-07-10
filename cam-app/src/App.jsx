import { useState, useEffect } from 'react'
import Webcam from 'react-webcam'
import QRCode from 'react-qr-code'
import io from 'socket.io-client'
import MobileApp from './MobileApp'
import './App.css'

function App() {
  const [showCamera, setShowCamera] = useState(false)
  const [socket, setSocket] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [mobileUrl, setMobileUrl] = useState('')
  const [receivedSelfies, setReceivedSelfies] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if user is on mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();

    // Connect to server using Render backend
    const newSocket = io('https://cam-app-backend.onrender.com')
    setSocket(newSocket)

    newSocket.on('connect', () => {
      console.log('Connected to server')
      newSocket.emit('desktop-connect')
    })

    newSocket.on('desktop-confirmed', () => {
      setIsConnected(true)
      console.log('Desktop connection confirmed')
    })

    newSocket.on('new-selfie', (data) => {
      console.log('New selfie received:', data)
      setReceivedSelfies(prev => [...prev, data])
    })

    // Generate mobile URL using Vercel domain (frontend) with Render backend
    const mobileUrl = 'https://cam-app-jnom.vercel.app'
    setMobileUrl(mobileUrl)

    return () => {
      newSocket.close()
    }
  }, [])

  const handleOpenCamera = () => {
    setShowCamera(true)
  }

  const handleCapture = () => {
    // Capture functionality can be implemented here later
    console.log('Capture button clicked')
  }

  // If mobile device, show mobile interface
  if (isMobile) {
    return <MobileApp />;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ marginBottom: '30px', color: '#333' }}>
        📸 Webcam App
      </h1>
      
      {!showCamera ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '30px'
        }}>
          <button
            onClick={handleOpenCamera}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            📷 Open Camera
          </button>

          {/* QR Code Section */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '15px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '12px',
            border: '2px solid #e9ecef'
          }}>
            <h3 style={{ margin: '0', color: '#495057' }}>
              📱 Mobile Access
            </h3>
            <p style={{ 
              margin: '0', 
              fontSize: '14px', 
              color: '#6c757d',
              textAlign: 'center'
            }}>
              Scan QR code with your phone to access mobile camera
            </p>
            
            {mobileUrl && (
              <div style={{
                padding: '15px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <QRCode
                  value={mobileUrl}
                  size={200}
                  level="M"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}
            
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              textAlign: 'center',
              maxWidth: '200px'
            }}>
              <p style={{ margin: '5px 0' }}>
                <strong>URL:</strong> {mobileUrl}
              </p>
              <p style={{ margin: '5px 0' }}>
                <strong>Status:</strong> {isConnected ? '🟢 Connected' : '🟡 Connecting...'}
              </p>
            </div>
          </div>

          {/* Received Selfies Section */}
          {receivedSelfies.length > 0 && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '15px',
              padding: '20px',
              backgroundColor: '#e8f5e8',
              borderRadius: '12px',
              border: '2px solid #d4edda'
            }}>
              <h3 style={{ margin: '0', color: '#155724' }}>
                📸 Received Selfies ({receivedSelfies.length})
              </h3>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '10px',
                justifyContent: 'center',
                maxWidth: '400px'
              }}>
                {receivedSelfies.map((selfie, index) => (
                  <img
                    key={index}
                    src={selfie.image}
                    alt={`Selfie ${index + 1}`}
                    style={{
                      width: '80px',
                      height: '60px',
                      objectFit: 'cover',
                      borderRadius: '6px',
                      border: '2px solid #d4edda'
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px'
        }}>
          <div style={{
            position: 'relative',
            display: 'inline-block'
          }}>
            <Webcam
              audio={false}
              width={640}
              height={480}
              style={{
                border: '2px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            />
            {/* Face Alignment Overlay */}
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '200px',
              height: '250px',
              border: '3px dashed #00ff00',
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 10,
              boxShadow: '0 0 10px rgba(0, 255, 0, 0.3)'
            }}></div>
            {/* Alignment Instructions */}
            <div style={{
              position: 'absolute',
              bottom: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '20px',
              fontSize: '14px',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              👤 Align your face in the circle
            </div>
          </div>
          <button
            onClick={handleCapture}
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
          >
            📷 Capture
          </button>
        </div>
      )}
    </div>
  )
}

export default App
