"use client";
import { useState } from "react";
import Login from "./login";
import Signin from "./Sigin";

export default function Auth() {
  const [isRegistering, setIsRegistering] = useState(false);

  return isRegistering ? (
    <Signin goToLogin={() => setIsRegistering(false)} />
  ) : (
    <Login goToRegister={() => setIsRegistering(true)} />
  );
}

