// app/signup/page.tsx
"use client"; // Required because the modal has click events

import React from 'react';
import LoginModal from '../../components/LoginModal'; // Adjust path if needed

export default function SignupPage() {
  return (
    <main>
      {/* We render the modal and tell it to show the "signup" view */}
      <LoginModal view="signup" />
    </main>
  );
}