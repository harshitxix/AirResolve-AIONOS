# AirResolve AI — Frontend

This is the React and Vite frontend for AirResolve AI, deployed on Vercel at [https://air-resolve-aionos.vercel.app/](https://air-resolve-aionos.vercel.app/).

## Features
- Real-Time Customer and Booking Inspector: Displays active customer details, PNR status, and compensation entitlements.
- Auditing and Live Action Feed: Shows executed rebookings, meal vouchers, refund IDs, or escalation tickets.
- Scenario Quick-Loader: One-click loading for Priya Nair, Arvind Kulkarni, and Meher Kaur test personas.
- Glassmorphic UI: Built with Tailwind CSS and Lucide icons.

## Environment Configuration

In development, Vite defaults to `http://localhost:8000`. In production on Vercel, set the following environment variable:

```env
VITE_API_URL=https://<your-render-backend-url>
```

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
