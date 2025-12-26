# Packet-Capture

A real-time network packet capture and analysis system that monitors TCP/UDP traffic for security threats and sensitive data exposure.

## Features

- **Real-time Packet Sniffing**: Captures live network packets using libpcap
- **Payload Analysis**: Scans packet payloads for sensitive patterns (passwords, tokens, SSH keys, etc.)
- **Alert System**: Generates alerts with severity levels based on detected patterns
- **Web Dashboard**: Modern React-based UI for viewing alerts in real-time
- **Suricata Integration**: Supports alerts from Suricata IDS/IPS
- **WebSocket Communication**: Real-time updates between backend and frontend

## Architecture

The project consists of two main components:

### packet-sniffer (Backend)
- Node.js/TypeScript server
- Uses `cap` library for packet capture
- Analyzes TCP and UDP payloads
- Emits alerts via Socket.IO
- Integrates with Suricata for additional threat detection

### packet-ui (Frontend)
- React + TypeScript + Vite
- Real-time dashboard with Tailwind CSS
- Connects to backend via Socket.IO
- Displays alerts with filtering and details view

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- libpcap (for packet capture)
- Suricata (optional, for IDS integration)

### Installing libpcap

**Ubuntu/Debian:**
```bash
sudo apt-get install libpcap-dev
```

**macOS:**
```bash
brew install libpcap
```

**Windows:**
Download and install WinPcap or Npcap from https://nmap.org/npcap/

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Packet-Capture
```

2. Install backend dependencies:
```bash
cd packet-sniffer
npm install
```

3. Install frontend dependencies:
```bash
cd ../packet-ui
npm install
```

## Usage

### Running the Backend

```bash
cd packet-sniffer
npm run dev
```

This starts the packet sniffer server on port 8080.

### Running the Frontend

```bash
cd packet-ui
npm run dev
```

This starts the development server (typically on http://localhost:5173).

### Building for Production

Backend:
```bash
cd packet-sniffer
npm run build
npm start
```

Frontend:
```bash
cd packet-ui
npm run build
npm run preview
```

## Configuration

### Packet Sniffer

The sniffer automatically detects available network interfaces and uses the first one. To change this, modify `src/sniffer.ts`.

Current filter: `"tcp or udp"` - captures only TCP and UDP traffic.

### Alert Patterns

Sensitive data patterns are defined in `src/analyzer.ts`. Current patterns include:
- Passwords
- Authorization tokens
- SSH keys

### Suricata Integration

To enable Suricata alerts, ensure Suricata is running and configured to output to a file that the application can read. Modify `src/suricata.ts` for custom paths.



## Security Considerations

- This tool captures network traffic and may contain sensitive information
- Use only on networks you have permission to monitor
- Be aware of local privacy laws and regulations
- Consider running in isolated environments for testing

## Development

### Project Structure

```
Packet-Capture/
├── packet-sniffer/          # Backend Node.js application
│   ├── src/
│   │   ├── analyzer.ts      # Payload analysis logic
│   │   ├── server.ts        # Main server entry point
│   │   ├── sniffer.ts       # Packet capture implementation
│   │   ├── socket.ts        # WebSocket communication
│   │   └── suricata.ts      # Suricata integration
│   ├── package.json
│   └── tsconfig.json
├── packet-ui/               # Frontend React application
│   ├── src/
│   │   ├── App.tsx          # Main application component
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

### Adding New Patterns

To add new detection patterns, edit the `PATTERNS` array in `packet-sniffer/src/analyzer.ts`:

```typescript
const PATTERNS = [
    /password/i,
    /token=/i,
    /authorization/i,
    /ssh-rsa/i,
    /api[_-]?key/i,
    /secret/i,
    /private[_-]?key/i,
    /bearer\s+/i,
    /aws[_-]?secret/i,
    /database[_-]?url/i,
    /connection[_-]?string/i,
    /jwt/i
    ///your-new-pattern/i  // Add your regex here
];
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License - see individual package.json files for details.

## Disclaimer

This tool is for educational and security research purposes. Users are responsible for complying with applicable laws and regulations when using network monitoring tools.
