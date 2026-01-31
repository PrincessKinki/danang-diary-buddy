import { neonConfig, Pool } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

export const handler = async (event) => {
  if (event.httpMethod !== 'PUT') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL });
  
  try {
    const { id, places, expenses, itinerary } = JSON.parse(event.body);
    
    if (!id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Trip ID required' })
      };
    }
    
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (places !== undefined) {
      updates.push(`places = $${paramCount}`);
      values.push(JSON.stringify(places));
      paramCount++;
    }
    
    if (expenses !== undefined) {
      updates.push(`expenses = $${paramCount}`);
      values.push(JSON.stringify(expenses));
      paramCount++;
    }
    
    if (itinerary !== undefined) {
      updates.push(`itinerary = $${paramCount}`);
      values.push(JSON.stringify(itinerary));
      paramCount++;
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `UPDATE trips SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    
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
