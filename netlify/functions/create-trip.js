import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL });
  
  try {
    const { destination, startDate, endDate, places } = JSON.parse(event.body);
    
    const result = await pool.query(
      `INSERT INTO trips (destination, start_date, end_date, places, expenses, itinerary)
       VALUES ($1, $2, $3, $4, '[]', '[]')
       RETURNING id`,
      [destination, startDate, endDate, JSON.stringify(places || [])]
    );
    
    return {
      statusCode: 200,
      body: JSON.stringify({ tripId: result.rows[0].id })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  } finally {
    await pool.end();
  }
};
