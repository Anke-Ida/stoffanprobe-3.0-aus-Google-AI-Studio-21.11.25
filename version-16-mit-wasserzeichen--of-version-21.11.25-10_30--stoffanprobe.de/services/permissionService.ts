export async function requestMicPermission(): Promise<PermissionState> {
  try {
    // Check if the browser supports the Permissions API for microphones.
    // Safari < 16.4 does not support it.
    if (navigator.permissions && typeof navigator.permissions.query === 'function') {
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (permissionStatus.state === 'granted') return 'granted';
        if (permissionStatus.state === 'denied') return 'denied';
    }

    // If the state is 'prompt' or the API is not supported, we trigger the request.
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // Immediately stop the track to release the microphone, as we only wanted the permission.
    stream.getTracks().forEach(track => track.stop());

    return 'granted';
  } catch (err) {
    // The user denied the request or another error occurred.
    console.error("Microphone permission error:", err);
    return 'denied';
  }
}

// iOS cannot be programmatically navigated to settings from the browser.
// The solution is to show the user how to get there.
export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
