import './TaskMasterLoader.css';

const TaskMasterLoader = ({ message = "Cargando..." }) => {
  return (
    <div className="tm-loader-container">
      <div className="tm-loader-ring">
        <div className="tm-loader-ring-inner"></div>
      </div>
      <div className="tm-loader-text">{message}</div>
      <div className="tm-loader-progress"></div>
    </div>
  );
};

export default TaskMasterLoader;