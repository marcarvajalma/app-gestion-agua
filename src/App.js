import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { format, parseISO } from 'date-fns';
import GoogleLoginButton from './GoogleLoginButton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ScatterChart, Scatter, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// Valores específicos para cada label
//Valores específicos para cada label
const specificValues = {
  ducha: { morning: 50000, afternoon: 30000, night: 40000 }, // Ducha
  toaleta: { morning: 18000, afternoon: 12000, night: 15000 }, // Inodoro
  inodoro: { morning: 9000, afternoon: 7000, night: 6000 }, // Lavamanos
  lavadora: { morning: 80000, afternoon: 80000, night: 0 }, // Lavadora
  lavaplatos: { morning: 60000, afternoon: 60000, night: 0 }, // Lavaplatos
};

// Estilos personalizados
const Container = styled.div`
  font-family: "Quicksand", serif;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-family: "Quicksand", serif;
  text-align: center;
  color: #2c3e50;
  font-size: 2rem;
  margin-bottom: 20px;
`;

const Button = styled.button`
  font-family: "Quicksand", serif;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2980b9;
  }
`;

const FiltersContainer = styled.div`
  font-family: "Quicksand", serif;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    flex-direction: row;
    justify-content: center;
  }
`;

const Input = styled.input`
  font-family: "Quicksand", serif;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
`;

const Select = styled.select`
  font-family: "Quicksand", serif;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
`;

// Nuevo componente para mostrar las listas de consejos o mensajes de éxito
const SavingsList = ({ savings, excessLiters }) => {
  if (savings === 'Ahorro Eficiente') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#27ae60' }}>
          <li>¡Gran trabajo! 🌍💚 Estás contribuyendo al ahorro de agua y al cuidado del planeta.</li>
          <li>Dato curioso 🤓: Solo el 3% del agua del mundo es dulce, y menos del 1% es accesible para el consumo humano.</li>
          <li>Sabías que... 🌱 Ahorrar agua también reduce tu huella de carbono, ya que su tratamiento y distribución consumen energía.</li>
          <li>¡Tu esfuerzo cuenta! 👏 Si todas las personas ahorraran 10 litros al día, podríamos abastecer de agua a millones de personas en el mundo.</li>
          <li>Eres un ejemplo a seguir ⭐: Comparte tu logro con tu familia y amigos para motivarlos a ahorrar agua también.</li>
        </ul>
      </motion.div>
    );
  } else {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <ul style={{ listStyleType: 'disc', paddingLeft: '20px', color: '#e74c3c' }}>
          <li>Revisa fugas 💧: Un grifo que gotea puede desperdiciar hasta 30 litros de agua al día.</li>
          <li>Reduce el tiempo de ducha 🚿: Cada minuto menos en la ducha ahorra hasta 12 litros de agua.</li>
          <li>Usa sanitarios de bajo consumo 🚽: Puedes ahorrar hasta un 50% de agua en cada descarga.</li>
          <li>No dejes correr el agua 🚰: Al lavar platos o cepillarte los dientes, cierra el grifo cuando no lo necesites.</li>
          <li>Riega en horarios adecuados 🌿: Regar en la noche o temprano en la mañana evita la evaporación innecesaria.</li>
          <li>Lava la ropa con carga completa 🧺: Ahorrarás hasta 80 litros de agua por cada ciclo de lavado.</li>
          <li>Usa un balde en lugar de la manguera 🚗: Para lavar el carro, usa un balde y esponja en vez de una manguera abierta.</li>
        </ul>
        {excessLiters > 0 && (
          <p style={{ color: '#e74c3c', fontWeight: 'bold' }}>
            Gasto adicional: {excessLiters.toFixed(2)} litros
          </p>
        )}
      </motion.div>
    );
  }
};

