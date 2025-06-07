import Sidebar from './Sidebar';
import Topbar from './Topbar';

const LayoutWrapper = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Topbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:ml-64">{children}</main>
      </div>
    </div>
  );
};

export default LayoutWrapper;


