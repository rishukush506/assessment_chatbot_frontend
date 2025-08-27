# Financial Assessment Chat UI

A React-based conversational interface for conducting financial trait assessments. This application provides an interactive chat experience that evaluates user responses across multiple financial behavioral traits and generates personalized financial personas.

## 🛠️ Tech Stack

- **Framework**: Next.js 15.3.4 (with Turbopack)
- **Frontend**: React 19, TypeScript 5
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn, Radix UI primitives
- **Icons**: Lucide React
- **Backend Integration**: REST API communication

## 📋 Prerequisites

- Node.js (version 18 or higher)
- Backend API server running on `http://localhost:8000`

## 🚀 Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the development server**

   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000`

## 🔗 API Integration

The application expects a backend API with the following endpoints:

### Chat Endpoint

```
POST http://localhost:8000/chat
```

### Persona Generation Endpoint

```
POST http://localhost:8000/persona
```

## 🎨 UI Components from shadcn

The application uses a set of reusable UI components:

- **Button** - Interactive buttons with various styles
- **Input** - Text input fields for chat messages
- **Card** - Container components for messages and assessments
- **Badge** - Labels for trait scores and categories

## 📊 Assessment Flow

1. **Conversation Start** - User begins chatting about financial topics
2. **Trait Evaluation** - Backend analyzes responses and scores traits
3. **Real-time Feedback** - UI displays assessment cards with scores and rationale
4. **Progress Tracking** - Header shows number of traits assessed
5. **Completion** - Chat ends when sufficient data is collected
6. **Persona Generation** - User can generate detailed financial personality profile

## 🎯 Key Features Explained

### Trait Scoring

- Each trait is scored on a scale of 1-5
- Confidence levels are provided on a scale of 1-10
- Multiple assessments per trait are aggregated for final scores

### Assessment Cards

- Appear after user messages when new trait data is available
- Show assessment description, rationale, and scoring
- Include current priority trait and iteration information

### Persona Generation

- Available after at least 3 traits have been assessed
- Generates comprehensive financial personality profile
- Displayed in a modal popup for detailed review

## 🎯 Overview

The Financial Assessment Chat UI is designed to assess six key financial traits through natural conversation:

- **Awareness** - Financial knowledge and understanding
- **Self Control** - Impulse control and discipline
- **Preparedness** - Planning and preparation habits
- **Information Seeking** - Research and due diligence behavior
- **Risk Seeking** - Risk tolerance and appetite
- **Reaction to External Events** - Response to market changes and external factors