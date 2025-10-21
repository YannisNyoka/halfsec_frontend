import React, { useState } from 'react';
import { Signup, Signin } from './Auth';

export default function AuthPage() {
  const [showSignup, setShowSignup] = useState(true);

  return (
    <div>
      {showSignup ? (
        <Signup onSwitch={() => setShowSignup(false)} />
      ) : (
        <Signin onSwitch={() => setShowSignup(true)} />
      )}
    </div>
  );
}

