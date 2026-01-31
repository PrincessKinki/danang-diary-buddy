import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export const handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const tripId = event.queryStringParameters?.id;
  
  if (!tripId) {
    return { 
      statusCode: 400, 
      body: JSON.stringify({ error: 'Trip ID required' }) 
    };
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL });
  
  try {
    const result = await pool.query(
      'SELECT * FROM trips WHERE id = $1',
      [tripId]
    );
    
    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'Trip not found' })
      };
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows[0])
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
