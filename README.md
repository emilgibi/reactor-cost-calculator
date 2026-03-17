# Reactor Cost Calculator

A comprehensive web-based cost calculator for 10 KL reactor specifications with real-time cost breakdown, commodity analysis, and scenario planning.

## Features

### 📊 Input Page
- Configure reactor specifications:
  - Capacity (1-10 KL) with dynamic scaling
  - Shell diameter and thickness
  - Motor type (Flameproof/Non-Flameproof)
  - Mechanical seal options (Single/Double/Gland)
  - Blade type (Gate anchor/Turbine)
  - Limpet configuration with OD and pitch
  - Finish options (Mirror/Normal)
- Save and load configurations
- Real-time validation with tooltips

### 📈 Output & Analysis Page
- **Calculation Breakdown**: Material weights, cost components, total costs
- **Commodity Analysis**: Cost contribution by material type with pie charts
- **5-Year Forecast**: Projected costs with inflation assumptions (line chart)
- **Commodity Scenarios**: Impact analysis of 10% changes in SS304, MS, and labor
- **Specification Scenarios**: Impact of 10% changes in specifications
- Print-friendly reports

### ⚙️ Assumptions & Values Page
- Manage material costs (SS304, MS) per kg
- Labor costs configuration
- Material density values
- Brought-out component costs
- Overhead and profit percentages
- Forecast inflation rates
- Scaling factor reference table

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for UI components
- **Recharts** for data visualization
- **React Context API** for state management
- **localStorage** for data persistence

## Installation & Setup

### Step 1: Install Node.js
- Download from: https://nodejs.org/ (LTS version)
- Install and verify with `node --version` and `npm --version`

### Step 2: Create Project
```bash
cd Desktop
mkdir reactor-cost-calculator
cd reactor-cost-calculator
npx create-react-app . --template typescript
npm install @mui/material @mui/icons-material @emotion/react @emotion/styled recharts
```

### Step 3: Create Folder Structure
```bash
mkdir src\components
mkdir src\context
mkdir src\pages
mkdir src\styles
mkdir src\utils
```

### Step 4: Add Files
Copy all provided TypeScript and CSS files to their respective directories.

### Step 5: Run Application
```bash
npm start
```

The application will open at `http://localhost:3000`

## File Structure

```
reactor-cost-calculator/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   └── Navigation.tsx
│   ├── context/
│   │   └── ReactorContext.tsx
│   ├── pages/
│   │   ├── InputPage.tsx
│   │   ├── OutputPage.tsx
│   │   └── AssumptionsPage.tsx
│   ├── App.tsx
│   ├── App.css
│   ├── index.tsx
│   ├── index.css
│   └── react-app-env.d.ts
├── package.json
├── tsconfig.json
├── README.md
└── .gitignore
```

## Usage

1. **Input Page**: Enter reactor specifications and save configurations
2. **Calculate**: Click "Calculate Costs" to compute all costs
3. **Output & Analysis**: View cost breakdown, charts, and scenario analyses
4. **Assumptions**: Adjust cost rates and recalculate as needed
5. **Print**: Generate PDF reports from the Output page

## Key Features

✅ Dynamic scaling based on reactor capacity (1-10 KL)
✅ Real-time cost calculations
✅ Multiple scenario analyses
✅ 5-year cost forecasting
✅ Save/Load configurations
✅ Professional charts and visualizations
✅ Print-friendly reports
✅ Responsive design for all devices

## Cost Calculation Formula

**Base Calculation:**
- Material Cost = (Material Weight × Unit Cost)
- Total Cost = Fabrication Cost + Overhead + Profit

**Scaling:**
- Scaling Factor = 0.3 + (Capacity - 1) × 0.078 (for capacity < 10 KL)
- All material weights and labor scale proportionally

## Default Assumptions

| Component | Rate |
|-----------|------|
| SS304 Plate | ₹210/kg |
| MS Plate | ₹65/kg |
| SS Labor | ₹28/kg |
| MS Labor | ₹17/kg |
| Overhead | 10% |
| Profit | 30% |
| Inflation Rate | 5% p.a. |

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT License