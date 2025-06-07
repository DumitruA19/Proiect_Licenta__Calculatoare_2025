import axios from 'axios';

const BASE_URL = 'http://localhost:5000'; // schimbă cu URL-ul tău dacă rulezi pe alt port

const tokenAdmin = 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjIsInJvbGUiOiJhZG1pbl9zZWRpdSIsInNlZGl1X2lkIjoyLCJpYXQiOjE3NDg2MzEyNjIsImV4cCI6MTc0ODg5MDQ2Mn0.ARh2wdUXv58RLuICmDU4uLoDz0D8oQv_5hgCXdmDqVc';    // înlocuiește cu token JWT admin
const tokenMecanic = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjcsInJvbGUiOiJtZWNhbmljIiwic2VkaXVfaWQiOjIsImlhdCI6MTc0ODYzMTMwOCwiZXhwIjoxNzQ4ODkwNTA4fQ.44KI1a2tlIz8vncGv5d1drYIHmhxsZv_joOqW-0t2s8'; // înlocuiește cu token JWT mecanic

const main = async () => {
  try {
    console.log('--- PAS 1: Admin trimite cerere de reparație ---');
    const repairRequest = await axios.post(
      `${BASE_URL}/reparatii`,
      {
        masina_id: 23,
        descriere: 'Verificare frâne',
        sediu_id: 2 // adaugă sediu_id (ex: 1)
      },
      {
        headers: { Authorization: `Bearer ${tokenAdmin}` },
      }
    );
    console.log('Cerere trimisă:', repairRequest.data);

    console.log('--- PAS 2: Mecanicul vede cererile ---');
    const cereri = await axios.get(`${BASE_URL}/reparatii/mecanic`, {
      headers: { Authorization: `Bearer ${tokenMecanic}` },
    });
    console.log('Cereri disponibile:', cereri.data);

    const cerereId = cereri.data[0]?.id;
    if (!cerereId) {
      console.error('Nicio cerere disponibilă.');
      return;
    }

    console.log('--- PAS 3: Mecanicul acceptă cererea ---');
    await axios.patch(`${BASE_URL}/reparatii/${cerereId}/accepta`, {}, {
      headers: { Authorization: `Bearer ${tokenMecanic}` },
    });
    console.log('Cerere acceptată.');

    console.log('--- PAS 4: Mecanicul finalizează reparația ---');
    await axios.patch(`${BASE_URL}/reparatii/${cerereId}`, {
      parts_cost: 200,
      manopera_cost: 150,
      status: 'completed'
    }, {
      headers: { Authorization: `Bearer ${tokenMecanic}` },
    });
    console.log('Reparație finalizată.');

    console.log('Test complet! 🎉');
  } catch (error) {
    console.error('Eroare în test:', error.response?.data || error.message);
  }
};

main();
