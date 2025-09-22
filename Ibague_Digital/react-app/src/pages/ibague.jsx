import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {
  ActivityIcon,
  GlobeIcon,
  SmartphoneIcon,
  TvIcon,
  NewspaperIcon,
} from 'lucide-react';

// Datos de ejemplo para la visualización. En una aplicación real, estos datos se cargarían desde una API.
// Datos generados basados en una suposición de hábitos de consumo de medios en Ibagué.
const mockData = [
  { medio: 'Redes Sociales', 'Tiempo Promedio (horas/día)': 2.5, fill: '#60a5fa' },
  { medio: 'Streaming', 'Tiempo Promedio (horas/día)': 1.8, fill: '#f87171' },
  { medio: 'Noticias Online', 'Tiempo Promedio (horas/día)': 1.2, fill: '#34d399' },
  { medio: 'Videojuegos', 'Tiempo Promedio (horas/día)': 1.5, fill: '#c084fc' },
  { medio: 'Radio Online', 'Tiempo Promedio (horas/día)': 0.9, fill: '#fbbf24' },
];

// --- Componentes personalizados para reemplazar shadcn/ui ---
const Card = ({ className, children }) => (
  <div className={`rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ className, children }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ className, children }) => (
  <h2 className={`text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 ${className}`}>
    {children}
  </h2>
);

const CardDescription = ({ className, children }) => (
  <p className={`text-sm text-gray-500 dark:text-gray-400 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ className, children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);

// --- Componente principal de la aplicación ---
// Todos los componentes, lógica y estilos están contenidos en este archivo para facilitar su uso.
const App = () => {
  // Estado para almacenar los datos de consumo
  const [consumoData, setConsumoData] = useState([]);
  // Estado para controlar el estado de carga
  const [loading, setLoading] = useState(true);

  // useEffect se utiliza para simular la carga de datos de una API.
  // Se ejecutará solo una vez al montar el componente.
  useEffect(() => {
    // Simular un retraso en la carga de datos para mostrar un estado de carga.
    const fetchData = () => {
      setLoading(true);
      setTimeout(() => {
        setConsumoData(mockData);
        setLoading(false);
      }, 1500); // 1.5 segundos de simulación de carga
    };

    fetchData();
  }, []);

  // --- Renderización del componente ---
  return (
    // Contenedor principal de la aplicación, centrado y con estilos de fondo.
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Encabezado de la aplicación */}
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl lg:text-6xl">
            Ibagué Digital
          </h1>
          <p className="mt-4 text-xl text-gray-600 dark:text-gray-400">
            Hábitos de Consumo de Medios Digitales en Ibagué
          </p>
        </header>

        {/* Sección de visualización de datos */}
        <Card className="w-full bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>
              Datos de Consumo Promedio
            </CardTitle>
            <CardDescription>
              Tiempo promedio diario (en horas) dedicado a diferentes medios digitales.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center p-6">
            {/* Si los datos están cargando, muestra un indicador de carga */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <svg
                  className="animate-spin h-8 w-8 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
            ) : (
              // Si los datos están cargados, muestra el gráfico
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={consumoData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="medio" className="text-xs" stroke="#6b7280" />
                  <YAxis className="text-xs" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="Tiempo Promedio (horas/día)" barSize={40} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Sección de iconos y descripción */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <InfoCard title="Redes Sociales" description="Interacción social online." icon={<ActivityIcon className="h-6 w-6 text-blue-500" />} />
          <InfoCard title="Streaming" description="Contenido de video y música." icon={<TvIcon className="h-6 w-6 text-red-500" />} />
          <InfoCard title="Noticias Online" description="Información y actualidad." icon={<NewspaperIcon className="h-6 w-6 text-green-500" />} />
          <InfoCard title="Videojuegos" description="Entretenimiento interactivo." icon={<SmartphoneIcon className="h-6 w-6 text-purple-500" />} />
          <InfoCard title="Radio Online" description="Audio en directo y podcasts." icon={<GlobeIcon className="h-6 w-6 text-yellow-500" />} />
        </div>
      </div>
    </div>
  );
};

// --- Componente de tarjeta de información reutilizable ---
const InfoCard = ({ title, description, icon }) => (
  <Card className="rounded-xl shadow-md p-4 flex flex-col items-center text-center bg-white dark:bg-gray-800">
    <div className="mb-2 p-2 rounded-full bg-gray-100 dark:bg-gray-700">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
  </Card>
);

// Este es el punto de entrada de la aplicación en el DOM.
// Se asume que existe un elemento con el id 'root' en tu archivo HTML.
// Es importante que este sea el único componente exportado por defecto.
export default App;
