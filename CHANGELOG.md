# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup
- Comprehensive architecture documentation (ARCHITECTURE.md)
- Agent task delegation system (AGENTS.md)
- Project README and documentation structure
- Directory structure for frontend, backend, and infrastructure
- Contributing guidelines (CONTRIBUTING.md)
- Quick start guide for developers (QUICK_START.md)
- External access setup guide (docs/EXTERNAL_ACCESS.md)
- MIT License

### Architecture
- **LXC Deployment Strategy**: Native Proxmox LXC containers (not Docker)
- **Process Management**: PM2 for Node.js backend
- **Web Server**: Nginx for frontend static files
- **Reverse Proxy**: Nginx Proxy Manager (separate LXC)
- **CDN/DNS**: Cloudflare integration
- **Network**: UniFi gateway configuration
- **Database**: Native PostgreSQL 16 service
- **SSL/TLS**: Let's Encrypt via NPM
- Complete external access stack documentation

### Changed
- Deployment strategy from Docker to LXC containers
- Agent 1 tasks updated for LXC deployment focus
- Production deployment uses native services (not containers)
- Development workflow supports both native PostgreSQL and Docker (optional)

### Project Structure
- `/backend` - Node.js + Express + TypeScript + Prisma
- `/frontend` - React + TypeScript + Vite
- `/docker` - Docker and Docker Compose configurations
- `/scripts` - Automation scripts
- `/docs` - Additional documentation

### Documentation
- ARCHITECTURE.md - Comprehensive system architecture
- AGENTS.md - Detailed agent task delegation
- README.md - Project overview
- CONTRIBUTING.md - Contribution guidelines
- LICENSE - MIT License

## [0.1.0] - 2025-11-23

### Added
- Initial repository setup
- Project planning and architecture design
- Agent-based development workflow
- Comprehensive documentation framework

---

## Version History

### Planned Releases

#### v0.2.0 - Foundation Phase
- Infrastructure setup (Docker, database)
- Backend core (Express, Prisma)
- Authentication system
- Frontend core (React, routing)

#### v0.3.0 - Core Features Phase
- Account management (CRUD)
- Transaction tracking
- API endpoints implementation
- Basic UI components

#### v0.4.0 - Analytics Phase
- Interest calculations
- Payoff projections
- Chart implementations
- Dashboard with analytics

#### v0.5.0 - Polish Phase
- Comprehensive testing
- Complete documentation
- Integration and bug fixes
- Production deployment

#### v1.0.0 - Initial Release
- Complete feature set
- All core functionality
- Production-ready
- Full documentation

---

## Notes

- This project uses AI agents for development
- Each agent is responsible for specific components
- See AGENTS.md for detailed task assignments
- Architecture decisions documented in ARCHITECTURE.md

