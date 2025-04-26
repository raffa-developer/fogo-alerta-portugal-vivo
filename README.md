# Fogo Alerta Portugal

A real-time wildfire monitoring system for Portugal, providing comprehensive information about active fires, risk levels, and weather conditions.

## Features

### Real-time Fire Monitoring

- Live tracking of active wildfires across Portugal
- Detailed incident information including:
  - Location and district
  - Status (Active, Contained, Extinguished)
  - Resources deployed (operational personnel, ground vehicles, aerial means)
  - Start time and duration
  - Nature and origin of the incident

### Visual Indicators

- Dynamic icons based on incident status:
  - 🔥 Red fire icon for active fires with deployed resources
  - 📞 Blue phone icon for initial calls without resources
  - ✅ Green check icon for extinguished fires
- Color-coded risk levels for each district
- Interactive map with detailed popups

### Weather and Risk Information

- Real-time weather conditions
- District-specific risk levels
- Temperature monitoring
- Humidity and wind speed data

### User Interface

- Responsive design for all devices
- Interactive map with zoom and pan capabilities
- Sortable list of active incidents
- Detailed incident information in popups
- Real-time updates

## Technical Stack

- React with TypeScript
- Leaflet for interactive maps
- Tailwind CSS for styling
- React Query for data fetching
- OpenStreetMap for base maps
- IPMA API for weather data
- Fogos.pt API for fire incident data

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/yourusername/fogo-alerta-portugal.git
```

2. Install dependencies:

```bash
cd fogo-alerta-portugal
npm install
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Data provided by [Fogos.pt](https://fogos.pt)
- Weather data from [IPMA](https://www.ipma.pt)
- Base maps from [OpenStreetMap](https://www.openstreetmap.org)

---

**Author:** Rafa  
**Project:** Fogo Alerta Portugal
