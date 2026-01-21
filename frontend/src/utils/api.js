export const getApiUrl = (service) => {
    // Service can be 'auth', 'courses', etc. maps to subdomains usually.

    // 1. Dynamic detection for production (nip.io or real domain)
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;

        if (hostname.includes('nip.io')) {
            // Structure: service.ip.nip.io OR main.ip.nip.io
            // We assume current is 'academia.149...' or just ip?
            // If we are at 'academia.149.50.130.160.nip.io', we want 'auth.149...' or 'courses.149...'

            // Split by dots.
            const parts = hostname.split('.');
            // If parts has 6+ (academia.149.50.130.160.nip.io) -> length 6
            if (parts.length >= 6) {
                // Replace first part with service name
                parts[0] = service;
                return `${protocol}//${parts.join('.')}`;
            }
        }
    }

    // 2. Fallback to Env Vars (Build time)
    // We assume VITE_API_URL points to Auth service mostly
    if (import.meta.env.VITE_API_URL) {
        if (service === 'auth') return import.meta.env.VITE_API_URL;
        // Try to replace 'auth' with service name if present
        return import.meta.env.VITE_API_URL.replace('auth', service);
    }

    // 3. Localhost Fallbacks
    if (service === 'auth') return 'http://localhost:3001';
    if (service === 'courses') return 'http://localhost:3002';

    return 'http://localhost:3000'; // Fallback
};
