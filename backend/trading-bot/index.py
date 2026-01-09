import json
import os
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''API для управления торговым ботом Pocket Option'''
    
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        params = event.get('queryStringParameters', {}) or {}
        action = params.get('action', '')
        
        if method == 'GET' and action == 'signals':
            cur.execute("""
                SELECT pair_name, price, change_percent, volatility, 
                       signal_type, probability, expiration, created_at
                FROM currency_signals 
                WHERE created_at >= NOW() - INTERVAL '1 hour'
                ORDER BY probability DESC
                LIMIT 20
            """)
            signals = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'signals': signals}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'trades':
            user_id = params.get('user_id', '1')
            
            cur.execute("""
                SELECT id, pair, trade_type, open_price, close_price, 
                       profit, expiration, status, opened_at, closed_at
                FROM trades 
                WHERE user_id = %s
                ORDER BY opened_at DESC
                LIMIT 50
            """, (user_id,))
            trades = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'trades': trades}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'settings':
            body = json.loads(event.get('body', '{}'))
            pocket_id = body.get('pocket_option_id')
            is_connected = body.get('is_connected', False)
            bot_active = body.get('bot_active', False)
            loss_limit = body.get('loss_limit', 5.0)
            trade_interval = body.get('trade_interval', 1)
            
            cur.execute("""
                INSERT INTO user_settings 
                (pocket_option_id, is_connected, bot_active, loss_limit, trade_interval)
                VALUES (%s, %s, %s, %s, %s)
                ON CONFLICT (pocket_option_id) 
                DO UPDATE SET 
                    is_connected = EXCLUDED.is_connected,
                    bot_active = EXCLUDED.bot_active,
                    loss_limit = EXCLUDED.loss_limit,
                    trade_interval = EXCLUDED.trade_interval,
                    updated_at = CURRENT_TIMESTAMP
                RETURNING id, pocket_option_id, is_connected, bot_active, balance
            """, (pocket_id, is_connected, bot_active, loss_limit, trade_interval))
            
            result = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'settings': result}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'POST' and action == 'trade':
            body = json.loads(event.get('body', '{}'))
            user_id = body.get('user_id', 1)
            pair = body.get('pair')
            trade_type = body.get('type')
            open_price = body.get('open_price')
            expiration = body.get('expiration')
            
            cur.execute("""
                INSERT INTO trades 
                (user_id, pair, trade_type, open_price, expiration, status)
                VALUES (%s, %s, %s, %s, %s, 'OPEN')
                RETURNING id, pair, trade_type, open_price, expiration, opened_at
            """, (user_id, pair, trade_type, open_price, expiration))
            
            trade = cur.fetchone()
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True, 'trade': trade}, default=str),
                'isBase64Encoded': False
            }
        
        elif method == 'GET' and action == 'balance':
            user_id = params.get('user_id', '1')
            
            cur.execute("""
                SELECT balance, bot_active, is_connected 
                FROM user_settings 
                WHERE id = %s
            """, (user_id,))
            
            result = cur.fetchone()
            
            if not result:
                result = {'balance': 1000.00, 'bot_active': False, 'is_connected': False}
            
            cur.execute("""
                SELECT SUM(profit) as total_profit
                FROM trades 
                WHERE user_id = %s AND status = 'CLOSED'
            """, (user_id,))
            
            profit_data = cur.fetchone()
            total_profit = float(profit_data['total_profit'] or 0)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'balance': float(result['balance']) if result else 1000.0,
                    'total_profit': total_profit,
                    'bot_active': result.get('bot_active', False) if result else False,
                    'is_connected': result.get('is_connected', False) if result else False
                }),
                'isBase64Encoded': False
            }
        
        return {
            'statusCode': 404,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Endpoint not found'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()