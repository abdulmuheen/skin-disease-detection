# DermaScan AI - Product Requirements Document

## Original Problem Statement
Build an AI-powered web application for skin disease detection using deep learning. Features include image upload/capture, AI-powered analysis, diagnosis display with confidence scores, treatment suggestions, PDF reports, and medical disclaimers.

## User Personas
1. **General Public** - Seeking preliminary skin condition assessment before doctor visit
2. **Health-conscious individuals** - Wanting to monitor skin changes over time
3. **Parents** - Checking children's skin conditions for initial guidance

## Core Requirements (Static)
- AI-powered skin image analysis using GPT-5.2 Vision
- Support for 10 skin disease classes (acne, eczema, psoriasis, melanoma, ringworm, rosacea, vitiligo, dermatitis, hives, healthy_skin)
- Display diagnosis with confidence score and severity
- Treatment and precaution suggestions (non-prescriptive)
- Downloadable PDF medical-style report
- Medical disclaimers throughout the app
- No authentication (anonymous usage)
- Single session (no history tracking)
- Doctor symbol cursor design
- Medical/Healthcare theme (whites, blues, greens)

## What's Been Implemented (2026-03-25)

### Backend (FastAPI)
- `/api/analyze` - POST endpoint for skin image analysis using GPT-5.2 Vision
- `/api/health` - Health check endpoint
- `/api/conditions` - Get all detectable skin conditions
- `/api/status` - Status check endpoints
- Integration with Emergent LLM key for GPT-5.2 Vision
- Comprehensive skin disease information database

### Frontend (React)
- Landing page with hero section and medical imagery
- Image upload with drag-and-drop (react-dropzone)
- Disclaimer checkbox requirement before analysis
- Animated loading/analyzing state
- Bento grid results layout with:
  - Condition name and severity badge
  - Confidence score with progress bar
  - AI analysis notes
  - Tabbed treatments and precautions
- PDF report generation (jsPDF)
- Custom doctor symbol cursor
- Medical theme with IBM Plex Sans and Figtree fonts
- Framer Motion animations
- Toast notifications (sonner)

### Design
- Medical/Clinical light theme
- Colors: Blue (#1E3A8A), Green (#059669), White backgrounds
- IBM Plex Sans for headings, Figtree for body
- JetBrains Mono for numerical data
- Custom medical cross cursor
- Phosphor Icons for iconography

## Prioritized Backlog

### P0 (Critical)
- [x] Core AI analysis endpoint
- [x] Image upload functionality
- [x] Results display
- [x] PDF report generation
- [x] Medical disclaimers

### P1 (High Priority - Future)
- [ ] Image capture from camera (mobile support)
- [ ] Multiple image comparison
- [ ] Save analysis to database (with opt-in)
- [ ] Email report functionality

### P2 (Medium Priority - Future)
- [ ] User authentication (optional)
- [ ] Analysis history tracking
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Share results to social media

## Next Action Items
1. Add camera capture support for mobile devices
2. Implement image preprocessing/validation before analysis
3. Add more detailed severity indicators
4. Consider integrating with telemedicine services
5. Add accessibility improvements (ARIA labels, screen reader support)

## Technical Architecture
```
Frontend (React) → Backend (FastAPI) → GPT-5.2 Vision API
      ↓                    ↓
   jsPDF           MongoDB (status tracking)
```

## Security Considerations
- Image data is not stored persistently
- All API calls use HTTPS
- Medical disclaimers clearly displayed
- No personal health information collected

## Ethical Considerations
- Clear disclaimer that AI is not a substitute for medical advice
- Urgent alerts for potentially serious conditions (melanoma)
- No diagnosis claims - only informational guidance
- Privacy-first approach (no data retention)
