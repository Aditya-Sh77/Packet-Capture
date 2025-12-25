# Packet-Capture

A real-time network packet capture and analysis system with security alerting capabilities. This project consists of a Node.js backend for packet sniffing and a React frontend for visualization.

## Features

- **Real-time Packet Capture**: Captures TCP and UDP packets using libpcap
- **Payload Analysis**: Scans packet payloads for sensitive patterns (passwords, tokens, SSH keys, etc.)
- **Security Alerts**: Generates alerts based on severity levels (low, medium, high)
- **Suricata Integration**: Reads alerts from Suricata intrusion detection system
- **Web UI**: Modern React interface with real-time updates via WebSocket
- **Multiple Payload Views**: ASCII, hex, and preview representations of packet data

## Architecture

### Backend (packet-sniffer/)
- **Language**: TypeScript/Node.js
- **Key Components**:
  - `sniffer.ts`: Packet capture using 'cap' library
  - `analyzer.ts`: Payload analysis and pattern matching
  - `server.ts`: Main server entry point
  - `socket.ts`: WebSocket communication with frontend
  - `suricata.ts`: Suricata alert integration

### Frontend (packet-ui/)
- **Framework**: React + Vite
- **Styling**: Tailwind CSS
- **Real-time Updates**: Socket.IO client for live alerts

## Prerequisites

- Node.js (v16+)
- npm or yarn
- libpcap (system dependency for packet capture)
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

**Windows:** Install WinPcap or Npcap

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

This starts the packet sniffer on port 8080 and begins capturing packets.

### Running the Frontend

```bash
cd packet-ui
npm run dev
```

Open http://localhost:5173 in your browser to view the UI.

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

### Packet Capture Device

The sniffer automatically selects the first available network device. To specify a different device, modify `sniffer.ts`:

```typescript
const device = devices[0].name; // Change index or specify device name
```

### Alert Patterns

Sensitive patterns are defined in `analyzer.ts`:

```typescript
const PATTERNS = [
  /password/i,
  /token=/i,
  /authorization/i,
  /ssh-rsa/i
];
```

Add or modify regex patterns as needed.

### Suricata Integration

Ensure Suricata is configured to output alerts to a file that `suricata.ts` can read. Update the file path in `suricata.ts` if necessary.

## Security Considerations

- **Permissions**: Packet capture requires root/administrative privileges
- **Network Monitoring**: Only monitor networks you have permission to access
- **Data Handling**: Payload data may contain sensitive information
- **Production Use**: Implement proper authentication and authorization

## Development

### Project Structure

```
Packet-Capture/
├── packet-sniffer/          # Backend
│   ├── src/
│   │   ├── analyzer.ts      # Payload analysis
│   │   ├── server.ts        # Main server
│   │   ├── sniffer.ts       # Packet capture
│   │   ├── socket.ts        # WebSocket handling
│   │   └── suricata.ts      # IDS integration
│   ├── package.json
│   └── tsconfig.json
├── packet-ui/               # Frontend
│   ├── src/
│   │   ├── App.tsx          # Main component
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

### Adding New Alert Types

1. Update the `Alert` interface in `packet-ui/src/types/alert.ts`
2. Modify the analysis logic in `analyzer.ts`
3. Update the UI components to display new fields

## Troubleshooting

### No Capture Devices Found
- Ensure libpcap is installed
- Run with elevated privileges: `sudo npm run dev`
- Check network interface permissions

### Connection Issues
- Verify backend is running on port 8080
- Check firewall settings
- Ensure WebSocket connections are allowed

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Check TypeScript compilation: `npm run build`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Disclaimer

This tool is for educational and authorized security testing purposes only. Use responsibly and in compliance with applicable laws and regulations.
