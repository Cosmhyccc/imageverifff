import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Nav } from 'react-bootstrap';
import axios from 'axios';
import { BsSun, BsMoon } from 'react-icons/bs';

function App() {
  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);
  const [beforePreview, setBeforePreview] = useState(null);
  const [afterPreview, setAfterPreview] = useState(null);
  const [verificationInstructions, setVerificationInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved preference or use system preference
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      return savedMode === 'true';
    }
    // Check if user prefers dark mode
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  
  // Apply dark mode class to body element
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Save preference to localStorage
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleBeforeImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBeforeImage(file);
      setBeforePreview(URL.createObjectURL(file));
    }
  };

  const handleAfterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAfterImage(file);
      setAfterPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!beforeImage || !afterImage) {
      setError('Please upload both before and after images');
      return;
    }
    
    if (!verificationInstructions.trim()) {
      setError('Please enter verification instructions');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('beforeImage', beforeImage);
    formData.append('afterImage', afterImage);
    formData.append('verificationInstructions', verificationInstructions);

    try {
      // Use a relative URL that will work with the proxy configuration
      const apiUrl = '/api/verify';
      console.log('Sending request to:', apiUrl);
      
      const response = await axios.post(apiUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        // Add more axios config to help with the connection
        timeout: 30000,
        withCredentials: false,
      });
      setResult(response.data.analysis);
    } catch (err) {
      setError('Error analyzing images: ' + (err.response?.data?.error || err.message));
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setBeforeImage(null);
    setAfterImage(null);
    setBeforePreview(null);
    setAfterPreview(null);
    setVerificationInstructions('');
    setResult(null);
    setError(null);
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="m-0">AI Work Verification Agent</h1>
        <Button 
          variant={darkMode ? 'light' : 'dark'} 
          size="sm" 
          onClick={toggleDarkMode} 
          className="d-flex align-items-center gap-2 rounded-pill px-3"
        >
          {darkMode ? <BsSun /> : <BsMoon />} {darkMode ? 'Light Mode' : 'Dark Mode'}
        </Button>
      </div>
      <p className="text-center mb-5">Upload before and after images to verify completed work</p>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {!result ? (
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Header>Before Image</Card.Header>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  {beforePreview ? (
                    <div className="image-preview-container">
                      <img src={beforePreview} alt="Before Preview" className="img-fluid mb-3" />
                      <Button variant="outline-secondary" onClick={() => { setBeforeImage(null); setBeforePreview(null); }}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Form.Group controlId="beforeImageUpload">
                        <Form.Label>Upload Before Image</Form.Label>
                        <Form.Control 
                          type="file" 
                          accept="image/*"
                          onChange={handleBeforeImageChange} 
                        />
                      </Form.Group>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card className="h-100">
                <Card.Header>After Image</Card.Header>
                <Card.Body className="d-flex flex-column align-items-center justify-content-center">
                  {afterPreview ? (
                    <div className="image-preview-container">
                      <img src={afterPreview} alt="After Preview" className="img-fluid mb-3" />
                      <Button variant="outline-secondary" onClick={() => { setAfterImage(null); setAfterPreview(null); }}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <Form.Group controlId="afterImageUpload">
                        <Form.Label>Upload After Image</Form.Label>
                        <Form.Control 
                          type="file" 
                          accept="image/*"
                          onChange={handleAfterImageChange} 
                        />
                      </Form.Group>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>Verification Instructions</Card.Header>
                <Card.Body>
                  <Form.Group controlId="verificationInstructions">
                    <Form.Label>What specific changes or work completion would you like the AI to verify?</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      placeholder="E.g., Verify if the wall has been repainted, check if the flooring has been installed properly, confirm if the damaged area has been repaired..."
                      value={verificationInstructions}
                      onChange={(e) => setVerificationInstructions(e.target.value)}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <div className="d-grid gap-2 col-md-6 mx-auto mt-4">
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || !beforeImage || !afterImage}
            >
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                  <span className="ms-2">Analyzing...</span>
                </>
              ) : 'Verify Work'}
            </Button>
          </div>
        </Form>
      ) : (
        <Card className="result-card">
          <Card.Header as="h5">Analysis Results</Card.Header>
          <Card.Body>
            <Row className="mb-4">
              <Col md={6} className="mb-3 mb-md-0">
                <h6>Before Image</h6>
                <img src={beforePreview} alt="Before" className="img-fluid thumbnail" />
              </Col>
              <Col md={6}>
                <h6>After Image</h6>
                <img src={afterPreview} alt="After" className="img-fluid thumbnail" />
              </Col>
            </Row>
            <h5>AI Assessment</h5>
            <div className="analysis-text">
              {result.split('\n').map((paragraph, idx) => (
                <p key={idx}>{paragraph}</p>
              ))}
            </div>
            <div className="d-grid gap-2 col-md-6 mx-auto mt-4">
              <Button variant="primary" onClick={resetForm}>Analyze New Images</Button>
            </div>
          </Card.Body>
        </Card>
      )}
      <footer className="text-center mt-5" style={{ color: darkMode ? '#aaa' : '#6c757d' }}>
        <small>Powered by OpenAI Vision API</small>
      </footer>
    </Container>
  );
}

export default App;
