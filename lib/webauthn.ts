// WebAuthn utilities for passkey creation and authentication

// Helper function to get the current domain for RP ID
function getRPID(): string {
  if (typeof window === "undefined") return "localhost"
  const hostname = window.location.hostname
  // For localhost, use "localhost" explicitly (WebAuthn requirement)
  // For other domains, use hostname as-is
  return hostname === "127.0.0.1" ? "localhost" : hostname
}

// Helper function to get the origin for WebAuthn credential creation
function getOrigin(): string {
  if (typeof window === "undefined") return "http://localhost:3000"
  return window.location.origin
}

export function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "")
}

export function base64urlDecode(str: string): ArrayBuffer {
  const padded = str.padEnd(str.length + ((4 - (str.length % 4)) % 4), "=")
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"))
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes.buffer
}

export async function registerPasskey(username: string): Promise<string> {
  const challenge = crypto.getRandomValues(new Uint8Array(32))

  const credentialCreationOptions: CredentialCreationOptions = {
    publicKey: {
      challenge,
      rp: { name: "OnRamp Wallet", id: getRPID() },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: username,
        displayName: username,
      },
      pubKeyCredParams: [{ alg: -7, type: "public-key" }],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "required",
      },
      attestation: "none",
      timeout: 60000,
    },
  }

  const credential = (await navigator.credentials.create(credentialCreationOptions)) as PublicKeyCredential | null

  if (!credential) {
    throw new Error("Failed to create passkey")
  }

  const credentialId = base64urlEncode(credential.id)
  return credentialId
}

export async function authenticatePasskey(credentialId: string): Promise<{ prfOutput?: ArrayBuffer }> {
  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const salt = crypto.getRandomValues(new Uint8Array(32))

  const credentialRequestOptions: CredentialRequestOptions = {
    publicKey: {
      challenge,
      allowCredentials: [
        {
          id: base64urlDecode(credentialId),
          type: "public-key",
        },
      ],
      userVerification: "required",
      rpId: getRPID(),
      timeout: 60000,
      extensions: {
        prf: {
          eval: {
            first: salt,
          },
        },
      },
    },
  }

  const assertion = (await navigator.credentials.get(credentialRequestOptions)) as PublicKeyCredential | null

  if (!assertion) {
    throw new Error("Failed to authenticate with passkey")
  }

  let prfOutput: ArrayBuffer | undefined
  if ("extensions" in assertion && assertion.getClientExtensionResults) {
    const extensions = assertion.getClientExtensionResults()
    if ("prf" in extensions && extensions.prf && "results" in extensions.prf) {
      prfOutput = (extensions.prf as any).results?.first
    }
  }

  return { prfOutput }
}

export async function deriveWalletSeed(prfOutput?: ArrayBuffer): Promise<Uint8Array> {
  if (prfOutput) {
    const hashBuffer = await crypto.subtle.digest("SHA-256", prfOutput)
    return new Uint8Array(hashBuffer)
  }

  // Fallback: generate random seed
  return crypto.getRandomValues(new Uint8Array(32))
}
