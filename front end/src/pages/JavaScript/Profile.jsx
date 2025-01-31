import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faCalendar, 
  faMapMarkerAlt,
  faIdCard,
  faEdit,
  faSave,
  faTimes
} from '@fortawesome/free-solid-svg-icons';
import { updateUserDetails } from '../../store/Slices/auth';

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: user?.address || '',
    username: user?.username || ''
  });

  // Reset edited user when user changes
  useEffect(() => {
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: user?.address || '',
      username: user?.username || ''
    });
  }, [user]);

  // Indian Phone Number Formatting Function
  const formatIndianPhoneNumber = (phoneNumber) => {
    // Return empty string if phoneNumber is undefined or null
    if (!phoneNumber) return '';
    
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Limit to 10 digits
    const trimmed = cleaned.slice(0, 10);
    
    // Return plain format if less than 10 digits
    if (trimmed.length < 10) {
        return trimmed;
    }
    
    // Return standard 10-digit format without formatting
    return trimmed;
  };

  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return '';
    const cleaned = phoneNumber.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return cleaned;
  };

  const ControlledInput = ({ 
    label, 
    name, 
    value, 
    onChange, 
    type = 'text', 
    placeholder,
    formatFunction 
  }) => {
    const [inputValue, setInputValue] = useState(value || '');
    const inputRef = useRef(null);
    const [selectionState, setSelectionState] = useState({
      start: 0,
      end: 0
    });
    const [isComposing, setIsComposing] = useState(false);
    const cursorPosition = useCursorTracking(inputRef);

    useEffect(() => {
      setInputValue(value || '');
    }, [value]);

    const preserveSelection = (input) => {
      if (input && !isComposing) {
        try {
          input.setSelectionRange(
            selectionState.start, 
            selectionState.end
          );
        } catch (error) {
          console.error('Selection preservation failed', error);
        }
      }
    };

    const handleChange = (e) => {
      const input = e.target;
      const newValue = input.value;
      
      // Prevent composition events from interfering
      if (isComposing) return;

      // Capture current selection state
      const currentStart = input.selectionStart;
      const currentEnd = input.selectionEnd;

      // Update input value and selection state
      setInputValue(newValue);
      setSelectionState({
        start: currentStart,
        end: currentEnd
      });

      // Create synthetic event
      const syntheticEvent = {
        target: {
          name: name,
          value: newValue
        }
      };

      // Call parent onChange
      onChange(syntheticEvent);

      // Preserve selection in next render cycle
      requestAnimationFrame(() => {
        if (inputRef.current) {
          preserveSelection(inputRef.current);
        }
      });
    };

    const handleKeyDown = (e) => {
      const input = e.target;
      const { name, value } = input;
      
      // Capture current cursor state before key processing
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;
      
      // Enhanced key handling
      switch (e.key) {
        case 'Backspace':
        case 'Delete':
          // Ensure cursor moves to end after deletion
          requestAnimationFrame(() => {
            const processedValue = name === 'phone' 
                ? value.replace(/\D/g, '').slice(0, 10)
                : value;
            
            const inputElement = document.getElementsByName(name)[0];
            if (inputElement) {
              const newCursorPosition = processedValue.length;
              inputElement.setSelectionRange(
                newCursorPosition, 
                newCursorPosition
              );
              
              // Update display with formatted number
              if (name === 'phone') {
                inputElement.value = formatIndianPhoneNumber(processedValue);
              }
            }
          });
          return;
        
        case 'ArrowLeft':
        case 'ArrowRight':
          // Preserve cursor movement
          return;
        
        default:
          // Phone number specific validation
          if (name === 'phone') {
            if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault();
            }
          }
      }
    };

    const handleFocus = (e) => {
      // Select all text on focus
      e.target.select();
      
      // Update selection state
      setSelectionState({
        start: 0,
        end: e.target.value.length
      });
    };

    const handleMouseUp = (e) => {
      // Capture selection on mouse up
      setSelectionState({
        start: e.target.selectionStart,
        end: e.target.selectionEnd
      });
    };

    const handleCompositionStart = () => {
      setIsComposing(true);
    };

    const handleCompositionEnd = (e) => {
      setIsComposing(false);
      handleChange(e);
    };

    return (
      <div className="mb-3">
        <label className="form-label">{label}</label>
        <input
          ref={inputRef}
          type={type}
          className="form-control"
          name={name}
          value={formatFunction ? formatFunction(inputValue) : inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onMouseUp={handleMouseUp}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
    );
  };

  const handleInputChange = (e) => {
    const input = e.target;
    const { name, value } = input;
    
    // Capture precise cursor state
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;
    
    // Process value based on input type
    const processedValue = name === 'phone' 
        ? value.replace(/\D/g, '').slice(0, 10)
        : value;
    
    // Update user state
    setEditedUser((prev) => ({
        ...prev,
        [name]: processedValue
    }));
    
    // Advanced cursor preservation
    requestAnimationFrame(() => {
        const inputElement = document.getElementsByName(name)[0];
        if (inputElement) {
            try {
                inputElement.focus();
                
                // Always place cursor at the end after input
                const newCursorPosition = processedValue.length;
                
                inputElement.setSelectionRange(
                    newCursorPosition, 
                    newCursorPosition
                );
                
                // Update display with formatted number
                if (name === 'phone') {
                    inputElement.value = formatIndianPhoneNumber(processedValue);
                }
            } catch (error) {
                console.error('Cursor preservation failed', error);
            }
        }
    });
  };

  const useCursorTracking = (inputRef) => {
    const [cursorPosition, setCursorPosition] = useState(0);

    const handleCursorChange = useCallback(() => {
      if (inputRef.current) {
        setCursorPosition(inputRef.current.selectionStart);
      }
    }, [inputRef]);

    useEffect(() => {
      const currentInput = inputRef.current;
      if (currentInput) {
        currentInput.addEventListener('select', handleCursorChange);
        currentInput.addEventListener('keyup', handleCursorChange);
        currentInput.addEventListener('mouseup', handleCursorChange);

        return () => {
          currentInput.removeEventListener('select', handleCursorChange);
          currentInput.removeEventListener('keyup', handleCursorChange);
          currentInput.removeEventListener('mouseup', handleCursorChange);
        };
      }
    }, [inputRef, handleCursorChange]);

    return cursorPosition;
  };

  const handleSave = () => {
    dispatch(updateUserDetails(editedUser));
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original user details
    setEditedUser({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      dateOfBirth: user?.dateOfBirth || '',
      address: user?.address || '',
      username: user?.username || ''
    });
    setIsEditing(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h2>User Profile</h2>
              {!isEditing ? (
                <button 
                  className="btn btn-light" 
                  onClick={() => setIsEditing(true)}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-2" />
                  Edit Profile
                </button>
              ) : (
                <div>
                  <button 
                    className="btn btn-success me-2" 
                    onClick={handleSave}
                  >
                    <FontAwesomeIcon icon={faSave} className="me-2" />
                    Save
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={handleCancel}
                  >
                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
            <div className="card-body">
              {user ? (
                <div className="row">
                  <div className="col-md-4 text-center">
                    <FontAwesomeIcon 
                      icon={faUser} 
                      className="mb-4" 
                      style={{ 
                        fontSize: '8rem', 
                        color: '#6c757d' 
                      }} 
                    />
                    <h3 className="mb-2">{user.name}</h3>
                    <p className="text-muted">{user.email}</p>
                  </div>
                  <div className="col-md-8">
                    {isEditing ? (
                      <form autoComplete="off">
                        <div className="row">
                          <div className="col-md-6">
                            <ControlledInput 
                              label="Full Name"
                              name="name"
                              value={editedUser.name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div className="col-md-6">
                            <ControlledInput 
                              label="Email"
                              name="email"
                              type="email"
                              value={editedUser.email}
                              onChange={handleInputChange}
                              placeholder="Enter your email"
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <ControlledInput 
                              label="Phone"
                              name="phone"
                              value={editedUser.phone}
                              onChange={handleInputChange}
                              placeholder="Enter your phone number"
                              formatFunction={formatIndianPhoneNumber}
                            />
                          </div>
                          <div className="col-md-6">
                            <ControlledInput 
                              label="Date of Birth"
                              name="dateOfBirth"
                              type="date"
                              value={editedUser.dateOfBirth}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="row">
                          <div className="col-md-6">
                            <ControlledInput 
                              label="Address"
                              name="address"
                              value={editedUser.address}
                              onChange={handleInputChange}
                              placeholder="Enter your address"
                            />
                          </div>
                          <div className="col-md-6">
                            <ControlledInput 
                              label="Username"
                              name="username"
                              value={editedUser.username}
                              onChange={handleInputChange}
                              placeholder="Enter your username"
                            />
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div>
                        <div className="row mb-3">
                          <div className="col-4 text-end"><strong>Full Name:</strong></div>
                          <div className="col-8">{user.name || 'Not provided'}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 text-end"><strong>Email:</strong></div>
                          <div className="col-8">{user.email || 'Not provided'}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 text-end"><strong>Phone:</strong></div>
                          <div className="col-8">{formatIndianPhoneNumber(user.phone) || 'Not provided'}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 text-end"><strong>Date of Birth:</strong></div>
                          <div className="col-8">{user.dateOfBirth || 'Not provided'}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 text-end"><strong>Address:</strong></div>
                          <div className="col-8">{user.address || 'Not provided'}</div>
                        </div>
                        <div className="row mb-3">
                          <div className="col-4 text-end"><strong>Username:</strong></div>
                          <div className="col-8">{user.username || 'Not provided'}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <FontAwesomeIcon 
                    icon={faUser} 
                    className="mb-4" 
                    style={{ 
                      fontSize: '5rem', 
                      color: '#6c757d' 
                    }} 
                  />
                  <p className="text-muted">No user logged in</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
