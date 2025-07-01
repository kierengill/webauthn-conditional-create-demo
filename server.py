import http.server
import ssl
import os
import sys

def generate_self_signed_cert():
    """Generate a self-signed certificate if it doesn't exist"""
    if not os.path.exists('cert.pem') or not os.path.exists('key.pem'):
        print("Generating self-signed certificate...")
        os.system('openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes -subj "/CN=localhost"')
        print("Certificate generated.")

def run_server(port=8443):
    """Run an HTTPS server on the specified port"""
    generate_self_signed_cert()
    
    handler = http.server.SimpleHTTPRequestHandler
    
    # Create an HTTPS server
    httpd = http.server.HTTPServer(('localhost', port), handler)
    
    # Add SSL context
    context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    context.load_cert_chain(certfile='cert.pem', keyfile='key.pem')
    httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
    
    print(f"Server running at https://localhost:{port}")
    print("Note: Since we're using a self-signed certificate, you'll need to accept the security warning in your browser.")
    print("Press Ctrl+C to stop the server.")
    
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")

if __name__ == "__main__":
    port = 8443
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print(f"Invalid port number: {sys.argv[1]}. Using default port 8443.")
    
    run_server(port)