const App = () => {
  const [data, setData] = useState([]); // Datos del CSV
  const [filteredData, setFilteredData] = useState([]); // Datos filtrados por fecha y label
  const [selectedDate, setSelectedDate] = useState(''); // Fecha seleccionada para filtrar
  const [selectedLabel, setSelectedLabel] = useState(''); // Label seleccionado para filtrar
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Estado de autenticación
  const [uniqueLabels, setUniqueLabels] = useState([]); // Lista de labels únicos
  const [savingsText, setSavingsText] = useState(''); // Texto de ahorro
  const [excessLiters, setExcessLiters] = useState(0); // Litros de más gastados

  // Restaurar el estado de autenticación al cargar la página
  useEffect(() => {
    const savedLoginState = localStorage.getItem('isLoggedIn');
    if (savedLoginState === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Cargar los datos del CSV cuando el usuario inicie sesión
  useEffect(() => {
    if (isLoggedIn) {
      Papa.parse('/res_evt.csv', {
        download: true,
        header: true,
        complete: (result) => {
          // Filtrar filas que no tengan un timestamp válido
          const validData = result.data.filter((row) => row.timestamp && row.label);
          setData(validData);
          setFilteredData(validData);

          // Obtener la lista de labels únicos
          const labels = [...new Set(validData.map((item) => item.label))];
          setUniqueLabels(labels);

          // Establecer la fecha seleccionada por defecto como la fecha actual
          const today = format(new Date(), 'yyyy-MM-dd');
          setSelectedDate(today);
        },
      });
    }
  }, [isLoggedIn]);

  // Manejar el cambio de fecha y label para filtrar los datos
  useEffect(() => {
    let filtered = data;

    if (selectedDate) {
      filtered = filtered.filter((item) => {
        if (!item.timestamp) return false; // Ignorar filas sin timestamp
        const itemDate = format(parseISO(item.timestamp), 'yyyy-MM-dd');
        return itemDate === selectedDate;
      });
    }

    if (selectedLabel) {
      filtered = filtered.filter((item) => item.label === selectedLabel);
    }

    setFilteredData(filtered);
  }, [selectedDate, selectedLabel, data]);

  // Manejar el éxito del login
  const handleLoginSuccess = (response) => {
    console.log('Login Success:', response);
    setIsLoggedIn(true);
    localStorage.setItem('isLoggedIn', 'true'); // Guardar el estado de autenticación
  };

  // Manejar el fallo del login
  const handleLoginFailure = (response) => {
    console.log('Login Failed:', response);
  };

  // Manejar el cierre de sesión
  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('isLoggedIn'); // Eliminar el estado de autenticación
    setData([]);
    setFilteredData([]);
    setSelectedDate('');
    setSelectedLabel('');
    setSavingsText('');
    setExcessLiters(0);
  };

  // Función para agrupar los datos por horas y calcular el promedio de volume
  const groupDataByTime = (data, label) => {
    const groupedData = {
      morning: { total: 0, count: 0 },
      afternoon: { total: 0, count: 0 },
      night: { total: 0, count: 0 },
    };

    data.forEach((item) => {
      if (!item.timestamp) return;

      const hour = new Date(item.timestamp).getHours();

      if (hour >= 0 && hour < 12) { // Mañana (12:00 am - 11:59 am)
        groupedData.morning.total += parseFloat(item.volume);
        groupedData.morning.count += 1;
      } else if (hour >= 12 && hour < 19) { // Tarde (12:00 pm - 6:59 pm)
        groupedData.afternoon.total += parseFloat(item.volume);
        groupedData.afternoon.count += 1;
      } else if (hour >= 19 && hour <= 23) { // Noche (7:00 pm - 11:59 pm)
        groupedData.night.total += parseFloat(item.volume);
        groupedData.night.count += 1;
      }
    });

    // Obtener los valores específicos para el label seleccionado
    const specific = specificValues[label] || { morning: 0, afternoon: 0, night: 0 };

    const result = [
      { 
        name: 'Mañana', 
        volume: groupedData.morning.count > 0 ? groupedData.morning.total / groupedData.morning.count : 0,
        target: specific.morning // Valor específico para la mañana
      },
      { 
        name: 'Tarde', 
        volume: groupedData.afternoon.count > 0 ? groupedData.afternoon.total / groupedData.afternoon.count : 0,
        target: specific.afternoon // Valor específico para la tarde
      },
      { 
        name: 'Noche', 
        volume: groupedData.night.count > 0 ? groupedData.night.total / groupedData.night.count : 0,
        target: specific.night // Valor específico para la noche
      },
    ];

    return result;
  };

  // Función para determinar si hay ahorro eficiente y calcular los litros de más
  const checkSavings = (barChartData) => {
    let totalExcess = 0;
    const hasSavings = barChartData.every((item) => {
      const excess = item.volume - item.target;
      if (excess > 0) totalExcess += excess;
      return item.volume <= item.target;
    });

    setSavingsText(hasSavings ? 'Ahorro Eficiente' : 'No Hay Ahorro');
    setExcessLiters(totalExcess);
  };

  // Función para preparar los datos de dispersión
  const prepareScatterData = (data) => {
    return data.map((item) => {
      if (!item.timestamp) return null;

      const hour = new Date(item.timestamp).getHours();
      return {
        hour: hour,
        volume: parseFloat(item.volume),
      };
    }).filter((item) => item !== null); // Filtrar filas inválidas
  };

  // Datos para la gráfica de barras
  const barChartData = groupDataByTime(filteredData, selectedLabel);

  // Verificar el ahorro cada vez que cambien los datos de la gráfica de barras
  useEffect(() => {
    checkSavings(barChartData);
  }, [barChartData]);

  // Datos para la gráfica de dispersión
  const scatterData = prepareScatterData(filteredData);

  // Función para calcular la línea de tendencia (regresión lineal simple)
  const calculateTrendLine = (data) => {
    const n = data.length;
    const sumX = data.reduce((sum, point) => sum + point.hour, 0);
    const sumY = data.reduce((sum, point) => sum + point.volume, 0);
    const sumXY = data.reduce((sum, point) => sum + point.hour * point.volume, 0);
    const sumX2 = data.reduce((sum, point) => sum + point.hour * point.hour, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((point) => ({
      hour: point.hour,
      volume: slope * point.hour + intercept,
    }));
  };

  // Datos para la línea de tendencia
  const trendLineData = calculateTrendLine(scatterData);

  // Formatear la fecha seleccionada para mostrarla en el título
  const formattedDate = selectedDate ? format(parseISO(selectedDate), 'dd/MM/yyyy') : '';

  // Texto del label seleccionado para el título
  const labelText = selectedLabel ? selectedLabel : 'Todas las fuentes';

  return (
    <Container>
      {!isLoggedIn ? (
        // Mostrar el botón de login si el usuario no está autenticado
        <GoogleLoginButton onSuccess={handleLoginSuccess} onFailure={handleLoginFailure} />
      ) : (
        // Mostrar los datos si el usuario está autenticado
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <Title>Datos del {formattedDate} de {labelText}</Title>
          <Button onClick={handleLogout}>Cerrar sesión</Button>
          <FiltersContainer>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <Select
              value={selectedLabel}
              onChange={(e) => setSelectedLabel(e.target.value)}
            >
              <option value="">Todas las fuentes</option>
              {uniqueLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </Select>
          </FiltersContainer>

          {/* Gráfica de barras */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="volume" fill="#8884d8" name="Consumo Promedio" />
              <Bar dataKey="target" fill="#82ca9d" name="Consumo Eficiente" />
            </BarChart>
          </ResponsiveContainer>

          {/* Lista de consejos o mensajes de éxito */}
          <SavingsList savings={savingsText} excessLiters={excessLiters} />

          {/* Gráfica de dispersión con línea de tendencia */}
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart
              data={scatterData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="hour" 
                name="Hora" 
                domain={[0, 23]} 
                ticks={[0, 4, 8, 12, 16, 20, 23]} 
              />
              <YAxis 
                type="number" 
                dataKey="volume" 
                name="Cantidad" 
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Legend />
              <Scatter name="Consumo de Agua" data={scatterData} fill="#8884d8" />
              <Line 
                type="monotone" 
                dataKey="volume" 
                data={trendLineData} 
                stroke="#ff7300" 
                dot={false} 
                name="Línea de Tendencia" 
              />
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </Container>
  );
};

export default App;