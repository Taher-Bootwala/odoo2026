import TopNav from '@/components/layout/TopNav';
import Sidebar from '@/components/layout/Sidebar';
import IntroOverlay from '@/components/IntroOverlay';

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <IntroOverlay />
      <div className="dashboard-wrapper" id="dashboard-wrapper">
        <TopNav />
        <div className="app-container">
          <Sidebar />
          <main className="main-content" id="main-content">
            {children}
          </main>
        </div>
      </div>
    </>
  );
}
