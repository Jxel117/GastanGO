import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Container, Row, Col, Card, Button, Navbar } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Registrar componentes de gráficos
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get('/transactions');
        setTransactions(data);
      } catch (error) {
        console.error("Error cargando datos");
      }
    };
    fetchData();
  }, []);

  // Procesar datos para gráficos
  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

  const pieData = {
    labels: ['Ingresos', 'Gastos'],
    datasets: [{
      data: [income, expense],
      backgroundColor: ['#36A2EB', '#FF6384'],
    }]
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" className="px-4 justify-content-between">
        <Navbar.Brand>GastanGO Analytics</Navbar.Brand>
        <div className="d-flex align-items-center gap-3">
            <span className="text-light">Hola, {user?.username}</span>
            <Button variant="outline-light" size="sm" onClick={logout}>Salir</Button>
        </div>
      </Navbar>

      <Container className="mt-4">
        <h3 className="mb-4">Resumen Financiero</h3>
        
        <Row>
          {/* Tarjetas de Resumen */}
          <Col md={4}>
            <Card className="text-center mb-3 border-success">
              <Card.Body>
                <Card.Title>Total Ingresos</Card.Title>
                <h2 className="text-success">${income.toFixed(2)}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="text-center mb-3 border-danger">
              <Card.Body>
                <Card.Title>Total Gastos</Card.Title>
                <h2 className="text-danger">${expense.toFixed(2)}</h2>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
             <Card className="text-center mb-3 border-primary">
              <Card.Body>
                <Card.Title>Balance</Card.Title>
                <h2 className={(income - expense) >= 0 ? "text-primary" : "text-danger"}>
                    ${(income - expense).toFixed(2)}
                </h2>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="mt-4">
          <Col md={6}>
            <Card className="p-3">
                <h5>Distribución</h5>
                <div style={{height: '300px', display:'flex', justifyContent:'center'}}>
                    <Pie data={pieData} />
                </div>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="p-3">
                <h5>Historial Reciente</h5>
                <ul className="list-group list-group-flush">
                    {transactions.slice(0, 5).map(t => (
                        <li key={t.id} className="list-group-item d-flex justify-content-between">
                            <span>{t.category} <small className="text-muted">({new Date(t.date).toLocaleDateString()})</small></span>
                            <span className={t.type === 'income' ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                {t.type === 'income' ? '+' : '-'}${t.amount}
                            </span>
                        </li>
                    ))}
                </ul>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Dashboard;