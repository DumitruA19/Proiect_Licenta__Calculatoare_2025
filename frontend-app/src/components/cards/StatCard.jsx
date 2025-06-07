const StatCard = ({ title, value, icon }) => {
    return (
      <div className="bg-white rounded-2xl shadow p-6 flex items-center space-x-4 hover:shadow-lg transition">
        <div className="text-purple-600 text-4xl">{icon}</div>
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    );
  };
  
  export default StatCard;
  