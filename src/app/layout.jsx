import './globals.css'

export const metadata = {
  title: 'CP Prima | Monitoring Warehouse',
  description: 'Logistics Control Center & Company Profile',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
